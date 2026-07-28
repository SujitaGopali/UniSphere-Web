"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/api/axios-instance";
import { API } from "@/lib/api/endpoints";
import { clearAuthCookies } from "@/lib/cookies";

interface LoginHistoryItem {
  id: string;
  sessionId: string;
  deviceLabel: string;
  ipAddress: string;
  loginTime: string;
  lastActiveAt: string;
  isActive: boolean;
}

interface SessionItem {
  id: string;
  sessionId: string;
  deviceLabel: string;
  ipAddress: string;
  loginTime: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

function formatWhen(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function SecuritySettings() {
  const router = useRouter();
  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const loadSecurityData = async () => {
    try {
      const [historyRes, sessionsRes] = await Promise.all([
        axiosInstance.get(API.AUTH.SECURITY.LOGIN_HISTORY),
        axiosInstance.get(API.AUTH.SECURITY.SESSIONS),
      ]);

      if (historyRes.data?.success) {
        setLoginHistory(historyRes.data.data || []);
      }

      if (sessionsRes.data?.success) {
        setSessions(sessionsRes.data.data?.sessions || []);
        setLoginAlertsEnabled(sessionsRes.data.data?.loginAlertsEnabled ?? true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load security settings");
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, []);

  const handleToggleAlerts = (enabled: boolean) => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        const response = await axiosInstance.put(API.AUTH.SECURITY.SETTINGS, {
          loginAlertsEnabled: enabled,
        });

        if (!response.data?.success) {
          setError(response.data?.message || "Failed to update setting");
          return;
        }

        setLoginAlertsEnabled(enabled);
        setMessage(enabled ? "Login alerts enabled." : "Login alerts disabled.");
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to update setting");
      }
    });
  };

  const handleRevokeSession = (sessionId: string, isCurrent?: boolean) => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        const response = await axiosInstance.delete(API.AUTH.SECURITY.REVOKE_SESSION(sessionId));

        if (!response.data?.success) {
          setError(response.data?.message || "Failed to revoke session");
          return;
        }

        if (isCurrent || response.data.data?.revokedCurrentSession) {
          await clearAuthCookies();
          router.push("/login");
          router.refresh();
          return;
        }

        setMessage("Session logged out.");
        await loadSecurityData();
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to revoke session");
      }
    });
  };

  const handleLogoutAll = () => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        const response = await axiosInstance.post(API.AUTH.SECURITY.LOGOUT_ALL);

        if (!response.data?.success) {
          setError(response.data?.message || "Failed to log out all devices");
          return;
        }

        await clearAuthCookies();
        router.push("/login");
        router.refresh();
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to log out all devices");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-lg font-bold text-slate-800">Security</h2>
      <p className="mb-6 text-sm text-slate-500">
        Manage login alerts, active sessions, and recent account activity.
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Login alerts toggle */}
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Login alerts</h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Email me when someone logs in from a new device
              </p>
            </div>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-3">
            <span className="text-sm font-medium text-slate-600">
              {loginAlertsEnabled ? "On" : "Off"}
            </span>
            <input
              type="checkbox"
              checked={loginAlertsEnabled}
              disabled={pending}
              onChange={(e) => handleToggleAlerts(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>

        {/* Active sessions */}
        <div className="border-b border-slate-100 pb-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Where you&apos;re logged in</h3>
              <p className="mt-0.5 text-xs text-slate-400">Active sessions on your account</p>
            </div>
            <button
              type="button"
              onClick={handleLogoutAll}
              disabled={pending || sessions.length === 0}
              className="h-10 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              Log out of all devices
            </button>
          </div>

          {sessions.length === 0 ? (
            <p className="text-sm text-slate-500">No active sessions found.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {session.deviceLabel}
                      {session.isCurrent && (
                        <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                          This device
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {session.ipAddress} · Last active {formatWhen(session.lastActiveAt)}
                    </p>
                  </div>
                  {!session.isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(session.sessionId, session.isCurrent)}
                      disabled={pending}
                      className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:bg-white disabled:opacity-50"
                    >
                      Log out
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Login history */}
        <div>
          <h3 className="mb-1 text-sm font-bold text-slate-800">Recent login activity</h3>
          <p className="mb-4 text-xs text-slate-400">Last 20 sign-ins to your account</p>

          {loginHistory.length === 0 ? (
            <p className="text-sm text-slate-500">No login history yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-3 py-2 font-semibold">Device</th>
                    <th className="px-3 py-2 font-semibold">IP</th>
                    <th className="px-3 py-2 font-semibold">Time</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loginHistory.map((entry) => (
                    <tr key={entry.id} className="border-b border-slate-50">
                      <td className="px-3 py-3 text-slate-700">{entry.deviceLabel}</td>
                      <td className="px-3 py-3 text-slate-500">{entry.ipAddress}</td>
                      <td className="px-3 py-3 text-slate-500">{formatWhen(entry.loginTime)}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            entry.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {entry.isActive ? "Active" : "Ended"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
