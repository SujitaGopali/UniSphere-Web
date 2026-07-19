"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleLoginUser } from "@/lib/actions/auth-action";
import { loginSchema, LoginFormValues } from "./schema";
import { useAuth } from "@/lib/context/AuthContext";

export default function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: LoginFormValues) => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await handleLoginUser(values);
      if (!result.success) { setErrorMessage(result.message); return; }
      if (result.data?.user) setUser(result.data.user as any);
      const userRole = result.data?.user?.role;
      const redirectPath = userRole === "admin" ? "/dashboard/admin/users" : "/dashboard";
      router.push(redirectPath);
      router.refresh();
    });
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <Link href="/" className="text-3xl font-extrabold tracking-tight text-m-blue-dark flex items-center gap-2">
          UniSphere <span className="text-3xl">🎓</span>
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
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 6.5 8 6 8-6" />
                </svg>
              </span>
              <input type="email" {...register("email")}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/30 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-m-blue-light focus:bg-white"
                placeholder="you@example.com" />
            </div>
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

          {/* Options */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-m-blue-dark focus:ring-m-blue-light" />
              Remember me
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
