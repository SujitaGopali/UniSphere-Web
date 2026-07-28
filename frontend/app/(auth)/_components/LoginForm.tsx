"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleLoginUser } from "@/lib/actions/auth-action";
import { loginSchema, LoginFormValues } from "./schema";
import { useAuth } from "@/lib/context/AuthContext";

type SavedAccount = {
  email: string;
  name: string;
  password: string;
  avatar?: string; // initials color
};

const STORAGE_KEY = "unisphere_remembered_accounts";

function getSavedAccounts(): SavedAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Migrate old single-account format
      const old = localStorage.getItem("unisphere_saved_account");
      if (old) {
        const parsed = JSON.parse(old);
        if (parsed?.email) {
          const migrated: SavedAccount[] = [{
            email: parsed.email,
            name: parsed.name || parsed.email.split("@")[0],
            password: parsed.password || "",
            avatar: undefined,
          }];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          localStorage.removeItem("unisphere_saved_account");
          return migrated;
        }
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAccount(email: string, name: string, password: string) {
  if (typeof window === "undefined") return;
  const accounts = getSavedAccounts();
  const idx = accounts.findIndex((a) => a.email.toLowerCase() === email.toLowerCase());
  const entry: SavedAccount = {
    email: email.trim(),
    name: name.trim() || email.split("@")[0],
    password,
  };
  if (idx >= 0) {
    accounts[idx] = entry;
  } else {
    accounts.unshift(entry);
  }
  // Keep max 10 accounts
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts.slice(0, 10)));
}

function removeAccount(email: string) {
  if (typeof window === "undefined") return;
  const accounts = getSavedAccounts().filter(
    (a) => a.email.toLowerCase() !== email.toLowerCase()
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

// Generate a deterministic color from email for the avatar circle
function avatarColor(email: string) {
  const colors = [
    "bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-rose-500",
    "bg-amber-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500",
  ];
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Autocomplete state
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredAccounts, setFilteredAccounts] = useState<SavedAccount[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSavedAccounts(getSavedAccounts());
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const watchedEmail = watch("email");

  // Filter accounts as user types
  useEffect(() => {
    if (!savedAccounts.length) {
      setFilteredAccounts([]);
      return;
    }
    const typed = (watchedEmail || "").trim().toLowerCase();
    if (!typed) {
      setFilteredAccounts(savedAccounts);
    } else {
      setFilteredAccounts(
        savedAccounts.filter(
          (a) =>
            a.email.toLowerCase().includes(typed) ||
            a.name.toLowerCase().includes(typed)
        )
      );
    }
  }, [savedAccounts, watchedEmail]);

  const selectAccount = (acc: SavedAccount) => {
    setValue("email", acc.email);
    if (acc.password) {
      setValue("password", acc.password);
    }
    setShowDropdown(false);
    setRememberMe(true);
  };

  const handleRemoveAccount = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    removeAccount(email);
    const updated = getSavedAccounts();
    setSavedAccounts(updated);
    setFilteredAccounts(updated);
  };

  const onSubmit = (values: LoginFormValues) => {
    const normalizedEmail = values.email.trim().toLowerCase();

    setErrorMessage(null);
    startTransition(async () => {
      const result = await handleLoginUser({
        ...values,
        email: normalizedEmail,
      });

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      if (result.data?.user) {
        setUser(result.data.user as any);

        if (rememberMe) {
          const accountName =
            (result.data.user as { name?: string } | undefined)?.name ||
            `${(result.data.user as any)?.firstName || ""} ${(result.data.user as any)?.lastName || ""}`.trim() ||
            normalizedEmail.split("@")[0];
          saveAccount(normalizedEmail, accountName, values.password);
          setSavedAccounts(getSavedAccounts());
        }
      }

      const userRole = result.data?.user?.role;
      const redirectPath = userRole === "admin" ? "/dashboard/admin" : "/dashboard";
      router.replace(redirectPath);
      router.refresh();
    });
  };

  // Custom register so we can control the ref
  const emailRegister = register("email");

  return (
    <div className="w-full flex flex-col items-center">
      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <Link href="/" className="text-3xl font-extrabold tracking-tight text-m-blue-dark flex items-center gap-2">
          UniSphere
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
        <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
      </div>

      {/* Card */}
      <div className="w-full rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-100/50">
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-m-red/20 bg-m-red/5 px-4 py-3 text-sm text-m-red">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div ref={dropdownRef} className="relative">
              <label className="mb-2 block text-xs font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 6.5 8 6 8-6" />
                  </svg>
                </span>
                <input
                  type="email"
                  {...emailRegister}
                  ref={(e) => {
                    emailRegister.ref(e);
                    (emailInputRef as React.MutableRefObject<HTMLInputElement | null>).current = e;
                  }}
                  onFocus={() => {
                    if (savedAccounts.length > 0) setShowDropdown(true);
                  }}
                  autoComplete="off"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/30 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-m-blue-light focus:bg-white"
                  placeholder="you@example.com"
                />
              </div>

              {/* Saved accounts dropdown */}
              {showDropdown && filteredAccounts.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Saved Accounts</p>
                  </div>
                  <div className="max-h-52 overflow-y-auto">
                    {filteredAccounts.map((acc) => {
                      const initials = acc.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase() || acc.email[0].toUpperCase();
                      return (
                        <div
                          key={acc.email}
                          role="button"
                          tabIndex={0}
                          onClick={() => selectAccount(acc)}
                          onKeyDown={(e) => { if (e.key === "Enter") selectAccount(acc); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors group text-left cursor-pointer"
                        >
                          {/* Avatar */}
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold ${avatarColor(acc.email)}`}>
                            {initials}
                          </div>
                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-800 truncate">{acc.name}</p>
                            <p className="text-xs text-slate-400 truncate">{acc.email}</p>
                          </div>
                          {/* Password saved indicator */}
                          {acc.password && (
                            <span className="shrink-0 text-[10px] font-medium text-emerald-500 bg-emerald-50 rounded-full px-2 py-0.5 border border-emerald-100">
                              🔑 Saved
                            </span>
                          )}
                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={(e) => handleRemoveAccount(e, acc.email)}
                            className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"
                            title="Remove saved account"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                              <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {errors.email && <p className="mt-1.5 text-xs text-m-red">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-700">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input type={showPassword ? "text" : "password"} {...register("password")}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/30 pl-10 pr-10 text-sm text-slate-900 outline-none transition-all focus:border-m-blue-light focus:bg-white"
                  placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600">
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-m-red">{errors.password.message}</p>}
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer group select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-[18px] w-[18px] rounded-md border-2 border-slate-300 bg-white transition-all peer-checked:border-violet-500 peer-checked:bg-violet-500 group-hover:border-violet-400" />
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute top-[3px] left-[3px] h-3 w-3 opacity-0 peer-checked:opacity-100 transition-opacity"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-slate-600 font-medium group-hover:text-slate-800 transition-colors">Remember me</span>
              </label>
              <Link href="/forgot-password" className="font-semibold text-m-blue-light hover:text-m-blue-dark transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isPending}
              className="h-12 w-full rounded-xl bg-m-blue-dark text-sm font-semibold text-white transition-all hover:bg-m-blue-light hover:shadow-lg hover:shadow-blue-500/10 disabled:opacity-50 cursor-pointer">
              {isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>

        {/* Separator */}
        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
          <span className="relative bg-white px-4 text-xs text-slate-400 font-medium">Don&apos;t have an account?</span>
        </div>

        <Link href="/register"
          className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-m-blue-dark text-sm font-semibold text-m-blue-dark transition-all hover:bg-slate-50/50 hover:shadow-md text-center">
          Create new account
        </Link>
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-slate-400 max-w-sm leading-relaxed">
        By signing in, you agree to our{" "}
        <Link href="/terms" className="underline hover:text-slate-600">Terms of Service</Link>{" "}and{" "}
        <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>
      </p>
    </div>
  );
}
