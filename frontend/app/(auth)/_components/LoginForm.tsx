"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleLoginUser } from "@/lib/actions/auth-action";
import { loginSchema, LoginFormValues } from "./schema";

export default function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: LoginFormValues) => {
    setErrorMessage(null);

    startTransition(async () => {
      const result = await handleLoginUser(values);

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="mb-2 text-2xl font-light uppercase tracking-[1.5px] text-on-dark">
        Login
      </h1>
      <p className="mb-8 text-sm text-muted">
        Sign in to your Unisphere account.
      </p>

      {errorMessage && (
        <div className="mb-6 rounded border border-m-red bg-m-red/10 px-4 py-3 text-sm text-on-dark">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[1.5px] text-muted">
            Email
          </label>
          <input
            type="email"
            {...register("email")}
            className="h-12 w-full rounded border border-hairline bg-surface-card px-4 text-on-dark outline-none focus:border-on-dark"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-m-red">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[1.5px] text-muted">
            Password
          </label>
          <input
            type="password"
            {...register("password")}
            className="h-12 w-full rounded border border-hairline bg-surface-card px-4 text-on-dark outline-none focus:border-on-dark"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-m-red">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="h-12 w-full rounded bg-on-dark text-sm font-medium uppercase tracking-[1.5px] text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-body">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-on-dark underline">
          Register
        </Link>
      </p>
    </div>
  );
}
