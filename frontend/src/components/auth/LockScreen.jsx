import React, { useState } from "react";
import { FiLock, FiUnlock, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { getServerUrl } from "../../api/backendApi";

export default function LockScreen() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }
    setLoading(true);

    setError("");

    try {
      const res = await fetch(getServerUrl("/api/settings/verify-password/"), {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        login(true);
      } else {
        setError(data.error || "Incorrect password");
      }
    } catch (err) {
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-50 flex items-center justify-center font-sans">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-gray-200 text-center space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="mx-auto w-20 h-20 bg-yellow-400/20 rounded-2xl flex items-center justify-center text-black font-bold shadow-inner">
          {password.length > 0 ? <FiUnlock size={32} /> : <FiLock size={32} />}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-black">Perfect Fit</h1>
          <p className="text-gray-500 font-medium">Application Protected</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <input
              type="password"
              placeholder="Enter Access Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-yellow-400 focus:bg-white outline-none transition-all text-center text-lg font-bold tracking-widest placeholder:tracking-normal placeholder:font-normal text-black"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-bold animate-bounce">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-yellow-400 hover:bg-[#e5c004] text-black rounded-2xl font-extrabold flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-400/30 active:scale-95 disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
          >
            {loading ? "Verifying..." : (
              <>
                Unlock System <FiArrowRight />
              </>
            )}
          </button>
        </form>


      </div>
    </div>
  );
}
