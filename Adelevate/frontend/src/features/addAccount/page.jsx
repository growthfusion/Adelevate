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
import { useTheme } from "@/context/ThemeContext";

// ============================================
// PREMIUM SAAS THEME CONFIGURATION
// ============================================
const createPremiumTheme = (isDarkMode) => {
  if (isDarkMode) {
    return {
      // Backgrounds - Deep Rich Blacks
      bgMain: "#050505",
      bgCard: "#0A0A0A",
      bgCardHover: "#0E0E0E",
      bgCardElevated: "#0C0C0C",
      bgSection: "#080808",
      bgMuted: "#0F0F0F",
      bgInput: "#0A0A0A",
      bgInputHover: "#0E0E0E",
      bgButton: "#111111",
      bgButtonHover: "#1A1A1A",
      bgButtonSecondary: "#151515",
      bgDropdown: "#0C0C0C",
      bgModal: "#0A0A0A",
      bgOverlay: "rgba(0, 0, 0, 0.75)",

      // Gradients
      gradientPrimary: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
      gradientSecondary: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
      gradientAccent: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
      gradientSuccess: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
      gradientDanger: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
      gradientCard: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
      gradientHeader: "linear-gradient(135deg, #0A0A0A 0%, #111111 100%)",

      // Borders
      borderSubtle: "rgba(255, 255, 255, 0.06)",
      borderMedium: "rgba(255, 255, 255, 0.1)",
      borderStrong: "rgba(255, 255, 255, 0.15)",
      borderInput: "rgba(255, 255, 255, 0.08)",
      borderInputFocus: "#3B82F6",
      borderInputHover: "rgba(255, 255, 255, 0.12)",
      dividerSubtle: "rgba(255, 255, 255, 0.04)",

      // Text
      textPrimary: "#FAFAFA",
      textSecondary: "#A3A3A3",
      textTertiary: "#707070",
      textMuted: "#505050",
      textInverse: "#0A0A0A",

      // Accent Colors
      accent: "#3B82F6",
      accentHover: "#60A5FA",
      accentLight: "rgba(59, 130, 246, 0.15)",
      accentLighter: "rgba(59, 130, 246, 0.08)",
      accentGlow: "rgba(59, 130, 246, 0.35)",

      // Status Colors with Glow
      success: "#10B981",
      successLight: "rgba(16, 185, 129, 0.15)",
      successBorder: "rgba(16, 185, 129, 0.3)",
      successGlow: "rgba(16, 185, 129, 0.25)",

      warning: "#F59E0B",
      warningLight: "rgba(245, 158, 11, 0.15)",
      warningBorder: "rgba(245, 158, 11, 0.3)",
      warningGlow: "rgba(245, 158, 11, 0.25)",

      error: "#EF4444",
      errorLight: "rgba(239, 68, 68, 0.15)",
      errorBorder: "rgba(239, 68, 68, 0.3)",
      errorGlow: "rgba(239, 68, 68, 0.25)",

      info: "#3B82F6",
      infoLight: "rgba(59, 130, 246, 0.15)",
      infoBorder: "rgba(59, 130, 246, 0.3)",
      infoGlow: "rgba(59, 130, 246, 0.25)",

      purple: "#8B5CF6",
      purpleLight: "rgba(139, 92, 246, 0.15)",
      purpleBorder: "rgba(139, 92, 246, 0.3)",

      // Platform Colors
      platformMeta: {
        bg: "rgba(24, 119, 242, 0.15)",
        border: "rgba(24, 119, 242, 0.3)",
        color: "#60A5FA"
      },
      platformSnap: {
        bg: "rgba(255, 252, 0, 0.12)",
        border: "rgba(255, 252, 0, 0.25)",
        color: "#FFFC00"
      },
      platformTikTok: {
        bg: "rgba(255, 255, 255, 0.08)",
        border: "rgba(255, 255, 255, 0.15)",
        color: "#FFFFFF"
      },
      platformGoogle: {
        bg: "rgba(66, 133, 244, 0.15)",
        border: "rgba(66, 133, 244, 0.3)",
        color: "#60A5FA"
      },
      platformNewsBreak: {
        bg: "rgba(255, 107, 107, 0.15)",
        border: "rgba(255, 107, 107, 0.3)",
        color: "#FF6B6B"
      },

      // Shadows
      shadowSm: "0 1px 2px rgba(0, 0, 0, 0.5)",
      shadowMd: "0 4px 16px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.03)",
      shadowLg: "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.04)",
      shadowXl: "0 24px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)",
      shadowGlow: "0 0 40px rgba(59, 130, 246, 0.2)",
      shadowInner: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
      shadowButton: "0 4px 14px rgba(59, 130, 246, 0.4)",
      shadowButtonHover: "0 8px 25px rgba(59, 130, 246, 0.5)"
    };
  } else {
    return {
      // Light Theme - Clean & Sophisticated
      bgMain: "#F8F9FC",
      bgCard: "#FFFFFF",
      bgCardHover: "#FAFBFD",
      bgCardElevated: "#FFFFFF",
      bgSection: "#F5F6FA",
      bgMuted: "#F3F4F8",
      bgInput: "#FFFFFF",
      bgInputHover: "#FAFBFC",
      bgButton: "#F5F6FA",
      bgButtonHover: "#EBEDF3",
      bgButtonSecondary: "#F0F1F5",
      bgDropdown: "#FFFFFF",
      bgModal: "#FFFFFF",
      bgOverlay: "rgba(15, 23, 42, 0.5)",

      // Gradients
      gradientPrimary: "linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)",
      gradientSecondary: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
      gradientAccent: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
      gradientSuccess: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
      gradientDanger: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
      gradientCard: "linear-gradient(180deg, #FFFFFF 0%, #FEFEFE 100%)",
      gradientHeader: "linear-gradient(135deg, #F8F9FC 0%, #FFFFFF 100%)",

      // Borders
      borderSubtle: "#E8EAF0",
      borderMedium: "#DDE0E9",
      borderStrong: "#CBD0DC",
      borderInput: "#E2E5ED",
      borderInputFocus: "#4F46E5",
      borderInputHover: "#D1D5E0",
      dividerSubtle: "#F0F1F5",

      // Text
      textPrimary: "#0F172A",
      textSecondary: "#475569",
      textTertiary: "#64748B",
      textMuted: "#94A3B8",
      textInverse: "#FFFFFF",

      // Accent Colors
      accent: "#4F46E5",
      accentHover: "#4338CA",
      accentLight: "rgba(79, 70, 229, 0.08)",
      accentLighter: "rgba(79, 70, 229, 0.04)",
      accentGlow: "rgba(79, 70, 229, 0.15)",

      // Status Colors
      success: "#059669",
      successLight: "#ECFDF5",
      successBorder: "#A7F3D0",
      successGlow: "rgba(5, 150, 105, 0.1)",

      warning: "#D97706",
      warningLight: "#FFFBEB",
      warningBorder: "#FDE68A",
      warningGlow: "rgba(217, 119, 6, 0.1)",

      error: "#DC2626",
      errorLight: "#FEF2F2",
      errorBorder: "#FECACA",
      errorGlow: "rgba(220, 38, 38, 0.1)",

      info: "#2563EB",
      infoLight: "#EFF6FF",
      infoBorder: "#BFDBFE",
      infoGlow: "rgba(37, 99, 235, 0.1)",

      purple: "#7C3AED",
      purpleLight: "#F5F3FF",
      purpleBorder: "#DDD6FE",

      // Platform Colors
      platformMeta: { bg: "#E7F3FF", border: "#BFDBFE", color: "#1877F2" },
      platformSnap: { bg: "#FFFDE7", border: "#FEF08A", color: "#FACC15" },
      platformTikTok: { bg: "#F5F5F5", border: "#E5E5E5", color: "#000000" },
      platformGoogle: { bg: "#E8F0FE", border: "#BFDBFE", color: "#4285F4" },
      platformNewsBreak: { bg: "#FFE7E7", border: "#FECACA", color: "#DC2626" },

      // Shadows
      shadowSm: "0 1px 2px rgba(15, 23, 42, 0.04)",
      shadowMd: "0 4px 12px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)",
      shadowLg: "0 12px 32px rgba(15, 23, 42, 0.08), 0 4px 8px rgba(15, 23, 42, 0.04)",
      shadowXl: "0 24px 56px rgba(15, 23, 42, 0.12), 0 8px 16px rgba(15, 23, 42, 0.06)",
      shadowGlow: "0 0 0 3px rgba(79, 70, 229, 0.12)",
      shadowInner: "inset 0 1px 2px rgba(15, 23, 42, 0.06)",
      shadowButton: "0 4px 14px rgba(79, 70, 229, 0.25)",
      shadowButtonHover: "0 8px 25px rgba(79, 70, 229, 0.35)"
    };
  }
};

// Platform Icon Component with Enhanced Fallback
const PlatformIcon = ({ platform, className = "w-6 h-6", theme }) => {
  const [imageError, setImageError] = useState(false);

  const platformData = {
    facebook: { icon: fb, name: "Meta" },
    meta: { icon: fb, name: "Meta" },
    newsbreak: { icon: nb, name: "NewsBreak" },
    snapchat: { icon: snapchatIcon, name: "Snapchat" },
    snap: { icon: snapchatIcon, name: "Snapchat" },
    tiktok: { icon: tiktokIcon, name: "TikTok" },
    google: { icon: googleIcon, name: "Google" },
    googleads: { icon: googleIcon, name: "Google" }
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
          style={{ color: theme?.textMuted || "#6B7280" }}
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
function EditAccountModal({ account, isOpen, onClose, onUpdate, platforms, theme, isDarkMode }) {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 animate-fadeIn"
      style={{ backgroundColor: theme.bgOverlay, backdropFilter: "blur(8px)" }}
    >
      <div
        className="rounded-2xl xs:rounded-3xl max-w-2xl w-full max-h-[95vh] xs:max-h-[90vh] overflow-hidden animate-slideUp"
        style={{
          backgroundColor: theme.bgModal,
          border: `1px solid ${theme.borderSubtle}`,
          boxShadow: theme.shadowXl
        }}
      >
        {/* Modal Header */}
        <div
          className="p-4 xs:p-5 md:p-6"
          style={{
            borderBottom: `1px solid ${theme.borderSubtle}`,
            background: theme.gradientHeader
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 xs:gap-3">
              <div
                className="h-10 w-10 xs:h-12 xs:w-12 rounded-xl xs:rounded-2xl flex items-center justify-center p-2"
                style={{
                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : theme.bgMuted,
                  border: `1px solid ${theme.borderSubtle}`,
                  boxShadow: theme.shadowSm
                }}
              >
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
                  <PlatformIcon
                    platform={account.platform}
                    className="w-full h-full"
                    theme={theme}
                  />
                )}
              </div>
              <div>
                <h2
                  className="text-lg xs:text-xl md:text-2xl font-bold"
                  style={{ color: theme.textPrimary }}
                >
                  Edit {platform?.name || account.platform || "Account"}
                </h2>
                <p
                  className="text-xs xs:text-sm mt-0.5 hidden xs:block"
                  style={{ color: theme.textTertiary }}
                >
                  Update account credentials and details
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 xs:h-10 xs:w-10 rounded-xl xs:rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0"
              style={{
                backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : theme.bgMuted,
                border: `1px solid ${theme.borderSubtle}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode
                  ? "rgba(255,255,255,0.1)"
                  : theme.bgButtonHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode
                  ? "rgba(255,255,255,0.05)"
                  : theme.bgMuted;
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 xs:h-5 xs:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: theme.textSecondary }}
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
          style={{ backgroundColor: theme.bgCard }}
        >
          {error && (
            <div
              className="rounded-xl xs:rounded-2xl p-3 xs:p-4 flex items-start gap-2 xs:gap-3"
              style={{
                backgroundColor: theme.errorLight,
                border: `1px solid ${theme.errorBorder}`,
                boxShadow: isDarkMode ? `0 0 20px ${theme.errorGlow}` : "none"
              }}
            >
              <div
                className="h-5 w-5 xs:h-6 xs:w-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: theme.error }}
              >
                <svg
                  className="w-3 h-3 xs:w-4 xs:h-4 text-white"
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
              <p className="text-xs xs:text-sm" style={{ color: theme.error }}>
                {error}
              </p>
            </div>
          )}

          {account.platform === "facebook" && (
            <div className="space-y-2">
              <label
                className="block text-xs xs:text-sm font-semibold"
                style={{ color: theme.textSecondary }}
              >
                Business Manager Name
              </label>
              <input
                type="text"
                value={formData.bmName}
                onChange={(e) => setFormData({ ...formData, bmName: e.target.value })}
                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base rounded-xl xs:rounded-xl focus:outline-none transition-all duration-200"
                style={{
                  backgroundColor: theme.bgInput,
                  border: `1px solid ${theme.borderInput}`,
                  color: theme.textPrimary
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.borderInputFocus;
                  e.target.style.boxShadow = theme.shadowGlow;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.borderInput;
                  e.target.style.boxShadow = "none";
                }}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label
              className="block text-xs xs:text-sm font-semibold"
              style={{ color: theme.textSecondary }}
            >
              Access Token
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={formData.accessToken}
                onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 pr-10 text-sm xs:text-base rounded-xl focus:outline-none transition-all duration-200 font-mono"
                style={{
                  backgroundColor: theme.bgInput,
                  border: `1px solid ${theme.borderInput}`,
                  color: theme.textPrimary
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.borderInputFocus;
                  e.target.style.boxShadow = theme.shadowGlow;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.borderInput;
                  e.target.style.boxShadow = "none";
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2 xs:right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors"
                style={{ color: theme.textMuted }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode
                    ? "rgba(255,255,255,0.05)"
                    : theme.bgMuted;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {showToken ? (
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
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
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
              <label
                className="block text-xs xs:text-sm font-semibold"
                style={{ color: theme.textSecondary }}
              >
                Account ID
              </label>
              <input
                type="text"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base rounded-xl focus:outline-none transition-all duration-200"
                style={{
                  backgroundColor: theme.bgInput,
                  border: `1px solid ${theme.borderInput}`,
                  color: theme.textPrimary
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.borderInputFocus;
                  e.target.style.boxShadow = theme.shadowGlow;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.borderInput;
                  e.target.style.boxShadow = "none";
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                className="block text-xs xs:text-sm font-semibold"
                style={{ color: theme.textSecondary }}
              >
                Account Label
              </label>
              <input
                type="text"
                value={formData.accountLabel}
                onChange={(e) => setFormData({ ...formData, accountLabel: e.target.value })}
                className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base rounded-xl focus:outline-none transition-all duration-200"
                style={{
                  backgroundColor: theme.bgInput,
                  border: `1px solid ${theme.borderInput}`,
                  color: theme.textPrimary
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.borderInputFocus;
                  e.target.style.boxShadow = theme.shadowGlow;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.borderInput;
                  e.target.style.boxShadow = "none";
                }}
                required
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div
          className="p-4 xs:p-5 md:p-6 flex flex-col-reverse ss:flex-row items-center justify-end gap-2 xs:gap-3"
          style={{
            borderTop: `1px solid ${theme.borderSubtle}`,
            backgroundColor: theme.bgSection
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="w-full ss:w-auto px-4 xs:px-6 py-2.5 xs:py-3 text-sm xs:text-base font-semibold rounded-xl transition-all duration-200"
            style={{
              backgroundColor: "transparent",
              border: `1px solid ${theme.borderMedium}`,
              color: theme.textSecondary
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bgButtonHover;
              e.currentTarget.style.borderColor = theme.borderStrong;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = theme.borderMedium;
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="w-full ss:w-auto px-4 xs:px-6 py-2.5 xs:py-3 text-sm xs:text-base font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              background: theme.gradientPrimary,
              color: "#FFFFFF",
              boxShadow: theme.shadowButton,
              opacity: isUpdating ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isUpdating) {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = theme.shadowButtonHover;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = theme.shadowButton;
            }}
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
function DeleteConfirmModal({ account, isOpen, onClose, onConfirm, platforms, theme, isDarkMode }) {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 animate-fadeIn"
      style={{ backgroundColor: theme.bgOverlay, backdropFilter: "blur(8px)" }}
    >
      <div
        className="rounded-2xl xs:rounded-3xl max-w-md w-full overflow-hidden animate-slideUp"
        style={{
          backgroundColor: theme.bgModal,
          border: `1px solid ${theme.borderSubtle}`,
          boxShadow: theme.shadowXl
        }}
      >
        <div className="p-4 xs:p-5 md:p-6">
          <div
            className="h-14 w-14 xs:h-16 xs:w-16 rounded-2xl xs:rounded-2xl flex items-center justify-center mx-auto mb-4 xs:mb-5"
            style={{
              backgroundColor: theme.errorLight,
              border: `1px solid ${theme.errorBorder}`,
              boxShadow: isDarkMode ? `0 0 30px ${theme.errorGlow}` : "none"
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 xs:h-8 xs:w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ color: theme.error }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h3
            className="text-lg xs:text-xl font-bold text-center mb-2"
            style={{ color: theme.textPrimary }}
          >
            Delete Account?
          </h3>
          <p
            className="text-xs xs:text-sm text-center mb-4 xs:mb-6 px-2"
            style={{ color: theme.textTertiary }}
          >
            Are you sure you want to remove{" "}
            <strong style={{ color: theme.textPrimary }}>{account.accountLabel}</strong>? This
            action cannot be undone.
          </p>

          <div
            className="rounded-xl xs:rounded-2xl p-3 xs:p-4 mb-4 xs:mb-6"
            style={{
              backgroundColor: theme.bgMuted,
              border: `1px solid ${theme.borderSubtle}`
            }}
          >
            <div className="flex items-center gap-2 xs:gap-3">
              <div
                className="h-10 w-10 xs:h-12 xs:w-12 rounded-xl flex items-center justify-center flex-shrink-0 p-2"
                style={{
                  backgroundColor: theme.bgCard,
                  border: `1px solid ${theme.borderSubtle}`,
                  boxShadow: theme.shadowSm
                }}
              >
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
                  <PlatformIcon
                    platform={account.platform}
                    className="w-full h-full"
                    theme={theme}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold text-sm xs:text-base truncate"
                  style={{ color: theme.textPrimary }}
                >
                  {account.accountLabel}
                </p>
                <p className="text-xs truncate" style={{ color: theme.textTertiary }}>
                  {account.accountId}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="p-4 xs:p-5 md:p-6 flex flex-col-reverse ss:flex-row items-center justify-end gap-2 xs:gap-3"
          style={{
            borderTop: `1px solid ${theme.borderSubtle}`,
            backgroundColor: theme.bgSection
          }}
        >
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="w-full ss:w-auto px-4 xs:px-6 py-2.5 xs:py-3 text-sm xs:text-base font-semibold rounded-xl transition-all duration-200"
            style={{
              backgroundColor: "transparent",
              border: `1px solid ${theme.borderMedium}`,
              color: theme.textSecondary,
              opacity: isDeleting ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = theme.bgButtonHover;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full ss:w-auto px-4 xs:px-6 py-2.5 xs:py-3 text-sm xs:text-base font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              background: theme.gradientDanger,
              color: "#FFFFFF",
              boxShadow: isDarkMode
                ? `0 4px 20px ${theme.errorGlow}`
                : "0 4px 14px rgba(239, 68, 68, 0.3)",
              opacity: isDeleting ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
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
  const { isDarkMode } = useTheme();
  const theme = createPremiumTheme(isDarkMode);

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
    { name: "Meta", icon: fb, value: "facebook", description: "Facebook & Instagram Ads" },
    { name: "NewsBreak", icon: nb, value: "newsbreak", description: "NewsBreak Platform" },
    {
      name: "Snapchat",
      icon: snapchatIcon,
      value: "snapchat",
      description: "Snapchat Ads Manager"
    },
    { name: "TikTok", icon: tiktokIcon, value: "tiktok", description: "TikTok Ads Platform" },
    { name: "Google", icon: googleIcon, value: "google", description: "Google Ads & Analytics" }
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

      const exists = await accountExists(selectedPlatform, accountId);
      if (exists) {
        setError("An account with this ID already exists for this platform.");
        setIsSubmitting(false);
        return;
      }

      const id = await addAccount(accountData);
      console.log("✅ Account added successfully with ID:", id);

      setSuccess("Account added successfully!");
      await loadAccounts();

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
    return platforms.find((p) => p.value === value) || null;
  };

  const filteredAccounts =
    platformFilter === "all"
      ? connectedAccounts
      : connectedAccounts.filter((account) => account.platform === platformFilter);

  const platformCounts = platforms.reduce((acc, platform) => {
    acc[platform.value] = connectedAccounts.filter(
      (account) => account.platform === platform.value
    ).length;
    return acc;
  }, {});

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: theme.bgMain }}
    >
      {/* Main Content */}
      <div className="pt-[20%] xs:pt-[20%] sm:pt-6 md:pt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Header Section */}
        <div className="mb-6 xs:mb-8">
          <div className="flex items-center gap-3 mb-3">
           
            <div>
              <h1
                className="text-xl xs:text-2xl md:text-3xl font-bold"
                style={{ color: theme.textPrimary }}
              >
                Platform Integrations
              </h1>
              <p
                className="text-xs xs:text-sm md:text-base mt-1"
                style={{ color: theme.textTertiary }}
              >
                Add your advertising platforms to start managing campaigns
              </p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {success && (
          <div
            className="mb-4 xs:mb-6 rounded-xl xs:rounded-2xl p-3 xs:p-4 flex items-start gap-2 xs:gap-3 animate-fadeIn"
            style={{
              backgroundColor: theme.successLight,
              border: `1px solid ${theme.successBorder}`,
              boxShadow: isDarkMode ? `0 0 30px ${theme.successGlow}` : theme.shadowMd
            }}
          >
            <div
              className="h-6 w-6 xs:h-8 xs:w-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: theme.gradientSuccess }}
            >
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
            <div className="flex-1">
              <h3 className="text-xs xs:text-sm font-semibold" style={{ color: theme.success }}>
                Success!
              </h3>
              <p
                className="text-xs xs:text-sm mt-0.5"
                style={{ color: isDarkMode ? theme.success : "#065F46" }}
              >
                {success}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div
            className="mb-4 xs:mb-6 rounded-xl xs:rounded-2xl p-3 xs:p-4 flex items-start gap-2 xs:gap-3 animate-fadeIn"
            style={{
              backgroundColor: theme.errorLight,
              border: `1px solid ${theme.errorBorder}`,
              boxShadow: isDarkMode ? `0 0 30px ${theme.errorGlow}` : theme.shadowMd
            }}
          >
            <div
              className="h-6 w-6 xs:h-8 xs:w-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: theme.gradientDanger }}
            >
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
            <div className="flex-1">
              <h3 className="text-xs xs:text-sm font-semibold" style={{ color: theme.error }}>
                Error occurred
              </h3>
              <p
                className="text-xs xs:text-sm mt-0.5"
                style={{ color: isDarkMode ? theme.error : "#991B1B" }}
              >
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xs:gap-6 lg:gap-8">
          {/* Left Column - Integration Form */}
          <div className="xl:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl xs:rounded-3xl overflow-hidden"
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.borderSubtle}`,
                boxShadow: theme.shadowMd
              }}
            >
              {/* Section 1: Platform Selection */}
              <div
                className="p-4 xs:p-6 md:p-8"
                style={{ borderBottom: `1px solid ${theme.borderSubtle}` }}
              >
                <div className="flex items-center gap-2 xs:gap-3 mb-4 xs:mb-6">
                 
                  <div>
                    <h2
                      className="text-base xs:text-lg md:text-xl font-bold"
                      style={{ color: theme.textPrimary }}
                    >
                      Platform Details
                    </h2>
                  </div>
                </div>

                {/* Platform Selector Grid */}
                <div className="space-y-3">
                  <label
                    className="block text-xs xs:text-sm font-semibold mb-2 xs:mb-3"
                    style={{ color: theme.textSecondary }}
                  >
                    Select Platform
                    <span className="ml-1 text-xs font-normal" style={{ color: theme.textMuted }}>
                      (required)
                    </span>
                  </label>

                  <div className="grid grid-cols-1 ss:grid-cols-2 lg:grid-cols-2 gap-2 xs:gap-3">
                    {platforms.map((platform) => {
                      const isSelected = selectedPlatform === platform.value;
                      return (
                        <button
                          key={platform.value}
                          type="button"
                          onClick={() => setSelectedPlatform(platform.value)}
                          className="relative p-3 xs:p-4 rounded-xl xs:rounded-2xl transition-all duration-200 text-left"
                          style={{
                            backgroundColor: isSelected
                              ? theme.accentLight
                              : isDarkMode
                                ? "rgba(255,255,255,0.02)"
                                : theme.bgMuted,
                            border: `2px solid ${isSelected ? theme.accent : theme.borderSubtle}`,
                            boxShadow: isSelected
                              ? isDarkMode
                                ? `0 0 20px ${theme.accentGlow}`
                                : theme.shadowMd
                              : "none",
                            transform: isSelected ? "scale(1.02)" : "scale(1)"
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = theme.borderMedium;
                              e.currentTarget.style.backgroundColor = isDarkMode
                                ? "rgba(255,255,255,0.04)"
                                : theme.bgButtonHover;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = theme.borderSubtle;
                              e.currentTarget.style.backgroundColor = isDarkMode
                                ? "rgba(255,255,255,0.02)"
                                : theme.bgMuted;
                            }
                          }}
                        >
                          <div className="flex items-start gap-2 xs:gap-3">
                            <div
                              className="h-10 w-10 xs:h-12 xs:w-12 rounded-xl flex items-center justify-center flex-shrink-0 p-2"
                              style={{
                                backgroundColor: isSelected
                                  ? theme.bgCard
                                  : isDarkMode
                                    ? "rgba(255,255,255,0.05)"
                                    : theme.bgCard,
                                border: `1px solid ${theme.borderSubtle}`,
                                boxShadow: theme.shadowSm
                              }}
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
                                <h3
                                  className="font-semibold text-sm xs:text-base"
                                  style={{ color: theme.textPrimary }}
                                >
                                  {platform.name}
                                </h3>
                                {isSelected && (
                                  <div
                                    className="h-5 w-5 xs:h-6 xs:w-6 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{
                                      background: theme.gradientPrimary,
                                      boxShadow: isDarkMode
                                        ? `0 0 10px ${theme.accentGlow}`
                                        : theme.shadowSm
                                    }}
                                  >
                                    <svg
                                      className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-white"
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
                              <p
                                className="text-xs mt-0.5 xs:mt-1"
                                style={{ color: theme.textTertiary }}
                              >
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
                    <label
                      className="block text-xs xs:text-sm font-semibold"
                      style={{ color: theme.textSecondary }}
                    >
                      Business Manager Name
                      <span className="ml-1 text-xs font-normal" style={{ color: theme.textMuted }}>
                        (required)
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., My Business Manager"
                      value={bmName}
                      onChange={(e) => setBmName(e.target.value)}
                      className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base rounded-xl focus:outline-none transition-all duration-200"
                      style={{
                        backgroundColor: theme.bgInput,
                        border: `1px solid ${theme.borderInput}`,
                        color: theme.textPrimary
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = theme.borderInputFocus;
                        e.target.style.boxShadow = theme.shadowGlow;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = theme.borderInput;
                        e.target.style.boxShadow = "none";
                      }}
                      required
                    />
                  </div>
                )}

                {/* Access Token */}
                {selectedPlatform && (
                  <div className="mt-4 xs:mt-6 space-y-2 animate-fadeIn">
                    <label
                      className="block text-xs xs:text-sm font-semibold"
                      style={{ color: theme.textSecondary }}
                    >
                      Access Token
                      <span className="ml-1 text-xs font-normal" style={{ color: theme.textMuted }}>
                        (required)
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showAccessToken ? "text" : "password"}
                        placeholder="Enter your API access token"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 pr-10 xs:pr-12 text-sm xs:text-base rounded-xl focus:outline-none transition-all duration-200 font-mono"
                        style={{
                          backgroundColor: theme.bgInput,
                          border: `1px solid ${theme.borderInput}`,
                          color: theme.textPrimary
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = theme.borderInputFocus;
                          e.target.style.boxShadow = theme.shadowGlow;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = theme.borderInput;
                          e.target.style.boxShadow = "none";
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowAccessToken(!showAccessToken)}
                        className="absolute right-2 xs:right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors"
                        style={{ color: theme.textMuted }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = isDarkMode
                            ? "rgba(255,255,255,0.05)"
                            : theme.bgMuted;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        {showAccessToken ? (
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
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
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
                <div
                  className="p-4 xs:p-6 md:p-8 animate-fadeIn"
                  style={{ backgroundColor: theme.bgSection }}
                >
                  <div className="flex items-center gap-2 xs:gap-3 mb-4 xs:mb-6">
                   
                    <div>
                      <h2
                        className="text-base xs:text-lg md:text-xl font-bold"
                        style={{ color: theme.textPrimary }}
                      >
                        Account Details
                      </h2>
                   
                    </div>
                  </div>

                  <div className="grid grid-cols-1 ss:grid-cols-2 gap-4 xs:gap-6">
                    {/* Account ID */}
                    <div className="space-y-2">
                      <label
                        className="block text-xs xs:text-sm font-semibold"
                        style={{ color: theme.textSecondary }}
                      >
                        Account ID
                        <span
                          className="ml-1 text-xs font-normal"
                          style={{ color: theme.textMuted }}
                        >
                          (required)
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., act_123456789"
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base rounded-xl focus:outline-none transition-all duration-200"
                        style={{
                          backgroundColor: theme.bgInput,
                          border: `1px solid ${theme.borderInput}`,
                          color: theme.textPrimary
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = theme.borderInputFocus;
                          e.target.style.boxShadow = theme.shadowGlow;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = theme.borderInput;
                          e.target.style.boxShadow = "none";
                        }}
                        required
                      />
                    </div>

                    {/* Account Label */}
                    <div className="space-y-2">
                      <label
                        className="block text-xs xs:text-sm font-semibold"
                        style={{ color: theme.textSecondary }}
                      >
                        Account Label
                        <span
                          className="ml-1 text-xs font-normal"
                          style={{ color: theme.textMuted }}
                        >
                          (required)
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Primary Ad Account"
                        value={accountLabel}
                        onChange={(e) => setAccountLabel(e.target.value)}
                        className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base rounded-xl focus:outline-none transition-all duration-200"
                        style={{
                          backgroundColor: theme.bgInput,
                          border: `1px solid ${theme.borderInput}`,
                          color: theme.textPrimary
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = theme.borderInputFocus;
                          e.target.style.boxShadow = theme.shadowGlow;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = theme.borderInput;
                          e.target.style.boxShadow = "none";
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Submit and Cancel Buttons */}
                  <div className="mt-6 xs:mt-8 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3 xs:gap-4">
                    <div
                      className="flex items-center gap-2 text-xs order-2 xs:order-1"
                      style={{ color: theme.textMuted }}
                    >
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
                        className="px-4 xs:px-6 py-2.5 xs:py-3 text-sm xs:text-base font-semibold rounded-xl transition-all duration-200"
                        style={{
                          backgroundColor: "transparent",
                          border: `1px solid ${theme.borderMedium}`,
                          color: theme.textSecondary,
                          opacity: isSubmitting ? 0.5 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!isSubmitting) {
                            e.currentTarget.style.backgroundColor = theme.bgButtonHover;
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!selectedPlatform || isSubmitting}
                        className="px-4 xs:px-6 lg:px-8 py-2.5 xs:py-3 text-sm xs:text-base font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                        style={{
                          background:
                            !selectedPlatform || isSubmitting
                              ? theme.bgMuted
                              : theme.gradientPrimary,
                          color: !selectedPlatform || isSubmitting ? theme.textMuted : "#FFFFFF",
                          boxShadow:
                            !selectedPlatform || isSubmitting ? "none" : theme.shadowButton,
                          cursor: !selectedPlatform || isSubmitting ? "not-allowed" : "pointer"
                        }}
                        onMouseEnter={(e) => {
                          if (selectedPlatform && !isSubmitting) {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = theme.shadowButtonHover;
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            selectedPlatform && !isSubmitting ? theme.shadowButton : "none";
                        }}
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
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            <span>Add Account</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Column - Connected Accounts Panel */}
          <div className="xl:col-span-1">
            <div
              className="rounded-2xl xs:rounded-3xl overflow-hidden xl:sticky xl:top-8"
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.borderSubtle}`,
                boxShadow: theme.shadowMd
              }}
            >
              {/* Header */}
              <div
                className="p-4 xs:p-5 md:p-6"
                style={{
                  borderBottom: `1px solid ${theme.borderSubtle}`,
                  background: theme.gradientHeader
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3
                    className="text-base xs:text-lg font-bold"
                    style={{ color: theme.textPrimary }}
                  >
                    Added Accounts
                  </h3>
                  <span
                    className="px-2.5 xs:px-3 py-1 text-xs font-bold rounded-full"
                    style={{
                      background: theme.gradientPrimary,
                      color: "#FFFFFF",
                      boxShadow: isDarkMode ? `0 0 12px ${theme.accentGlow}` : theme.shadowSm
                    }}
                  >
                    {filteredAccounts.length}
                  </span>
                </div>
                <p className="text-xs xs:text-sm" style={{ color: theme.textTertiary }}>
                  Manage your active integrations
                </p>
              </div>

              {/* Platform Filter Tabs */}
              <div
                className="p-3 xs:p-4"
                style={{
                  borderBottom: `1px solid ${theme.borderSubtle}`,
                  backgroundColor: theme.bgSection
                }}
              >
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => setPlatformFilter("all")}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200"
                    style={{
                      background: platformFilter === "all" ? theme.gradientPrimary : "transparent",
                      color: platformFilter === "all" ? "#FFFFFF" : theme.textSecondary,
                      border: `1px solid ${platformFilter === "all" ? "transparent" : theme.borderSubtle}`,
                      boxShadow:
                        platformFilter === "all" && isDarkMode
                          ? `0 0 12px ${theme.accentGlow}`
                          : "none"
                    }}
                  >
                    All ({connectedAccounts.length})
                  </button>
                  {platforms.map((platform) => (
                    <button
                      key={platform.value}
                      onClick={() => setPlatformFilter(platform.value)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5"
                      style={{
                        background:
                          platformFilter === platform.value ? theme.gradientPrimary : "transparent",
                        color: platformFilter === platform.value ? "#FFFFFF" : theme.textSecondary,
                        border: `1px solid ${platformFilter === platform.value ? "transparent" : theme.borderSubtle}`,
                        boxShadow:
                          platformFilter === platform.value && isDarkMode
                            ? `0 0 12px ${theme.accentGlow}`
                            : "none"
                      }}
                    >
                      <img
                        src={platform.icon}
                        alt={platform.name}
                        className="w-3.5 h-3.5 object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <span className="hidden xs:inline">{platform.name}</span>
                      <span style={{ opacity: 0.7 }}>({platformCounts[platform.value] || 0})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account List */}
              <div className="p-3 xs:p-4 space-y-2 xs:space-y-3 max-h-[400px] xs:max-h-[500px] md:max-h-[600px] overflow-y-auto">
                {isLoadingAccounts ? (
                  <div className="text-center py-8 xs:py-12">
                    <svg
                      className="animate-spin h-10 w-10 xs:h-12 xs:w-12 mx-auto mb-3 xs:mb-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      style={{ color: theme.accent }}
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
                    <p className="text-xs xs:text-sm" style={{ color: theme.textTertiary }}>
                      Loading accounts...
                    </p>
                  </div>
                ) : filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account) => {
                    const platform = getPlatformById(account.platform);
                    return (
                      <div
                        key={account.id}
                        className="p-3 xs:p-4 rounded-xl xs:rounded-2xl transition-all duration-200"
                        style={{
                          backgroundColor: isDarkMode ? "rgba(255,255,255,0.02)" : theme.bgMuted,
                          border: `1px solid ${theme.borderSubtle}`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = theme.borderMedium;
                          e.currentTarget.style.boxShadow = theme.shadowMd;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = theme.borderSubtle;
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <div className="flex items-start gap-2 xs:gap-3">
                          <div
                            className="h-10 w-10 xs:h-12 xs:w-12 rounded-xl flex items-center justify-center flex-shrink-0 p-2"
                            style={{
                              backgroundColor: theme.bgCard,
                              border: `1px solid ${theme.borderSubtle}`,
                              boxShadow: theme.shadowSm
                            }}
                          >
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
                              <PlatformIcon
                                platform={account.platform}
                                className="w-full h-full"
                                theme={theme}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4
                              className="font-semibold text-xs xs:text-sm truncate"
                              style={{ color: theme.textPrimary }}
                            >
                              {account.accountLabel}
                            </h4>
                            <p
                              className="text-xs truncate mt-0.5"
                              style={{ color: theme.textTertiary }}
                            >
                              {account.accountId}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div
                          className="flex gap-2 mt-3 xs:mt-4 pt-3 xs:pt-4"
                          style={{ borderTop: `1px solid ${theme.borderSubtle}` }}
                        >
                          <button
                            onClick={() => handleEdit(account)}
                            className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5"
                            style={{
                              backgroundColor: theme.accentLight,
                              border: `1px solid ${isDarkMode ? theme.accent + "30" : theme.accentLight}`,
                              color: theme.accent
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode
                                ? theme.accent + "25"
                                : theme.accentLight;
                              e.currentTarget.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = theme.accentLight;
                              e.currentTarget.style.transform = "translateY(0)";
                            }}
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
                            <span className="hidden xs:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(account)}
                            className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5"
                            style={{
                              backgroundColor: theme.errorLight,
                              border: `1px solid ${theme.errorBorder}`,
                              color: theme.error
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode
                                ? theme.error + "25"
                                : theme.errorLight;
                              e.currentTarget.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = theme.errorLight;
                              e.currentTarget.style.transform = "translateY(0)";
                            }}
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
                            <span className="hidden xs:inline">Remove</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 xs:py-12">
                    <div
                      className="h-16 w-16 xs:h-20 xs:w-20 rounded-2xl xs:rounded-3xl flex items-center justify-center mx-auto mb-4"
                      style={{
                        backgroundColor: theme.accentLight,
                        border: `1px solid ${isDarkMode ? theme.accent + "30" : theme.accentLight}`
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 xs:h-10 xs:w-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        style={{ color: theme.accent }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold mb-1" style={{ color: theme.textPrimary }}>
                      {platformFilter === "all"
                        ? "No accounts added"
                        : `No ${platforms.find((p) => p.value === platformFilter)?.name} accounts`}
                    </p>
                    <p className="text-xs" style={{ color: theme.textTertiary }}>
                      Add your first account to get started
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                className="p-3 xs:p-4"
                style={{
                  borderTop: `1px solid ${theme.borderSubtle}`,
                  backgroundColor: theme.bgSection
                }}
              >
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="w-full px-4 py-2.5 text-xs xs:text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: theme.accentLight,
                    border: `1px solid ${isDarkMode ? theme.accent + "30" : theme.accentLight}`,
                    color: theme.accent,
                    opacity: isRefreshing ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isRefreshing) {
                      e.currentTarget.style.backgroundColor = isDarkMode
                        ? theme.accent + "20"
                        : theme.accentLight;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.accentLight;
                  }}
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
        theme={theme}
        isDarkMode={isDarkMode}
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
        theme={theme}
        isDarkMode={isDarkMode}
      />

      {/* Animations */}
      <style>{`
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
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
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
