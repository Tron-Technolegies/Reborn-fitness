import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { getServerUrl } from "../api/backendApi";

// ── Storage keys ────────────────────────────────────────────────────────────
const STORAGE_KEY_UNLOCKED  = "app_unlocked";
const STORAGE_KEY_LOGIN_TS  = "app_login_timestamp";
const SESSION_DURATION_MS   = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated]     = useState(false);
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(false);
  const [loading, setLoading]                     = useState(true);

  // Ref to hold the auto-logout timer so we can clear it on unmount / re-login
  const expiryTimerRef = useRef(null);

  // ── Clear expiry timer ────────────────────────────────────────────────────
  const clearExpiryTimer = () => {
    if (expiryTimerRef.current !== null) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  };

  // ── Schedule auto-logout at exactly 7 days from loginTimestamp ────────────
  // loginTimestamp: ISO string stored in localStorage
  // Returns false if the session is already expired (caller must logout).
  const scheduleExpiry = (loginTimestampStr) => {
    // Guard: missing or corrupted timestamp → fail safe
    const loginTime = new Date(loginTimestampStr).getTime();
    if (!loginTimestampStr || isNaN(loginTime)) {
      return false; // caller should treat as expired
    }

    const expiresAt   = loginTime + SESSION_DURATION_MS;
    const msRemaining = expiresAt - Date.now();

    if (msRemaining <= 0) {
      return false; // already expired
    }

    // Clear any existing timer before scheduling a new one
    clearExpiryTimer();

    // setTimeout max safe value is ~24.8 days, well above 7 days — no issue.
    expiryTimerRef.current = setTimeout(() => {
      console.info("[Auth] 7-day session expired — logging out automatically.");
      logout(); // eslint-disable-line no-use-before-define
    }, msRemaining);

    return true; // session still valid
  };

  // ── logout ────────────────────────────────────────────────────────────────
  // Clears all auth-related localStorage keys, cancels the expiry timer,
  // and resets React state. Works regardless of whether password is enabled
  // (manual logout from the UI should always succeed).
  const logout = () => {
    clearExpiryTimer();
    localStorage.removeItem(STORAGE_KEY_UNLOCKED);
    localStorage.removeItem(STORAGE_KEY_LOGIN_TS);
    setIsAuthenticated(false);
  };

  // ── login ─────────────────────────────────────────────────────────────────
  // Called by LockScreen after a successful password verification.
  // Stores the current moment as the session start timestamp.
  const login = (success) => {
    if (success) {
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY_UNLOCKED, "true");
      localStorage.setItem(STORAGE_KEY_LOGIN_TS, now);
      setIsAuthenticated(true);
      scheduleExpiry(now);
    }
  };

  // ── checkAuthStatus ───────────────────────────────────────────────────────
  // Called once on mount. Polls the backend until it is ready, then decides
  // whether the user is currently authenticated.
  const checkAuthStatus = async () => {
    let attempts = 0;
    const maxAttempts = 30; // try for up to 30 seconds

    while (attempts < maxAttempts) {
      try {
        const res = await fetch(getServerUrl("/api/settings/"));

        if (!res.ok) throw new Error("Server returned error status");

        const data = await res.json();
        setIsPasswordEnabled(data.is_password_enabled);

        if (!data.is_password_enabled) {
          // Password protection is off → automatically authenticated.
          // No 7-day logic needed here (nothing to "log in" with).
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }

        // Password protection is ON — check persistent localStorage state.
        const storedUnlocked  = localStorage.getItem(STORAGE_KEY_UNLOCKED) === "true";
        const storedTimestamp = localStorage.getItem(STORAGE_KEY_LOGIN_TS);

        if (storedUnlocked && storedTimestamp) {
          // Attempt to restore the session
          const stillValid = scheduleExpiry(storedTimestamp);
          if (stillValid) {
            // Session within 7 days → stay authenticated
            setIsAuthenticated(true);
          } else {
            // 7-day period has elapsed while the app was closed → auto-logout
            console.info("[Auth] Stored session has expired. Requiring login.");
            logout();
          }
        } else {
          // No stored session (first run, or was previously logged out)
          logout(); // ensure keys are clean
        }

        setLoading(false);
        return; // success — exit retry loop

      } catch (err) {
        console.warn(
          `Backend not ready, retrying in 1s... (Attempt ${attempts + 1}/${maxAttempts})`
        );
        attempts++;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    console.error("Failed to connect to backend after maximum retries.");
    setLoading(false);
  };

  // ── Mount effect ──────────────────────────────────────────────────────────
  useEffect(() => {
    checkAuthStatus();

    // Cleanup: cancel any pending auto-logout timer when the provider unmounts
    return () => {
      clearExpiryTimer();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isPasswordEnabled,
        loading,
        login,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
