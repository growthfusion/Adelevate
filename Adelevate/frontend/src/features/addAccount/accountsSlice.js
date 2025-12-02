// src/features/accounts/accountsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addAccount as addAccountService,
  getAllAccounts,
  updateAccount as updateAccountService,
  deleteAccount as deleteAccountService,
  accountExists
} from "@/services/accountsConfig";

const initialState = {
  accounts: [],
  isLoading: false,
  isRefreshing: false,
  isSubmitting: false,
  error: null,
  success: null,
  platformFilter: "all",
  selectedAccount: null,
  modals: {
    edit: false,
    delete: false
  }
};

// Async Thunks
export const fetchAccounts = createAsyncThunk(
  "accounts/fetchAccounts",
  async (_, { rejectWithValue }) => {
    try {
      const accounts = await getAllAccounts();
      return accounts || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createAccount = createAsyncThunk(
  "accounts/createAccount",
  async (accountData, { rejectWithValue }) => {
    try {
      const exists = await accountExists(accountData.platform, accountData.accountId);
      if (exists) {
        throw new Error("An account with this ID already exists for this platform.");
      }
      const id = await addAccountService(accountData);
      return { id, ...accountData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const modifyAccount = createAsyncThunk(
  "accounts/modifyAccount",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      await updateAccountService(id, data);
      return { id, data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeAccount = createAsyncThunk(
  "accounts/removeAccount",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAccountService(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    setPlatformFilter(state, action) {
      state.platformFilter = action.payload;
    },
    setSelectedAccount(state, action) {
      state.selectedAccount = action.payload;
    },
    openEditModal(state, action) {
      state.selectedAccount = action.payload;
      state.modals.edit = true;
    },
    closeEditModal(state) {
      state.modals.edit = false;
      state.selectedAccount = null;
    },
    openDeleteModal(state, action) {
      state.selectedAccount = action.payload;
      state.modals.delete = true;
    },
    closeDeleteModal(state) {
      state.modals.delete = false;
      state.selectedAccount = null;
    },
    clearError(state) {
      state.error = null;
    },
    clearSuccess(state) {
      state.success = null;
    },
    setSuccess(state, action) {
      state.success = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Accounts
      .addCase(fetchAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Account
      .addCase(createAccount.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.accounts.push(action.payload);
        state.success = "Account added successfully!";
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Modify Account
      .addCase(modifyAccount.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(modifyAccount.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.accounts.findIndex((acc) => acc.id === action.payload.id);
        if (index !== -1) {
          state.accounts[index] = { ...state.accounts[index], ...action.payload.data };
        }
        state.modals.edit = false;
        state.selectedAccount = null;
        state.success = "Account updated successfully!";
      })
      .addCase(modifyAccount.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Remove Account
      .addCase(removeAccount.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(removeAccount.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.accounts = state.accounts.filter((acc) => acc.id !== action.payload);
        state.modals.delete = false;
        state.selectedAccount = null;
        state.success = "Account deleted successfully!";
      })
      .addCase(removeAccount.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });
  }
});

export const {
  setPlatformFilter,
  setSelectedAccount,
  openEditModal,
  closeEditModal,
  openDeleteModal,
  closeDeleteModal,
  clearError,
  clearSuccess,
  setSuccess
} = accountsSlice.actions;

export default accountsSlice.reducer;

// Selectors
export const selectAccounts = (state) => state.accounts.accounts;
export const selectIsLoading = (state) => state.accounts.isLoading;
export const selectIsSubmitting = (state) => state.accounts.isSubmitting;
export const selectError = (state) => state.accounts.error;
export const selectSuccess = (state) => state.accounts.success;
export const selectPlatformFilter = (state) => state.accounts.platformFilter;
export const selectSelectedAccount = (state) => state.accounts.selectedAccount;
export const selectEditModalOpen = (state) => state.accounts.modals.edit;
export const selectDeleteModalOpen = (state) => state.accounts.modals.delete;

export const selectFilteredAccounts = (state) => {
  const { accounts, platformFilter } = state.accounts;
  if (platformFilter === "all") return accounts;
  return accounts.filter((account) => account.platform === platformFilter);
};

export const selectPlatformCounts = (state) => {
  const accounts = state.accounts.accounts;
  return accounts.reduce((acc, account) => {
    acc[account.platform] = (acc[account.platform] || 0) + 1;
    return acc;
  }, {});
};
