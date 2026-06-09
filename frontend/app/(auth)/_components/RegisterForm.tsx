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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (values: RegisterFormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const { confirmPassword: _confirmPassword, ...payload } = values;

    startTransition(async () => {
      const result = await handleRegisterUser(payload);

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      setSuccessMessage("Account created! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    });
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="mb-2 text-2xl font-light uppercase tracking-[1.5px] text-on-dark">
        Register
      </h1>
      <p className="mb-8 text-sm text-muted">
        Join Unisphere to discover and manage college events.
      </p>

      {errorMessage && (
        <div className="mb-6 rounded border border-m-red bg-m-red/10 px-4 py-3 text-sm text-on-dark">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded border border-hairline bg-surface-card px-4 py-3 text-sm text-on-dark">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[1.5px] text-muted">
              First Name
            </label>
            <input
              type="text"
              {...register("firstName")}
              className="h-12 w-full rounded border border-hairline bg-surface-card px-4 text-on-dark outline-none focus:border-on-dark"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-m-red">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[1.5px] text-muted">
              Last Name
            </label>
            <input
              type="text"
              {...register("lastName")}
              className="h-12 w-full rounded border border-hairline bg-surface-card px-4 text-on-dark outline-none focus:border-on-dark"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-m-red">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[1.5px] text-muted">
            Email
          </label>
          <input
            type="email"
            {...register("email")}
            className="h-12 w-full rounded border border-hairline bg-surface-card px-4 text-on-dark outline-none focus:border-on-dark"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-m-red">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[1.5px] text-muted">
            Username
          </label>
          <input
            type="text"
            {...register("username")}
            className="h-12 w-full rounded border border-hairline bg-surface-card px-4 text-on-dark outline-none focus:border-on-dark"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-m-red">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[1.5px] text-muted">
            Student ID
          </label>
          <input
            type="text"
            {...register("studentId")}
            placeholder="e.g. STU-2024-001"
            className="h-12 w-full rounded border border-hairline bg-surface-card px-4 text-on-dark outline-none focus:border-on-dark"
          />
          {errors.studentId && (
            <p className="mt-1 text-sm text-m-red">
              {errors.studentId.message}
            </p>
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
          />
          {errors.password && (
            <p className="mt-1 text-sm text-m-red">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[1.5px] text-muted">
            Confirm Password
          </label>
          <input
            type="password"
            {...register("confirmPassword")}
            className="h-12 w-full rounded border border-hairline bg-surface-card px-4 text-on-dark outline-none focus:border-on-dark"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-m-red">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="h-12 w-full rounded bg-on-dark text-sm font-medium uppercase tracking-[1.5px] text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-body">
        Already have an account?{" "}
        <Link href="/login" className="text-on-dark underline">
          Login
        </Link>
      </p>
    </div>
  );
}
