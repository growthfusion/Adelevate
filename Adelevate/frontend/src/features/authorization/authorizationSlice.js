// src/features/authorization/authorizationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/supabaseClient";

const initialState = {
  users: [],
  total: 0,
  page: 1,
  pageSize: 12,
  search: "",
  myRole: null,
  session: null,
  updatingUserId: null,
  isLoading: false,
  isSearching: false,
  error: null
};

// Async Thunks
export const fetchSession = createAsyncThunk(
  "authorization/fetchSession",
  async (_, { rejectWithValue }) => {
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.user) {
        return { session: null, myRole: null };
      }

      const { data: meRow, error: meErr } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (meErr) throw new Error(meErr.message);

      return {
        session,
        myRole: meRow?.role || "user"
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUsers = createAsyncThunk(
  "authorization/fetchUsers",
  async ({ page, search, pageSize }, { rejectWithValue }) => {
    try {
      const { data: list, error: rpcErr } = await supabase.rpc("list_users_with_roles", {
        search: search?.trim() || null,
        page_size: pageSize,
        page
      });

      if (rpcErr) throw new Error(rpcErr.message);

      const normalizedUsers = (list || []).map((u) => ({
        ...u,
        platforms: Array.from(new Set((u.platforms || []).map((v) => String(v).toLowerCase())))
      }));

      const { data: countVal, error: cntErr } = await supabase.rpc("count_users", {
        search: search?.trim() || null
      });

      if (cntErr) throw new Error(cntErr.message);

      return {
        users: normalizedUsers,
        total: Number(countVal) || 0,
        page,
        search
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const changeUserRole = createAsyncThunk(
  "authorization/changeUserRole",
  async ({ userId, newRole }, { getState, rejectWithValue }) => {
    try {
      const state = getState().authorization;

      if (newRole !== "SuperAdmin") {
        const { count, error } = await supabase
          .from("user_roles")
          .select("id", { count: "exact", head: true })
          .eq("role", "SuperAdmin");

        if (error) throw new Error(error.message);

        if (count <= 1) {
          const target = state?.users?.find((r) => r.id === userId);
          if (target?.role === "SuperAdmin") {
            throw new Error("Cannot remove the last SuperAdmin.");
          }
        }
      }

      const { error: rpcErr } = await supabase.rpc("set_user_role", {
        target_id: userId,
        new_role: newRole
      });

      if (rpcErr) throw new Error(rpcErr.message);

      let updatedMyRole = state?.myRole;
      if (state?.session?.user?.id === userId) {
        const { data: meRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();
        updatedMyRole = meRow?.role || "user";
      }

      return { userId, newRole, updatedMyRole };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleUserPlatform = createAsyncThunk(
  "authorization/toggleUserPlatform",
  async ({ userId, platform }, { getState, rejectWithValue }) => {
    try {
      const state = getState().authorization;
      const user = state?.users?.find((u) => u.id === userId);

      if (!user) throw new Error("User not found");

      const current = new Set((user.platforms || []).map((v) => String(v).toLowerCase()));

      if (current.has(platform)) {
        current.delete(platform);
      } else {
        current.add(platform);
      }

      const newPlatforms = Array.from(current);

      const { error: rpcErr } = await supabase.rpc("set_user_platforms", {
        target_id: userId,
        new_platforms: newPlatforms
      });

      if (rpcErr) throw new Error(rpcErr.message);

      return { userId, platforms: newPlatforms };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authorizationSlice = createSlice({
  name: "authorization",
  initialState,
  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
    },
    setPage(state, action) {
      state.page = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    setSession(state, action) {
      state.session = action.payload;
    },
    resetAuthorizationState() {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Session
      .addCase(fetchSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.session = action.payload.session;
        state.myRole = action.payload.myRole;
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isSearching = false;
        state.users = action.payload.users;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.search = action.payload.search;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload;
        state.users = [];
        state.total = 0;
      })

      // Change User Role
      .addCase(changeUserRole.pending, (state, action) => {
        state.updatingUserId = action.meta.arg.userId;
        state.error = null;
      })
      .addCase(changeUserRole.fulfilled, (state, action) => {
        state.updatingUserId = null;
        const { userId, newRole, updatedMyRole } = action.payload;

        const userIndex = state.users.findIndex((u) => u.id === userId);
        if (userIndex !== -1) {
          state.users[userIndex].role = newRole;
        }

        if (updatedMyRole) {
          state.myRole = updatedMyRole;
        }
      })
      .addCase(changeUserRole.rejected, (state, action) => {
        state.updatingUserId = null;
        state.error = action.payload;
      })

      // Toggle User Platform
      .addCase(toggleUserPlatform.pending, (state, action) => {
        state.updatingUserId = action.meta.arg.userId;
        state.error = null;
      })
      .addCase(toggleUserPlatform.fulfilled, (state, action) => {
        state.updatingUserId = null;
        const { userId, platforms } = action.payload;

        const userIndex = state.users.findIndex((u) => u.id === userId);
        if (userIndex !== -1) {
          state.users[userIndex].platforms = platforms;
        }
      })
      .addCase(toggleUserPlatform.rejected, (state, action) => {
        state.updatingUserId = null;
        state.error = action.payload;
      });
  }
});

export const { setSearch, setPage, clearError, setSession, resetAuthorizationState } =
  authorizationSlice.actions;

export default authorizationSlice.reducer;

// ============================================
// SAFE SELECTORS (with fallbacks to prevent errors)
// ============================================
export const selectUsers = (state) => state.authorization?.users ?? [];
export const selectTotal = (state) => state.authorization?.total ?? 0;
export const selectPage = (state) => state.authorization?.page ?? 1;
export const selectPageSize = (state) => state.authorization?.pageSize ?? 12;
export const selectSearch = (state) => state.authorization?.search ?? "";
export const selectMyRole = (state) => state.authorization?.myRole ?? null;
export const selectSession = (state) => state.authorization?.session ?? null;
export const selectUpdatingUserId = (state) => state.authorization?.updatingUserId ?? null;
export const selectIsLoading = (state) => state.authorization?.isLoading ?? false;
export const selectIsSearching = (state) => state.authorization?.isSearching ?? false;
export const selectError = (state) => state.authorization?.error ?? null;

export const selectPageCount = (state) => {
  const total = state.authorization?.total ?? 0;
  const pageSize = state.authorization?.pageSize ?? 12;
  return Math.max(1, Math.ceil(total / pageSize));
};
