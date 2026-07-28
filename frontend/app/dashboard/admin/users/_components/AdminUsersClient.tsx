"use client";

import { useState, useEffect, useCallback } from "react";
import { handleGetAdminUsers } from "@/lib/actions/admin-action";
import ProfileAvatar from "@/app/components/ProfileAvatar";
import { UserModal } from "./UserModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

interface AdminUsersClientProps {
  user: Record<string, any>;
}

export default function AdminUsersClient({ user }: AdminUsersClientProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState<any | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const result = await handleGetAdminUsers(1, 100, "");
      if (result.success) {
        const coordinatorCollege = user.college?.toLowerCase();
        const filteredUsers = (result.data || []).filter(
          (u: any) =>
            u.college &&
            u.college.toLowerCase() === coordinatorCollege &&
            u.role !== "admin"
        );
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setLoading(false);
    }
  }, [user.college]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <>
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Registered Students</h1>
            <p className="mt-1 text-sm text-slate-500">
              Students registered under {user.college || "your college"}.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20 text-slate-500">
              Loading students...
            </div>
          ) : users.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {users.map((student) => {
                const initials =
                  `${student.firstName?.charAt(0) || ""}${student.lastName?.charAt(0) || ""}`.toUpperCase() ||
                  "S";

                return (
                  <div
                    key={student._id}
                    className="p-6 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex flex-1 min-w-0 items-start gap-3">
                      <ProfileAvatar
                        src={student.profileImage}
                        initials={initials}
                        size="sm"
                        bgClassName="bg-slate-700 text-white"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-slate-500">{student.email}</p>
                        <p className="text-xs text-blue-600 mt-0.5">
                          Student ID: {student.studentId}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Joined {new Date(student.createdAt).toLocaleDateString()}
                        </p>

                        <span
                          className={`inline-block mt-2 rounded-full px-3 py-0.5 text-xs font-semibold ${
                            student.verificationStatus === "pending"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : student.verificationStatus === "approved"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : student.verificationStatus === "rejected"
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : "bg-slate-50 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {student.verificationStatus === "pending"
                            ? "Pending"
                            : student.verificationStatus === "approved"
                              ? "Verified"
                              : student.verificationStatus === "rejected"
                                ? "Rejected"
                                : "Not verified"}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 sm:pl-4">
                      <button
                        type="button"
                        onClick={() => setEditingUser(student)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingUser(student)}
                        className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-8 w-8"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">
                No students registered yet
              </p>
              <p className="text-xs text-slate-400">
                Students from your college will appear here once they register.
              </p>
            </div>
          )}
        </div>
      </main>

      {editingUser && (
        <UserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            fetchUsers();
          }}
        />
      )}

      {deletingUser && (
        <DeleteConfirmModal
          userId={deletingUser._id}
          userName={`${deletingUser.firstName} ${deletingUser.lastName}`}
          onClose={() => setDeletingUser(null)}
          onSuccess={() => {
            setDeletingUser(null);
            fetchUsers();
          }}
        />
      )}
    </>
  );
}
