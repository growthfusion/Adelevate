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
  deleteAccount,
} from "@/services/accountsConfig";

// Edit Modal Component
function EditAccountModal({ account, isOpen, onClose, onUpdate, platforms }) {
  const [formData, setFormData] = useState({
    bmName: account?.bmName || "",
    accessToken: account?.accessToken || "",
    accountId: account?.accountId || "",
    accountLabel: account?.accountLabel || "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (account) {
      setFormData({
        bmName: account.bmName || "",
        accessToken: account.accessToken || "",
        accountId: account.accountId || "",
        accountLabel: account.accountLabel || "",
      });
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <img src={platform?.icon} alt={platform?.name} className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Edit {platform?.name} Account
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Update account credentials and details
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {account.platform === "facebook" && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Business Manager Name
              </label>
              <input
                type="text"
                value={formData.bmName}
                onChange={(e) =>
                  setFormData({ ...formData, bmName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Access Token
            </label>
            <input
              type="password"
              value={formData.accessToken}
              onChange={(e) =>
                setFormData({ ...formData, accessToken: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Account ID
              </label>
              <input
                type="text"
                value={formData.accountId}
                onChange={(e) =>
                  setFormData({ ...formData, accountId: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Account Label
              </label>
              <input
                type="text"
                value={formData.accountLabel}
                onChange={(e) =>
                  setFormData({ ...formData, accountLabel: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 transition-all flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
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
                  className="h-5 w-5"
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
        <div className="p-6">
          <div className="h-14 w-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-red-600"
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

          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
            Delete Account?
          </h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            Are you sure you want to remove <strong>{account.accountLabel}</strong>? This action cannot be undone.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <img src={platform?.icon} alt={platform?.name} className="w-10 h-10" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {account.accountLabel}
                </p>
                <p className="text-xs text-gray-500 truncate">{account.accountId}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:bg-gray-400 transition-all flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
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
                  className="h-5 w-5"
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

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const platforms = [
    {
      name: "Meta",
      icon: fb,
      value: "facebook",
      description: "Facebook & Instagram Ads",
    },
    {
      name: "NewsBreak",
      icon: nb,
      value: "newsbreak",
      description: "NewsBreak Platform",
    },
    {
      name: "Snapchat",
      icon: snapchatIcon,
      value: "snapchat",
      description: "Snapchat Ads Manager",
    },
    {
      name: "TikTok",
      icon: tiktokIcon,
      value: "tiktok",
      description: "TikTok Ads Platform",
    },
    {
      name: "Google",
      icon: googleIcon,
      value: "google",
      description: "Google Ads & Analytics",
    },
  ];

  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const accounts = await getAllAccounts();
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
        accountLabel,
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
        setSelectedPlatform("");
        setBmName("");
        setAccessToken("");
        setAccountId("");
        setAccountLabel("");
        setSuccess("");
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
    return platforms.find((p) => p.value === value);
  };

  const getTimeSince = (timestamp) => {
    if (!timestamp) return "Never";
    
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
    
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
           
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Platform Integrations
              </h1>
              <p className="text-gray-500 mt-1">
                Add your advertising platforms to start managing campaigns
              </p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {success && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-fadeIn">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              <h3 className="text-sm font-semibold text-green-900">Success!</h3>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-fadeIn">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-red-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              <h3 className="text-sm font-semibold text-red-900">Error occurred</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Integration Form (2/3 width) */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Section 1: Platform Selection */}
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-indigo-600"
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
                    <h2 className="text-xl font-semibold text-gray-900">
                      Platform Details
                    </h2>
                  
                  </div>
                </div>

                {/* Platform Selector Grid */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Platform
                    <span className="ml-1 text-xs font-normal text-gray-400">
                      (required)
                    </span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {platforms.map((platform) => {
                      const isSelected = selectedPlatform === platform.value;
                      return (
                        <button
                          key={platform.value}
                          type="button"
                          onClick={() => setSelectedPlatform(platform.value)}
                          className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-50 shadow-md scale-[1.02]"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isSelected ? "bg-white shadow-sm" : "bg-gray-50"
                              }`}
                            >
                              <img
                                src={platform.icon}
                                alt={platform.name}
                                className="w-7 h-7"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">
                                  {platform.name}
                                </h3>
                                {isSelected && (
                                  <div className="h-5 w-5 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg
                                      className="w-3 h-3 text-white"
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
                              <p className="text-xs text-gray-500 mt-1">
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
                  <div className="mt-6 space-y-2 animate-fadeIn">
                    <label className="block text-sm font-semibold text-gray-700">
                      Business Manager Name
                      <span className="ml-1 text-xs font-normal text-gray-400">
                        (required)
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., My Business Manager"
                      value={bmName}
                      onChange={(e) => setBmName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm placeholder-gray-400"
                      required
                    />
                   
                  </div>
                )}

                {/* Access Token */}
                {selectedPlatform && (
                  <div className="mt-6 space-y-2 animate-fadeIn">
                    <label className="block text-sm font-semibold text-gray-700">
                      Access Token
                      <span className="ml-1 text-xs font-normal text-gray-400">
                        (required)
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Enter your API access token"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm placeholder-gray-400 font-mono"
                        required
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-400"
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
                      </div>
                    </div>
                   
                  </div>
                )}
              </div>

              {/* Section 2: Account Details */}
              {selectedPlatform && (
                <div className="p-8 bg-gray-50 animate-fadeIn">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-purple-600"
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
                      <h2 className="text-xl font-semibold text-gray-900">
                        Account Details
                      </h2>

                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Account ID */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Account ID
                        <span className="ml-1 text-xs font-normal text-gray-400">
                          (required)
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., act_123456789"
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm placeholder-gray-400 bg-white"
                        required
                      />
                    
                    </div>

                    {/* Account Label */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Account Label
                        <span className="ml-1 text-xs font-normal text-gray-400">
                          (required)
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Primary Ad Account"
                        value={accountLabel}
                        onChange={(e) => setAccountLabel(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm placeholder-gray-400 bg-white"
                        required
                      />
                     
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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
                      <span>All fields marked as required must be filled</span>
                    </div>

                    <button
                      type="submit"
                      disabled={!selectedPlatform || isSubmitting}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none flex items-center gap-2 transform hover:scale-105 active:scale-95"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
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
                          <span>adding...</span>
                        </>
                      ) : (
                        <>
                         
                          <span>Add Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Column - Connected Accounts Panel (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Added Accounts
                  </h3>
                  <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                    {connectedAccounts.length}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Manage your active integrations
                </p>
              </div>

              {/* Account List */}
              <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {isLoadingAccounts ? (
                  <div className="text-center py-12">
                    <svg
                      className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4"
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
                    <p className="text-sm text-gray-500">Loading accounts...</p>
                  </div>
                ) : connectedAccounts.length > 0 ? (
                  connectedAccounts.map((account) => {
                    const platform = getPlatformById(account.platform);
                    return (
                      <div
                        key={account.id}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                            <img
                              src={platform?.icon}
                              alt={platform?.name}
                              className="w-6 h-6"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-sm text-gray-900 truncate">
                                {account.accountLabel}
                              </h4>
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex-shrink-0">
                                Active
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate mb-2">
                              {account.accountId}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span>Synced {getTimeSince(account.lastSync)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => handleEdit(account)}
                            className="flex-1 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
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
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(account)}
                            className="flex-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
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
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-gray-400"
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
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      No accounts Added
                    </p>
                    <p className="text-xs text-gray-500">
                      Add your first account to get started
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="w-full px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
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