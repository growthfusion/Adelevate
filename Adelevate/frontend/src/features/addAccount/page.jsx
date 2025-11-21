import React, { useState, useRef, useEffect } from "react";
import nb from "@/assets/images/automation_img/NewsBreak.svg";
import fb from "@/assets/images/automation_img/Facebook.svg";
import snapchatIcon from "@/assets/images/automation_img/snapchat.svg";
import tiktokIcon from "@/assets/images/automation_img/tiktok.svg";
import googleIcon from "@/assets/images/automation_img/google.svg";
import {
  addAccount,
  accountExists,
  getAllAccounts,
  updateAccount,
  deleteAccount
} from "@/services/accountsConfig";

// Platform Icon Component with Enhanced Fallback
const PlatformIcon = ({ platform, className = "w-6 h-6" }) => {
  const [imageError, setImageError] = useState(false);

  const platformData = {
    facebook: { icon: fb, name: "Meta", color: "#1877F2", bgColor: "#E7F3FF" },
    meta: { icon: fb, name: "Meta", color: "#1877F2", bgColor: "#E7F3FF" },
    newsbreak: { icon: nb, name: "NewsBreak", color: "#FF6B6B", bgColor: "#FFE7E7" },
    snapchat: { icon: snapchatIcon, name: "Snapchat", color: "#FFFC00", bgColor: "#FFFDE7" },
    snap: { icon: snapchatIcon, name: "Snapchat", color: "#FFFC00", bgColor: "#FFFDE7" },
    tiktok: { icon: tiktokIcon, name: "TikTok", color: "#000000", bgColor: "#F0F0F0" },
    google: { icon: googleIcon, name: "Google", color: "#4285F4", bgColor: "#E8F0FE" },
    googleads: { icon: googleIcon, name: "Google", color: "#4285F4", bgColor: "#E8F0FE" }
  };

  const platformLower = (platform || "").toLowerCase().trim();
  const platformInfo = platformData[platformLower];

  if (!platformInfo || imageError) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={platformInfo.icon}
      alt={platformInfo.name}
      className={className}
      onError={() => setImageError(true)}
      loading="eager"
    />
  );
};

// Edit Modal Component
function EditAccountModal({ account, isOpen, onClose, onUpdate, platforms }) {
  const [formData, setFormData] = useState({
    bmName: account?.bmName || "",
    accessToken: account?.accessToken || "",
    accountId: account?.accountId || "",
    accountLabel: account?.accountLabel || ""
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData({
        bmName: account.bmName || "",
        accessToken: account.accessToken || "",
        accountId: account.accountId || "",
        accountLabel: account.accountLabel || ""
      });
      setShowToken(false);
    }
  }, [account]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsUpdating(true);

    try {
      await updateAccount(account.id, formData);
      onUpdate();
      onClose();
    } catch (err) {
      console.error("Error updating account:", err);
      setError(err.message || "Failed to update account");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !account) return null;

  const platform = platforms.find((p) => p.value === account.platform);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 xs:p-4 animate-fadeIn">
      <div className="bg-white rounded-xl xs:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] xs:max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Modal Header */}
        <div className="p-4 xs:p-5 md:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 xs:gap-3">
              <div className="h-10 w-10 xs:h-12 xs:w-12 bg-white rounded-lg xs:rounded-xl shadow-sm flex items-center justify-center p-2">
                {platform?.icon ? (
                  <img
                    src={platform.icon}
                    alt={platform.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <PlatformIcon platform={account.platform} className="w-full h-full" />
                )}
              </div>
              <div>
                <h2 className="text-lg xs:text-xl md:text-2xl font-bold text-gray-900">
                  Edit {platform?.name || account.platform || "Account"}
                </h2>
                <p className="text-xs xs:text-sm text-gray-500 mt-0.5 hidden xs:block">
                  Update account credentials and details
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 xs:h-10 xs:w-10 rounded-lg xs:rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 xs:h-5 xs:w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="p-4 xs:p-5 md:p-6 space-y-4 xs:space-y-5 md:space-y-6 overflow-y-auto max-h-[calc(95vh-180px)] xs:max-h-[calc(90vh-180px)]"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg xs:rounded-xl p-3 xs:p-4 flex items-start gap-2 xs:gap-3">
              <svg
                className="w-4 h-4 xs:w-5 xs:h-5 text-red-500 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs xs:text-sm text-red-700">{error}</p>
            </div>
          )}

          {account.platform === "facebook" && (
            <div className="space-y-2">
              <label className="block text-xs xs:text-sm font-semibold text-gray-700">
                Business Manager Name
              </label>
              <input
                type="text"
                value={formData.bmName}
                onChange={(e) => setFormData({ ...formData, bmName: e.target.value })}
                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base border border-gray-300 rounded-lg xs:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs xs:text-sm font-semibold text-gray-700">
              Access Token
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={formData.accessToken}
                onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 pr-10 text-sm xs:text-base border border-gray-300 rounded-lg xs:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2 xs:right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-md transition-colors"
                title={showToken ? "Hide token" : "Show token"}
              >
                {showToken ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 xs:h-5 xs:w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 xs:h-5 xs:w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 ss:grid-cols-2 gap-3 xs:gap-4">
            <div className="space-y-2">
              <label className="block text-xs xs:text-sm font-semibold text-gray-700">
                Account ID
              </label>
              <input
                type="text"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base border border-gray-300 rounded-lg xs:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs xs:text-sm font-semibold text-gray-700">
                Account Label
              </label>
              <input
                type="text"
                value={formData.accountLabel}
                onChange={(e) => setFormData({ ...formData, accountLabel: e.target.value })}
                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base border border-gray-300 rounded-lg xs:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 xs:p-5 md:p-6 border-t border-gray-200 bg-gray-50 flex flex-col-reverse ss:flex-row items-center justify-end gap-2 xs:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full ss:w-auto px-4 xs:px-6 py-2.5 xs:py-3 text-sm xs:text-base border border-gray-300 text-gray-700 font-semibold rounded-lg xs:rounded-xl hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="w-full ss:w-auto px-4 xs:px-6 py-2.5 xs:py-3 text-sm xs:text-base bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg xs:rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 transition-all flex items-center justify-center gap-2"
          >
            {isUpdating ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 xs:h-5 xs:w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Updating...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 xs:h-5 xs:w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Update Account
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({ account, isOpen, onClose, onConfirm, platforms }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !account) return null;

  const platform = platforms.find((p) => p.value === account.platform);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 xs:p-4 animate-fadeIn">
      <div className="bg-white rounded-xl xs:rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
        <div className="p-4 xs:p-5 md:p-6">
          <div className="h-12 w-12 xs:h-14 xs:w-14 bg-red-100 rounded-xl xs:rounded-2xl flex items-center justify-center mx-auto mb-3 xs:mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 xs:h-7 xs:w-7 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h3 className="text-lg xs:text-xl font-bold text-gray-900 text-center mb-2">
            Delete Account?
          </h3>
          <p className="text-xs xs:text-sm text-gray-500 text-center mb-4 xs:mb-6 px-2">
            Are you sure you want to remove <strong>{account.accountLabel}</strong>? This action
            cannot be undone.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg xs:rounded-xl p-3 xs:p-4 mb-4 xs:mb-6">
            <div className="flex items-center gap-2 xs:gap-3">
              <div className="h-8 w-8 xs:h-10 xs:w-10 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0 p-1.5">
                {platform?.icon ? (
                  <img
                    src={platform.icon}
                    alt={platform.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <PlatformIcon platform={account.platform} className="w-full h-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm xs:text-base text-gray-900 truncate">
                  {account.accountLabel}
                </p>
                <p className="text-xs text-gray-500 truncate">{account.accountId}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 xs:p-5 md:p-6 border-t border-gray-200 bg-gray-50 flex flex-col-reverse ss:flex-row items-center justify-end gap-2 xs:gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="w-full ss:w-auto px-4 xs:px-6 py-2.5 xs:py-3 text-sm xs:text-base border border-gray-300 text-gray-700 font-semibold rounded-lg xs:rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full ss:w-auto px-4 xs:px-6 py-2.5 xs:py-3 text-sm xs:text-base bg-red-600 text-white font-semibold rounded-lg xs:rounded-xl hover:bg-red-700 disabled:bg-gray-400 transition-all flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 xs:h-5 xs:w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 xs:h-5 xs:w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Account
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Add_Accounts() {
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [bmName, setBmName] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [accountId, setAccountId] = useState("");
  const [accountLabel, setAccountLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Filter state
  const [platformFilter, setPlatformFilter] = useState("all");

  const platforms = [
    {
      name: "Meta",
      icon: fb,
      value: "facebook",
      description: "Facebook & Instagram Ads"
    },
    {
      name: "NewsBreak",
      icon: nb,
      value: "newsbreak",
      description: "NewsBreak Platform"
    },
    {
      name: "Snapchat",
      icon: snapchatIcon,
      value: "snapchat",
      description: "Snapchat Ads Manager"
    },
    {
      name: "TikTok",
      icon: tiktokIcon,
      value: "tiktok",
      description: "TikTok Ads Platform"
    },
    {
      name: "Google",
      icon: googleIcon,
      value: "google",
      description: "Google Ads & Analytics"
    }
  ];

  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const accounts = await getAllAccounts();
      console.log("Loaded accounts:", accounts);
      setConnectedAccounts(accounts || []);
    } catch (err) {
      console.error("Error loading accounts:", err);
      setError("Failed to load accounts");
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadAccounts();
      setSuccess("Accounts refreshed successfully!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError("Failed to refresh accounts");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReset = () => {
    setSelectedPlatform("");
    setBmName("");
    setAccessToken("");
    setAccountId("");
    setAccountLabel("");
    setError("");
    setSuccess("");
    setShowAccessToken(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const accountData = {
        platform: selectedPlatform,
        ...(selectedPlatform === "facebook" && { bmName }),
        accessToken,
        accountId,
        accountLabel
      };

      // Check if account already exists
      const exists = await accountExists(selectedPlatform, accountId);
      if (exists) {
        setError("An account with this ID already exists for this platform.");
        setIsSubmitting(false);
        return;
      }

      // Add account
      const id = await addAccount(accountData);
      console.log("✅ Account added successfully with ID:", id);

      setSuccess("Account added successfully!");

      // Reload accounts
      await loadAccounts();

      // Reset form
      setTimeout(() => {
        handleReset();
      }, 2000);
    } catch (err) {
      console.error("❌ Error adding account:", err);
      setError(err.message || "Failed to add account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setEditModalOpen(true);
  };

  const handleEditComplete = async () => {
    await loadAccounts();
    setEditModalOpen(false);
    setSelectedAccount(null);
    setSuccess("Account updated successfully!");
    setTimeout(() => setSuccess(""), 2000);
  };

  const handleDeleteClick = (account) => {
    setSelectedAccount(account);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteAccount(selectedAccount.id);
      await loadAccounts();
      setDeleteModalOpen(false);
      setSelectedAccount(null);
      setSuccess("Account deleted successfully!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      console.error("Error deleting account:", err);
      setError("Failed to delete account");
    }
  };

  const getPlatformById = (value) => {
    const platform = platforms.find((p) => p.value === value);
    return platform || null;
  };

  // Filter accounts by platform
  const filteredAccounts =
    platformFilter === "all"
      ? connectedAccounts
      : connectedAccounts.filter((account) => account.platform === platformFilter);

  // Get platform counts
  const platformCounts = platforms.reduce((acc, platform) => {
    acc[platform.value] = connectedAccounts.filter(
      (account) => account.platform === platform.value
    ).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Main Content */}
      <div className="pt-[20%] xs:pt-[20%] sm:pt-6 md:pt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-6 xs:mb-8">
          <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3">
            <div>
              <h1 className="text-xl xs:text-2xl md:text-3xl font-bold text-gray-900">
                Platform Integrations
              </h1>
              <p className="text-xs xs:text-sm md:text-base text-gray-500 mt-1">
                Add your advertising platforms to start managing campaigns
              </p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {success && (
          <div className="mb-4 xs:mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg xs:rounded-xl p-3 xs:p-4 flex items-start gap-2 xs:gap-3 shadow-sm animate-fadeIn">
            <div className="flex-shrink-0">
              <div className="h-6 w-6 xs:h-8 xs:w-8 bg-green-500 rounded-md xs:rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 xs:w-5 xs:h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xs xs:text-sm font-semibold text-green-900">Success!</h3>
              <p className="text-xs xs:text-sm text-green-700 mt-1">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 xs:mb-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg xs:rounded-xl p-3 xs:p-4 flex items-start gap-2 xs:gap-3 shadow-sm animate-fadeIn">
            <div className="flex-shrink-0">
              <div className="h-6 w-6 xs:h-8 xs:w-8 bg-red-500 rounded-md xs:rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 xs:w-5 xs:h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xs xs:text-sm font-semibold text-red-900">Error occurred</h3>
              <p className="text-xs xs:text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xs:gap-6 lg:gap-8">
          {/* Left Column - Integration Form (2/3 width) */}
          <div className="xl:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-xl xs:rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Section 1: Platform Selection */}
              <div className="p-4 xs:p-6 md:p-8 border-b border-gray-100">
                <div className="flex items-center gap-2 xs:gap-3 mb-4 xs:mb-6">
                  <div className="h-8 w-8 xs:h-10 xs:w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 xs:h-5 xs:w-5 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base xs:text-lg md:text-xl font-semibold text-gray-900">
                      Platform Details
                    </h2>
                  </div>
                </div>

                {/* Platform Selector Grid */}
                <div className="space-y-3">
                  <label className="block text-xs xs:text-sm font-semibold text-gray-700 mb-2 xs:mb-3">
                    Select Platform
                    <span className="ml-1 text-xs font-normal text-gray-400">(required)</span>
                  </label>

                  <div className="grid grid-cols-1 ss:grid-cols-2 lg:grid-cols-2 gap-2 xs:gap-3">
                    {platforms.map((platform) => {
                      const isSelected = selectedPlatform === platform.value;
                      return (
                        <button
                          key={platform.value}
                          type="button"
                          onClick={() => setSelectedPlatform(platform.value)}
                          className={`relative p-3 xs:p-4 rounded-lg xs:rounded-xl border-2 transition-all duration-200 text-left ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-50 shadow-md scale-[1.02]"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm active:scale-95"
                          }`}
                        >
                          <div className="flex items-start gap-2 xs:gap-3">
                            <div
                              className={`h-10 w-10 xs:h-12 xs:w-12 rounded-lg flex items-center justify-center flex-shrink-0 p-2 ${
                                isSelected ? "bg-white shadow-sm" : "bg-gray-50"
                              }`}
                            >
                              <img
                                src={platform.icon}
                                alt={platform.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-sm xs:text-base text-gray-900">
                                  {platform.name}
                                </h3>
                                {isSelected && (
                                  <div className="h-4 w-4 xs:h-5 xs:w-5 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg
                                      className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-white"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 xs:mt-1">
                                {platform.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Facebook-specific field */}
                {selectedPlatform === "facebook" && (
                  <div className="mt-4 xs:mt-6 space-y-2 animate-fadeIn">
                    <label className="block text-xs xs:text-sm font-semibold text-gray-700">
                      Business Manager Name
                      <span className="ml-1 text-xs font-normal text-gray-400">(required)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., My Business Manager"
                      value={bmName}
                      onChange={(e) => setBmName(e.target.value)}
                      className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base border border-gray-300 rounded-lg xs:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400"
                      required
                    />
                  </div>
                )}

                {/* Access Token */}
                {selectedPlatform && (
                  <div className="mt-4 xs:mt-6 space-y-2 animate-fadeIn">
                    <label className="block text-xs xs:text-sm font-semibold text-gray-700">
                      Access Token
                      <span className="ml-1 text-xs font-normal text-gray-400">(required)</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showAccessToken ? "text" : "password"}
                        placeholder="Enter your API access token"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 pr-10 xs:pr-12 text-sm xs:text-base border border-gray-300 rounded-lg xs:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowAccessToken(!showAccessToken)}
                        className="absolute right-2 xs:right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-md transition-colors"
                        title={showAccessToken ? "Hide token" : "Show token"}
                      >
                        {showAccessToken ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 xs:h-5 xs:w-5 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 xs:h-5 xs:w-5 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Account Details */}
              {selectedPlatform && (
                <div className="p-4 xs:p-6 md:p-8 bg-gray-50 animate-fadeIn">
                  <div className="flex items-center gap-2 xs:gap-3 mb-4 xs:mb-6">
                    <div className="h-8 w-8 xs:h-10 xs:w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 xs:h-5 xs:w-5 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-base xs:text-lg md:text-xl font-semibold text-gray-900">
                        Account Details
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 ss:grid-cols-2 gap-4 xs:gap-6">
                    {/* Account ID */}
                    <div className="space-y-2">
                      <label className="block text-xs xs:text-sm font-semibold text-gray-700">
                        Account ID
                        <span className="ml-1 text-xs font-normal text-gray-400">(required)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., act_123456789"
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base border border-gray-300 rounded-lg xs:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 bg-white"
                        required
                      />
                    </div>

                    {/* Account Label */}
                    <div className="space-y-2">
                      <label className="block text-xs xs:text-sm font-semibold text-gray-700">
                        Account Label
                        <span className="ml-1 text-xs font-normal text-gray-400">(required)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Primary Ad Account"
                        value={accountLabel}
                        onChange={(e) => setAccountLabel(e.target.value)}
                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base border border-gray-300 rounded-lg xs:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 bg-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit and Cancel Buttons */}
                  <div className="mt-6 xs:mt-8 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3 xs:gap-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 order-2 xs:order-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 xs:h-4 xs:w-4 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="hidden sm:inline">
                        All fields marked as required must be filled
                      </span>
                      <span className="sm:hidden">* Required fields</span>
                    </div>

                    <div className="flex flex-col-reverse ss:flex-row gap-2 xs:gap-3 order-1 xs:order-2">
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className="px-4 xs:px-6 py-2.5 xs:py-3 text-sm xs:text-base border border-gray-300 text-gray-700 font-semibold rounded-lg xs:rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!selectedPlatform || isSubmitting}
                        className="px-4 xs:px-6 lg:px-8 py-2.5 xs:py-3 text-sm xs:text-base bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg xs:rounded-xl transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
                      >
                        {isSubmitting ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 xs:h-5 xs:w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span>Adding...</span>
                          </>
                        ) : (
                          <span>Add Account</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Column - Connected Accounts Panel (1/3 width) */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl xs:rounded-2xl shadow-sm border border-gray-200 overflow-hidden xl:sticky xl:top-8">
              {/* Header */}
              <div className="p-4 xs:p-5 md:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base xs:text-lg font-semibold text-gray-900">
                    Added Accounts
                  </h3>
                  <span className="px-2 xs:px-2.5 py-0.5 xs:py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                    {filteredAccounts.length}
                  </span>
                </div>
                <p className="text-xs xs:text-sm text-gray-500">Manage your active integrations</p>
              </div>

              {/* Platform Filter Tabs */}
              <div className="p-3 xs:p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => setPlatformFilter("all")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      platformFilter === "all"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    All ({connectedAccounts.length})
                  </button>
                  {platforms.map((platform) => (
                    <button
                      key={platform.value}
                      onClick={() => setPlatformFilter(platform.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                        platformFilter === platform.value
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <img
                        src={platform.icon}
                        alt={platform.name}
                        className="w-3.5 h-3.5 object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <span>{platform.name}</span>
                      <span
                        className={`ml-0.5 ${
                          platformFilter === platform.value ? "text-indigo-200" : "text-gray-400"
                        }`}
                      >
                        ({platformCounts[platform.value] || 0})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account List */}
              <div className="p-3 xs:p-4 space-y-2 xs:space-y-3 max-h-[400px] xs:max-h-[500px] md:max-h-[600px] overflow-y-auto">
                {isLoadingAccounts ? (
                  <div className="text-center py-8 xs:py-12">
                    <svg
                      className="animate-spin h-8 w-8 xs:h-10 xs:w-10 text-indigo-600 mx-auto mb-3 xs:mb-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <p className="text-xs xs:text-sm text-gray-500">Loading accounts...</p>
                  </div>
                ) : filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account) => {
                    const platform = getPlatformById(account.platform);
                    return (
                      <div
                        key={account.id}
                        className="p-3 xs:p-4 bg-gray-50 rounded-lg xs:rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm"
                      >
                        <div className="flex items-start gap-2 xs:gap-3">
                          <div className="h-8 w-8 xs:h-10 xs:w-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm p-1.5">
                            {platform?.icon ? (
                              <img
                                src={platform.icon}
                                alt={platform.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <PlatformIcon platform={account.platform} className="w-full h-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-xs xs:text-sm text-gray-900 truncate">
                                {account.accountLabel}
                              </h4>
                            </div>
                            <p className="text-xs text-gray-500 truncate mb-1.5 xs:mb-2">
                              {account.accountId}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-2.5 xs:mt-3 pt-2.5 xs:pt-3 border-t border-gray-200">
                          <button
                            onClick={() => handleEdit(account)}
                            className="flex-1 px-2.5 xs:px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md xs:rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1 xs:gap-1.5"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 xs:h-3.5 xs:w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            <span className="hidden xs:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(account)}
                            className="flex-1 px-2.5 xs:px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md xs:rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1 xs:gap-1.5"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 xs:h-3.5 xs:w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            <span className="hidden xs:inline">Remove</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 xs:py-12">
                    <div className="h-12 w-12 xs:h-16 xs:w-16 bg-gray-100 rounded-xl xs:rounded-2xl flex items-center justify-center mx-auto mb-3 xs:mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 xs:h-8 xs:w-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                    </div>
                    <p className="text-xs xs:text-sm font-medium text-gray-900 mb-1">
                      {platformFilter === "all"
                        ? "No accounts Added"
                        : `No ${platforms.find((p) => p.value === platformFilter)?.name} accounts`}
                    </p>
                    <p className="text-xs text-gray-500">Add your first account to get started</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 xs:p-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="w-full px-3 xs:px-4 py-2 xs:py-2.5 text-xs xs:text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5 xs:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3.5 w-3.5 xs:h-4 xs:w-4 ${isRefreshing ? "animate-spin" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {isRefreshing ? "Refreshing..." : "Refresh All Accounts"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditAccountModal
        account={selectedAccount}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedAccount(null);
        }}
        onUpdate={handleEditComplete}
        platforms={platforms}
      />

      <DeleteConfirmModal
        account={selectedAccount}
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedAccount(null);
        }}
        onConfirm={handleDeleteConfirm}
        platforms={platforms}
      />

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Add_Accounts;
