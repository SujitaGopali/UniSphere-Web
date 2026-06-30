"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleCreateAdminUser, handleUpdateAdminUser } from "@/lib/actions/admin-action";

const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  studentId: z.string().min(1, "Student ID is required"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.enum(["admin", "user"]),
});

type UserFormData = z.infer<typeof userSchema>;

export function UserModal({ user, onClose }: { user?: any, onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(!!user);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const isEditing = !!user;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user ? {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      studentId: user.studentId,
      role: user.role,
      password: "",
    } : {
      role: "user"
    }
  });

  const handleClose = () => {
    setIsOpen(false);
    reset();
    setError('');
    if (onClose) onClose();
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const onSubmit = (data: UserFormData) => {
    setError('');
    startTransition(async () => {
      try {
        const submitData = { ...data };
        if (isEditing && !submitData.password) {
          delete submitData.password; // Do not send empty password if editing
        } else if (!isEditing && !submitData.password) {
          setError("Password is required for new users");
          return;
        }

        const result = isEditing 
          ? await handleUpdateAdminUser(user._id, submitData)
          : await handleCreateAdminUser(submitData);

        if (result.success) {
          handleClose();
        } else {
          setError(result.message);
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      }
    });
  };

  const fieldClass = "h-10 w-full border border-hairline bg-surface-card px-3 text-sm text-on-dark placeholder:text-muted outline-none transition-colors focus:border-on-dark";
  const labelClass = "mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-body";
  const errClass = "mt-1 block text-xs text-m-red";

  return (
    <>
      {!user && (
        <button
          onClick={handleOpen}
          className="bg-on-dark px-6 py-2 text-xs font-bold uppercase tracking-wider text-canvas transition-colors hover:bg-body-strong"
        >
          Add User
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg border border-hairline bg-surface-card shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-hairline p-6">
              <h3 className="text-xl font-bold uppercase tracking-wide text-on-dark">
                {isEditing ? "Edit User" : "Create User"}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              {error && <div className="mb-6 border border-m-red bg-m-red/10 px-4 py-3 text-sm text-m-red">{error}</div>}
              
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input type="text" {...register("firstName")} className={fieldClass} />
                  {errors.firstName && <span className={errClass}>{errors.firstName.message}</span>}
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input type="text" {...register("lastName")} className={fieldClass} />
                  {errors.lastName && <span className={errClass}>{errors.lastName.message}</span>}
                </div>
              </div>

              <div className="mb-4">
                <label className={labelClass}>Email</label>
                <input type="email" {...register("email")} className={fieldClass} />
                {errors.email && <span className={errClass}>{errors.email.message}</span>}
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Username</label>
                  <input type="text" {...register("username")} className={fieldClass} />
                  {errors.username && <span className={errClass}>{errors.username.message}</span>}
                </div>
                <div>
                  <label className={labelClass}>Student ID</label>
                  <input type="text" {...register("studentId")} className={fieldClass} />
                  {errors.studentId && <span className={errClass}>{errors.studentId.message}</span>}
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Role</label>
                  <select {...register("role")} className={fieldClass}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  {errors.role && <span className={errClass}>{errors.role.message}</span>}
                </div>
                <div>
                  <label className={labelClass}>{isEditing ? "New Password (optional)" : "Password"}</label>
                  <input type="password" {...register("password")} className={fieldClass} placeholder={isEditing ? "Leave blank to keep" : "••••••••"} />
                  {errors.password && <span className={errClass}>{errors.password.message}</span>}
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-hairline pt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-muted transition-colors hover:text-on-dark disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-on-dark px-6 py-2 text-xs font-bold uppercase tracking-wider text-canvas transition-colors hover:bg-body-strong disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
