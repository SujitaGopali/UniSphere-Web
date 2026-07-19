"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleRegisterUser } from "@/lib/actions/auth-action";
import { registerSchema, RegisterFormValues } from "./schema";

export default function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "user" },
  });

  const onSubmit = (values: RegisterFormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const [firstName, ...lastNameParts] = values.fullName.trim().split(" ");
    const lastName = lastNameParts.join(" ") || "User";
    const username = values.email.split("@")[0].substring(0, 15) + Math.floor(Math.random() * 1000);
    const studentId = "STU-" + Date.now();
    const payload = { firstName, lastName, email: values.email, username, studentId, password: values.password, role: values.role };

    startTransition(async () => {
      const result = await handleRegisterUser(payload);
      if (!result.success) { setErrorMessage(result.message); return; }
      setSuccessMessage("Account created successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    });
  };

  const nepalColleges = [
    "Tribhuvan University (TU)", "Kathmandu University (KU)", "Pokhara University (PU)",
    "Purbanchal University", "Pulchowk Campus, IOE", "Thapathali Campus, IOE",
    "Patan Multiple Campus", "Amrit Science Campus (ASCOL)", "Saraswati Multiple Campus",
    "Nepal Commerce Campus", "Shanker Dev Campus", "Ratna Rajya Laxmi Campus",
    "Birendra Multiple Campus", "Prithvi Narayan Campus", "Mahendra Multiple Campus",
    "Butwal Multiple Campus", "Dhangadhi Multiple Campus", "Nepal Engineering College (NEC)",
    "Himalaya College of Engineering", "Kantipur Engineering College",
  ];

  // Reusable SVG icon snippets
  const EyeOpen = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
  const EyeClosed = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create account</h2>
        <p className="mt-1 text-sm text-slate-500">Join UniSphere today</p>
      </div>

      {/* Card */}
      <div className="w-full rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-100/50">
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-m-red/20 bg-m-red/5 px-4 py-3 text-sm text-m-red">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Full Name */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Full Name*</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
                </svg>
              </span>
              <input type="text" {...register("fullName")}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/30 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-m-blue-light focus:bg-white"
                placeholder="Ram Lal" />
            </div>
            {errors.fullName && <p className="mt-1.5 text-xs text-m-red">{errors.fullName.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Email Address*</label>
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

          {/* College */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">College / University*</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M3 21V9l9-6 9 6v12" /><path d="M9 21V12h6v9" />
                </svg>
              </span>
              <select {...register("college")}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/30 pl-10 pr-8 text-sm text-slate-900 outline-none transition-all focus:border-m-blue-light focus:bg-white appearance-none cursor-pointer">
                <option value="">Select your college</option>
                {nepalColleges.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
            {errors.college && <p className="mt-1.5 text-xs text-m-red">{errors.college.message}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Role</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              <select {...register("role")}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/30 pl-10 pr-8 text-sm text-slate-900 outline-none transition-all focus:border-m-blue-light focus:bg-white appearance-none cursor-pointer">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
            {errors.role && <p className="mt-1.5 text-xs text-m-red">{errors.role.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Password*</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input type={showPassword ? "text" : "password"} {...register("password")}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/30 pl-10 pr-10 text-sm text-slate-900 outline-none transition-all focus:border-m-blue-light focus:bg-white"
                placeholder="Min. 8 characters" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeClosed /> : <EyeOpen />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-xs text-m-red">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Confirm Password*</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input type={showConfirmPassword ? "text" : "password"} {...register("confirmPassword")}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/30 pl-10 pr-10 text-sm text-slate-900 outline-none transition-all focus:border-m-blue-light focus:bg-white"
                placeholder="Re-enter password" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600">
                {showConfirmPassword ? <EyeClosed /> : <EyeOpen />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1.5 text-xs text-m-red">{errors.confirmPassword.message}</p>}
          </div>

          {/* Terms */}
          <div className="flex items-start text-xs pt-1">
            <label className="flex items-start gap-2 cursor-pointer text-slate-600 select-none">
              <input type="checkbox" required className="h-4 w-4 mt-0.5 rounded border-slate-300 text-m-blue-dark focus:ring-m-blue-light" />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="underline hover:text-slate-800">Terms of Service</Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-slate-800">Privacy Policy</Link>
              </span>
            </label>
          </div>

          {/* Submit */}
          <button type="submit" disabled={isPending}
            className="h-12 w-full rounded-xl bg-m-blue-dark text-sm font-semibold text-white transition-all hover:bg-m-blue-light hover:shadow-lg hover:shadow-blue-500/10 disabled:opacity-50 cursor-pointer">
            {isPending ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
          <span className="relative bg-white px-4 text-xs text-slate-400 font-medium">Already have an account?</span>
        </div>

        <Link href="/login"
          className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-m-blue-dark text-sm font-semibold text-m-blue-dark transition-all hover:bg-slate-50/50 hover:shadow-md text-center">
          Sign in instead
        </Link>
      </div>
    </div>
  );
}
