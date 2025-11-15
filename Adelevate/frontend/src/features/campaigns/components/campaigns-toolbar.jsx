import React, { useState, useMemo, useEffect } from "react";
import { startOfDay } from "date-fns";
import DatePickerToggle from "./datepicker.jsx";

import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";

import { supabase } from "@/supabaseClient";

// ---- Platform constants ----
const PLATFORM_OPTIONS = [
  { value: "meta", label: "Meta", icon: fb },
  { value: "snap", label: "Snap", icon: snapchatIcon },
  { value: "tiktok", label: "TikTok", icon: tiktokIcon },
  { value: "google", label: "Google", icon: googleIcon },
  { value: "newsbreak", label: "NewsBreak", icon: nb },
];

// For quick lookup (if needed later)
const PLATFORM_MAP = PLATFORM_OPTIONS.reduce((acc, p) => {
  acc[p.value] = p;
  return acc;
}, {});

// ---- Platform icons mapping ----
const platformIconsMap = {
  meta: fb,
  snap: snapchatIcon,
  tiktok: tiktokIcon,
  google: googleIcon,
  newsbreak: nb,
};

// All 5 platforms (aligned with PLATFORM_OPTIONS)
const ALL_PLATFORMS = [
  { id: "meta", name: "Meta" },
  { id: "snap", name: "Snapchat" },
  { id: "tiktok", name: "TikTok" },
  { id: "google", name: "Google" },
  { id: "newsbreak", name: "NewsBreak" },
];

const PREDEFINED_TAGS = [
  "Mythili",
  "Naga",
  "Shanker",
  "Ramanan",
  "Jai",
  "ArunS",
  "naveen",
  "Ashwin",
  "Raju",
  "Sudhanshu",
  "Hari",
  "Gokulraj",
];

// Account options organized by platform
const ACCOUNT_OPTIONS = {
  snap: [
    { id: "snap-eap", name: "EAP" },
    { id: "snap-auto", name: "Auto" },
    { id: "snap-sweeps", name: "Sweeps" },
    { id: "snap-home-bath", name: "Home-Bath" },
    { id: "snap-home-ins", name: "Home-Ins" },
    { id: "snap-tsw-autoinsurancesaver", name: "TSW - autoinsurancesaver" },
    { id: "snap-tsw-smartautosaver", name: "TSW - smartautosaver" },
    { id: "snap-ato-ash", name: "ATO ASH" },
    { id: "snap-ato-myt", name: "ATO MYT" },
    { id: "snap-ato-nm", name: "ATO NM" },
  ],
  meta: {
    ringJunction: {
      main: { id: "meta-ring-junction-main", name: "Ring Junction Main" },
    },
    rjCha3: [
      { id: "meta-rj-cha-3-a1", name: "RJ CHA 3 - A1" },
      { id: "meta-rj-cha-3-a2", name: "RJ CHA 3 - A2" },
      { id: "meta-rj-cha-3-a3", name: "RJ CHA 3 - A3" },
      { id: "meta-rj-cha-3-a4", name: "RJ CHA 3 - A4" },
      { id: "meta-rj-cha-3-a5", name: "RJ CHA 3 - A5" },
    ],
    rjCha4: [
      { id: "meta-rj-cha-4-a1", name: "RJ CHA 4 - A1" },
      { id: "meta-rj-cha-4-a2", name: "RJ CHA 4 - A2" },
      { id: "meta-rj-cha-4-a3", name: "RJ CHA 4 - A3" },
      { id: "meta-rj-cha-4-a4", name: "RJ CHA 4 - A4" },
      { id: "meta-rj-cha-4-a5", name: "RJ CHA 4 - A5" },
    ],
    rjCha5: [{ id: "meta-rj-cha-5-a1", name: "RJ CHA 5 - A1" }],
    sharpAdsCha: [
      { id: "meta-sharp-ads-cha-a1", name: "Sharp Ads CHA - A1" },
      { id: "meta-sharp-ads-cha-a2", name: "Sharp Ads CHA - A2" },
      { id: "meta-sharp-ads-cha-a3", name: "Sharp Ads CHA - A3" },
    ],
    rjCha8: [
      { id: "meta-rj-cha-8-hm-ins-pst-1", name: "HM-INS-PST-1" },
      { id: "meta-rj-cha-8-hm-ins-pst-2", name: "HM-INS-PST-2" },
    ],
    chinaBm: [
      { id: "meta-china-bm-rj-3", name: "RJ -3" },
      {
        id: "meta-china-bm-tsw-auto-insurance-pst",
        name: "TSW Auto Insurance - PST",
      },
      { id: "meta-china-bm-sw-tsw-est3n", name: "SW-TSW-EST3N" },
      { id: "meta-china-bm-sw-tsw-est4", name: "SW-TSW-EST4" },
      { id: "meta-china-bm-sw-tsw-est2", name: "SW-TSW-EST2" },
      { id: "meta-china-bm-sw-tsw-est1", name: "SW-TSW-EST1" },
      { id: "meta-china-bm-sw-tsw-est", name: "SW-TSW-EST" },
      { id: "meta-china-bm-wise-auto", name: "Wise - auto" },
    ],
  },
};

// (Kept for future if you need grouping)
const GROUPING_OPTIONS = [
  { id: "date", name: "Date" },
  { id: "hourOfDay", name: "Hour Of Day" },
  { id: "offer", name: "Offer" },
  { id: "landing", name: "Landing" },
];

/* 🔁 helpers to normalize Meta/Facebook IDs */

// from DB → UI
const normalizePlatformFromDB = (p) => {
  if (!p) return "";
  const v = String(p).toLowerCase();
  if (v === "facebook") return "meta"; // map old to new
  return v;
};

// from UI → backend/table (if your backend still expects "facebook", keep this)
// if your backend already uses "meta", you can change the mapping to return "meta".
const normalizePlatformForAPI = (p) => {
  if (!p) return "";
  const v = String(p).toLowerCase();
  // CHANGE THIS LINE depending on what your API expects:
  // if API uses 'facebook', keep as is; if API uses 'meta', just `return v;`
  if (v === "meta") return "facebook";
  return v;
};

// --------------------------------------------------
// CampaignsToolbar Component
// --------------------------------------------------
export function CampaignsToolbar({
                                   onApplyFilters,
                                   onApplyGrouping,
                                   initialFilters = {},
                                 }) {
  /* ---------------- role + platform access (from Supabase) ---------------- */
  const [myRole, setMyRole] = useState("user");
  const [allowedPlatforms, setAllowedPlatforms] = useState([]); // ["meta","snap",...]
  const [accessLoaded, setAccessLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!mounted) return;

        let role = "user";
        let platforms = [];

        if (session?.user?.id) {
          const { data: me, error: meErr } = await supabase
              .from("user_roles")
              .select("role, platforms")
              .eq("id", session.user.id)
              .maybeSingle();

          if (!meErr && me) {
            role = me.role || "user";
            platforms = Array.from(
                new Set(
                    (me.platforms || []).map((v) =>
                        normalizePlatformFromDB(v) // ✅ facebook → meta
                    )
                )
            );
          }
        }

        // SuperAdmin can access all platforms
        if (role === "SuperAdmin") {
          platforms = ["meta", "snap", "tiktok", "google", "newsbreak"];
        }

        setMyRole(role);
        setAllowedPlatforms(platforms);
        setAccessLoaded(true);
      } catch (e) {
        console.error("Error loading user role/platforms", e);
        setAccessLoaded(true); // unblock UI even on error
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ---- Platforms visible in UI (filtered per user) ----
  const platforms = useMemo(() => {
    if (!accessLoaded) return [];
    const allowedSet = new Set(allowedPlatforms);

    // safety fallback: if nothing stored but role is SuperAdmin, show all
    if (allowedSet.size === 0 && myRole === "SuperAdmin") {
      return ALL_PLATFORMS;
    }
    if (allowedSet.size === 0) {
      // no platform access configured
      return [];
    }
    return ALL_PLATFORMS.filter((p) => allowedSet.has(p.id));
  }, [accessLoaded, allowedPlatforms, myRole]);

  // ---- State: Platforms selected by user ----
  const [selectedPlatforms, setSelectedPlatforms] = useState(
      initialFilters.platforms || []
  );

  // keep selectedPlatforms in sync with allowedPlatforms
  useEffect(() => {
    if (!accessLoaded) return;
    const allowedSet = new Set(allowedPlatforms);
    setSelectedPlatforms((prev) => {
      const filtered = prev.filter((p) => allowedSet.has(p));
      // if nothing selected, default to "all allowed"
      if (filtered.length === 0 && allowedPlatforms.length > 0) {
        return [...allowedPlatforms];
      }
      return filtered;
    });
  }, [accessLoaded, allowedPlatforms]);

  const [showPlatformMenu, setShowPlatformMenu] = useState(false);

  // ---- Accounts selection ----
  const [selectedAccounts, setSelectedAccounts] = useState(
      initialFilters.accounts || []
  );
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    snap: true,
    meta: true,
    ringJunction: true,
    rjCha3: false,
    rjCha4: false,
    rjCha5: false,
    sharpAdsCha: false,
    rjCha8: false,
    chinaBm: false,
  });

  // ---- Other filters ----
  const [title, setTitle] = useState(initialFilters.title || "");
  const [tags, setTags] = useState(initialFilters.tags || "");
  const [showTagsMenu, setShowTagsMenu] = useState(false);

  // 🔹 Default date: TODAY (not last 3 days)
  const [dateRange, setDateRange] = useState(() => {
    if (initialFilters.dateRange) return initialFilters.dateRange;
    const today = startOfDay(new Date());
    return {
      startDate: today,
      endDate: today,
      key: "today",
    };
  });

  const [timeZone, setTimeZone] = useState(
      initialFilters.timeZone || "America/Los_Angeles"
  );
  const [showTimeZoneMenu, setShowTimeZoneMenu] = useState(false);

  // Time zone options
  const timeZoneOptions = [
    { id: "America/Los_Angeles", name: "America/Los_Angeles" },
    { id: "America/New_York", name: "America/New_York" },
    { id: "Europe/London", name: "Europe/London" },
    { id: "Asia/Tokyo", name: "Asia/Tokyo" },
    { id: "Australia/Sydney", name: "Australia/Sydney" },
  ];

  // ----------------- Handlers -----------------
  const togglePlatform = (platformId) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platformId)) {
        const next = prev.filter((p) => p !== platformId);
        return next;
      }
      return [...prev, platformId];
    });
  };

  const toggleAccount = (accountId) => {
    setSelectedAccounts((prev) => {
      if (prev.includes(accountId)) {
        return prev.filter((a) => a !== accountId);
      }
      return [...prev, accountId];
    });
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const selectTag = (tag) => {
    setTags(tag);
    setShowTagsMenu(false);
  };

  const selectTimeZone = (zone) => {
    setTimeZone(zone);
    setShowTimeZoneMenu(false);
  };

  // 🔹 Called when user clicks "Apply" button
  const applyFilters = () => {
    if (onApplyFilters) {
      const normalizedPlatformsForAPI = (selectedPlatforms || []).map(
          normalizePlatformForAPI // meta → facebook if your API expects that
      );

      onApplyFilters({
        platforms: normalizedPlatformsForAPI,
        accounts: selectedAccounts,
        title,
        tags,
        dateRange,
        timeZone,
      });
    }
  };

  // 🔹 Reset everything to defaults (including date = today)
  const resetForm = () => {
    const today = startOfDay(new Date());
    // default platforms back to all allowed
    const resetPlatforms =
        allowedPlatforms && allowedPlatforms.length > 0 ? [...allowedPlatforms] : [];

    setSelectedPlatforms(resetPlatforms);
    setSelectedAccounts([]);
    setTitle("");
    setTags("");
    setDateRange({
      startDate: today,
      endDate: today,
      key: "today",
    });
    setTimeZone("America/Los_Angeles");

    if (onApplyFilters) {
      const normalizedPlatformsForAPI = resetPlatforms.map(
          normalizePlatformForAPI
      );
      onApplyFilters({
        platforms: normalizedPlatformsForAPI,
        accounts: [],
        title: "",
        tags: "",
        dateRange: {
          startDate: today,
          endDate: today,
          key: "today",
        },
        timeZone: "America/Los_Angeles",
      });
    }

    if (onApplyGrouping) {
      onApplyGrouping([]); // if you later use grouping
    }
  };

  // ----------------- JSX -----------------
  return (
      <section
          aria-label="Filters"
          className="rounded-md border bg-white p-4 shadow-sm xs:mt-[20%] ss:mt-[20%] sm:mt-0"
      >
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-2">
          {/* Date Picker */}
          <div className="w-full md:w-auto">
            <DatePickerToggle
                initialSelection={dateRange}
                onChange={(newRange) => setDateRange(newRange)}
            />
          </div>

          {/* Time Zone Selector */}
          <div className="relative w-full md:w-auto">
            <button
                type="button"
                onClick={() => setShowTimeZoneMenu(!showTimeZoneMenu)}
                className="flex w-full items-center justify-between gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100 md:justify-start"
            >
              <span className="text-gray-600">Time zone</span>
              <span className="truncate text-xs font-medium text-blue-600">
              {timeZone}
            </span>
              <svg
                  className="h-4 w-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showTimeZoneMenu && (
                <>
                  <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowTimeZoneMenu(false)}
                  />
                  <div className="absolute left-0 z-40 mt-1 w-64 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="p-2">
                      <div className="mb-1 px-3 py-2 text-xs font-semibold text-gray-500">
                        Select time zone...
                      </div>
                      {timeZoneOptions.map((zone) => (
                          <button
                              key={zone.id}
                              type="button"
                              onClick={() => selectTimeZone(zone.id)}
                              className={`w-full truncate text-left rounded px-3 py-2 text-sm hover:bg-gray-100 ${
                                  timeZone === zone.id
                                      ? "bg-blue-50 text-blue-600 font-medium"
                                      : "text-gray-700"
                              }`}
                          >
                            {zone.name}
                          </button>
                      ))}
                    </div>
                  </div>
                </>
            )}
          </div>

          {/* Platform selector (role-based from Supabase) */}
          <div className="relative w-full md:w-auto">
            <button
                type="button"
                onClick={() => {
                  if (accessLoaded && platforms.length > 0) {
                    setShowPlatformMenu(!showPlatformMenu);
                  }
                }}
                disabled={!accessLoaded || platforms.length === 0}
                className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm md:justify-start ${
                    !accessLoaded || platforms.length === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
            >
              <span className="text-gray-600">Platforms</span>
              {selectedPlatforms.length > 0 ? (
                  <span className="text-xs font-medium text-blue-600">
                {selectedPlatforms.length} selected
              </span>
              ) : (
                  <span className="text-gray-500 italic">
                {platforms.length === 0 ? "No access" : "Select..."}
              </span>
              )}
              <svg
                  className="h-4 w-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showPlatformMenu && (
                <>
                  <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowPlatformMenu(false)}
                  />
                  <div className="absolute left-0 z-40 mt-1 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="p-2">
                      <div className="mb-1 px-3 py-2 text-xs font-semibold text-gray-500">
                        Select platforms...
                      </div>
                      {platforms.map((platform) => (
                          <label
                              key={platform.id}
                              className="flex cursor-pointer items-center rounded px-3 py-2 hover:bg-gray-100"
                          >
                            <input
                                type="checkbox"
                                checked={selectedPlatforms.includes(platform.id)}
                                onChange={() => togglePlatform(platform.id)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                            />
                            <img
                                src={platformIconsMap[platform.id]}
                                alt={`${platform.name} icon`}
                                className="h-4 w-4 mr-2"
                            />
                            <span className="text-sm text-gray-700">
                        {platform.name}
                      </span>
                          </label>
                      ))}
                      {platforms.length === 0 && (
                          <div className="px-3 py-3 text-xs text-gray-500">
                            No platform access configured for your user.
                            <br />
                            Contact an admin.
                          </div>
                      )}
                    </div>
                  </div>
                </>
            )}
          </div>

          {/* Account selector */}
          <div className="relative w-full md:w-auto">
            <button
                type="button"
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex w-full items-center justify-between gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100 md:justify-start"
            >
              <span className="text-gray-600">Accounts</span>
              {selectedAccounts.length > 0 ? (
                  <span className="text-xs font-medium text-blue-600">
                {selectedAccounts.length} selected
              </span>
              ) : (
                  <span className="text-gray-500 italic">Select...</span>
              )}
              <svg
                  className="h-4 w-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showAccountMenu && (
                <>
                  <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowAccountMenu(false)}
                  />
                  <div className="absolute left-0 z-40 mt-1 w-80 max-h-[32rem] overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="p-2">
                      <div className="mb-2 px-3 py-2 text-xs font-semibold text-gray-500">
                        Select accounts...
                      </div>

                      {/* Snap Accounts */}
                      <div className="mb-3">
                        <button
                            type="button"
                            onClick={() => toggleSection("snap")}
                            className="flex w-full items-center justify-between px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                        >
                          <div className="flex items-center">
                            <img
                                src={snapchatIcon}
                                alt="Snapchat icon"
                                className="h-4 w-4 mr-2"
                            />
                            <span className="text-xs font-bold text-gray-800 uppercase">
                          Snap Accounts
                        </span>
                          </div>
                          <svg
                              className={`h-4 w-4 text-gray-600 transition-transform ${
                                  expandedSections.snap ? "rotate-180" : ""
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                          >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        {expandedSections.snap && (
                            <div className="mt-1">
                              {ACCOUNT_OPTIONS.snap.map((account) => (
                                  <label
                                      key={account.id}
                                      className="flex cursor-pointer items-center rounded px-3 py-1.5 pl-6 hover:bg-gray-100"
                                  >
                                    <input
                                        type="checkbox"
                                        checked={selectedAccounts.includes(account.id)}
                                        onChange={() => toggleAccount(account.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                    />
                                    <span className="text-sm text-gray-700">
                              {account.name}
                            </span>
                                  </label>
                              ))}
                            </div>
                        )}
                      </div>

                      {/* Meta Accounts */}
                      <div>
                        <button
                            type="button"
                            onClick={() => toggleSection("meta")}
                            className="flex w-full items-center justify-between px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors mb-1"
                        >
                          <div className="flex items-center">
                            <img src={fb} alt="Facebook icon" className="h-4 w-4 mr-2" />
                            <span className="text-xs font-bold text-gray-800 uppercase">
                          Meta Accounts
                        </span>
                          </div>
                          <svg
                              className={`h-4 w-4 text-gray-600 transition-transform ${
                                  expandedSections.meta ? "rotate-180" : ""
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                          >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {expandedSections.meta && (
                            <div className="space-y-2 mt-2">
                              {/* Ring Junction */}
                              <div>
                                <button
                                    type="button"
                                    onClick={() => toggleSection("ringJunction")}
                                    className="flex w-full itemscenter justify-between px-3 py-1.5 pl-6 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                                >
                            <span className="text-xs font-semibold text-gray-700">
                              Ring Junction
                            </span>
                                  <svg
                                      className={`h-3 w-3 text-gray-600 transition-transform ${
                                          expandedSections.ringJunction ? "rotate-180" : ""
                                      }`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                  >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </button>
                                {expandedSections.ringJunction && (
                                    <label className="flex cursor-pointer items-center rounded px-3 py-1.5 pl-10 hover:bg-gray-100 mt-1">
                                      <input
                                          type="checkbox"
                                          checked={selectedAccounts.includes(
                                              ACCOUNT_OPTIONS.meta.ringJunction.main.id
                                          )}
                                          onChange={() =>
                                              toggleAccount(
                                                  ACCOUNT_OPTIONS.meta.ringJunction.main.id
                                              )
                                          }
                                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                      />
                                      <span className="text-sm text-gray-700">
                                {ACCOUNT_OPTIONS.meta.ringJunction.main.name}
                              </span>
                                    </label>
                                )}
                              </div>

                              {/* RJ CHA 3 */}
                              <div>
                                <button
                                    type="button"
                                    onClick={() => toggleSection("rjCha3")}
                                    className="flex w-full items-center justify-between px-3 py-1.5 pl-6 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                                >
                            <span className="text-xs font-semibold text-gray-700">
                              RJ CHA 3
                            </span>
                                  <svg
                                      className={`h-3 w-3 text-gray-600 transition-transform ${
                                          expandedSections.rjCha3 ? "rotate-180" : ""
                                      }`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                  >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </button>
                                {expandedSections.rjCha3 && (
                                    <div className="mt-1">
                                      {ACCOUNT_OPTIONS.meta.rjCha3.map((account) => (
                                          <label
                                              key={account.id}
                                              className="flex cursor-pointer items-center rounded px-3 py-1.5 pl-10 hover:bg-gray-100"
                                          >
                                            <input
                                                type="checkbox"
                                                checked={selectedAccounts.includes(account.id)}
                                                onChange={() => toggleAccount(account.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                            />
                                            <span className="text-sm text-gray-700">
                                    {account.name}
                                  </span>
                                          </label>
                                      ))}
                                    </div>
                                )}
                              </div>

                              {/* RJ CHA 4 */}
                              <div>
                                <button
                                    type="button"
                                    onClick={() => toggleSection("rjCha4")}
                                    className="flex w-full items-center justify-between px-3 py-1.5 pl-6 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                                >
                            <span className="text-xs font-semibold text-gray-700">
                              RJ CHA 4
                            </span>
                                  <svg
                                      className={`h-3 w-3 text-gray-600 transition-transform ${
                                          expandedSections.rjCha4 ? "rotate-180" : ""
                                      }`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                  >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </button>
                                {expandedSections.rjCha4 && (
                                    <div className="mt-1">
                                      {ACCOUNT_OPTIONS.meta.rjCha4.map((account) => (
                                          <label
                                              key={account.id}
                                              className="flex cursor-pointer items-center rounded px-3 py-1.5 pl-10 hover:bg-gray-100"
                                          >
                                            <input
                                                type="checkbox"
                                                checked={selectedAccounts.includes(account.id)}
                                                onChange={() => toggleAccount(account.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                            />
                                            <span className="text-sm text-gray-700">
                                    {account.name}
                                  </span>
                                          </label>
                                      ))}
                                    </div>
                                )}
                              </div>

                              {/* RJ CHA 5 */}
                              <div>
                                <button
                                    type="button"
                                    onClick={() => toggleSection("rjCha5")}
                                    className="flex w-full items-center justify-between px-3 py-1.5 pl-6 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                                >
                            <span className="text-xs font-semibold text-gray-700">
                              RJ CHA 5
                            </span>
                                  <svg
                                      className={`h-3 w-3 text-gray-600 transition-transform ${
                                          expandedSections.rjCha5 ? "rotate-180" : ""
                                      }`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                  >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </button>
                                {expandedSections.rjCha5 && (
                                    <div className="mt-1">
                                      {ACCOUNT_OPTIONS.meta.rjCha5.map((account) => (
                                          <label
                                              key={account.id}
                                              className="flex cursor-pointer items-center rounded px-3 py-1.5 pl-10 hover:bg-gray-100"
                                          >
                                            <input
                                                type="checkbox"
                                                checked={selectedAccounts.includes(account.id)}
                                                onChange={() => toggleAccount(account.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                            />
                                            <span className="text-sm text-gray-700">
                                    {account.name}
                                  </span>
                                          </label>
                                      ))}
                                    </div>
                                )}
                              </div>

                              {/* Sharp Ads - CHA */}
                              <div>
                                <button
                                    type="button"
                                    onClick={() => toggleSection("sharpAdsCha")}
                                    className="flex w-full items-center justify-between px-3 py-1.5 pl-6 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                                >
                            <span className="text-xs font-semibold text-gray-700">
                              Sharp Ads - CHA
                            </span>
                                  <svg
                                      className={`h-3 w-3 text-gray-600 transition-transform ${
                                          expandedSections.sharpAdsCha ? "rotate-180" : ""
                                      }`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                  >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </button>
                                {expandedSections.sharpAdsCha && (
                                    <div className="mt-1">
                                      {ACCOUNT_OPTIONS.meta.sharpAdsCha.map((account) => (
                                          <label
                                              key={account.id}
                                              className="flex cursor-pointer items-center rounded px-3 py-1.5 pl-10 hover:bg-gray-100"
                                          >
                                            <input
                                                type="checkbox"
                                                checked={selectedAccounts.includes(account.id)}
                                                onChange={() => toggleAccount(account.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                            />
                                            <span className="text-sm text-gray-700">
                                    {account.name}
                                  </span>
                                          </label>
                                      ))}
                                    </div>
                                )}
                              </div>

                              {/* RJ CHA 8 */}
                              <div>
                                <button
                                    type="button"
                                    onClick={() => toggleSection("rjCha8")}
                                    className="flex w-full items-center justify-between px-3 py-1.5 pl-6 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                                >
                            <span className="text-xs font-semibold text-gray-700">
                              RJ CHA 8
                            </span>
                                  <svg
                                      className={`h-3 w-3 text-gray-600 transition-transform ${
                                          expandedSections.rjCha8 ? "rotate-180" : ""
                                      }`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                  >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </button>
                                {expandedSections.rjCha8 && (
                                    <div className="mt-1">
                                      {ACCOUNT_OPTIONS.meta.rjCha8.map((account) => (
                                          <label
                                              key={account.id}
                                              className="flex cursor-pointer items-center rounded px-3 py-1.5 pl-10 hover:bg-gray-100"
                                          >
                                            <input
                                                type="checkbox"
                                                checked={selectedAccounts.includes(account.id)}
                                                onChange={() => toggleAccount(account.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                            />
                                            <span className="text-sm text-gray-700">
                                    {account.name}
                                  </span>
                                          </label>
                                      ))}
                                    </div>
                                )}
                              </div>

                              {/* China BM */}
                              <div>
                                <button
                                    type="button"
                                    onClick={() => toggleSection("chinaBm")}
                                    className="flex w-full items-center justify-between px-3 py-1.5 pl-6 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                                >
                            <span className="text-xs font-semibold text-gray-700">
                              China BM
                            </span>
                                  <svg
                                      className={`h-3 w-3 text-gray-600 transition-transform ${
                                          expandedSections.chinaBm ? "rotate-180" : ""
                                      }`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                  >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </button>
                                {expandedSections.chinaBm && (
                                    <div className="mt-1">
                                      {ACCOUNT_OPTIONS.meta.chinaBm.map((account) => (
                                          <label
                                              key={account.id}
                                              className="flex cursor-pointer items-center rounded px-3 py-1.5 pl-10 hover:bg-gray-100"
                                          >
                                            <input
                                                type="checkbox"
                                                checked={selectedAccounts.includes(account.id)}
                                                onChange={() => toggleAccount(account.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                            />
                                            <span className="text-sm text-gray-700">
                                    {account.name}
                                  </span>
                                          </label>
                                      ))}
                                    </div>
                                )}
                              </div>
                            </div>
                        )}
                      </div>

                      {/* Clear selection button */}
                      {selectedAccounts.length > 0 && (
                          <button
                              type="button"
                              onClick={() => setSelectedAccounts([])}
                              className="w-full text-left rounded px-3 py-2 text-sm text-red-600 hover:bg-red-50 border-t mt-3 pt-3 font-medium"
                          >
                            Clear all selections ({selectedAccounts.length})
                          </button>
                      )}
                    </div>
                  </div>
                </>
            )}
          </div>

          {/* Title input */}
          <div className="w-full md:w-auto md:flex-1">
            <label className="flex w-full items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm">
              <span className="text-gray-600">Title</span>
              <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent outline-none placeholder:text-gray-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyFilters();
                  }}
                  aria-label="Title filter"
                  placeholder="Search..."
              />
              {title && (
                  <button
                      className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-200"
                      onClick={() => setTitle("")}
                      title="Clear title"
                      type="button"
                  >
                    ×
                  </button>
              )}
            </label>
          </div>

          {/* Tags Dropdown */}
          <div className="relative w-full md:w-auto">
            <button
                type="button"
                onClick={() => setShowTagsMenu(!showTagsMenu)}
                className="flex w-full items-center justify-between gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100 md:justify-start"
            >
              <span className="text-gray-600">Tags</span>
              {tags ? (
                  <span className="text-xs font-medium text-blue-600">{tags}</span>
              ) : (
                  <span className="text-gray-500 italic">Select...</span>
              )}
              <svg
                  className="h-4 w-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showTagsMenu && (
                <>
                  <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowTagsMenu(false)}
                  />
                  <div className="absolute left-0 z-40 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="p-2">
                      <div className="mb-1 px-3 py-2 text-xs font-semibold text-gray-500">
                        Select a tag...
                      </div>
                      {PREDEFINED_TAGS.map((tag) => (
                          <button
                              key={tag}
                              type="button"
                              onClick={() => selectTag(tag)}
                              className={`w-full text-left rounded px-3 py-2 text-sm hover:bg-gray-100 ${
                                  tags === tag
                                      ? "bg-blue-50 text-blue-600 font-medium"
                                      : "text-gray-700"
                              }`}
                          >
                            {tag}
                          </button>
                      ))}
                      {tags && (
                          <button
                              type="button"
                              onClick={() => selectTag("")}
                              className="w-full text-left rounded px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 border-t mt-1 pt-2"
                          >
                            Clear selection
                          </button>
                      )}
                    </div>
                  </div>
                </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex w-full flex-col gap-2 border-t border-gray-200 pt-3 mt-1 md:w-auto md:flex-row md:border-t-0 md:pt-0 md:mt-0 md:ml-auto">
            <button
                type="button"
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none md:w-auto"
                onClick={applyFilters}
            >
              Apply
            </button>
            <button
                type="button"
                onClick={resetForm}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none md:w-auto"
            >
              Reset
            </button>
          </div>
        </div>
      </section>
  );
}

export default CampaignsToolbar;
