"use client";

import { useState } from "react";
import { UserModal } from "./UserModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

export function UsersTable({ users }: { users: any[] }) {
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState<any | null>(null);

  if (!users || users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-hairline bg-surface-card p-12 text-center">
        <p className="text-body-strong mb-2">No users found</p>
        <p className="text-sm text-muted">Try adjusting your search criteria or add a new user.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-hairline bg-surface-card">
      <table className="w-full text-left text-sm text-body">
        <thead className="bg-surface-elevated text-xs uppercase text-body-strong">
          <tr>
            <th className="px-6 py-4 font-bold">User</th>
            <th className="px-6 py-4 font-bold">Student ID</th>
            <th className="px-6 py-4 font-bold">Role</th>
            <th className="px-6 py-4 font-bold">Joined</th>
            <th className="px-6 py-4 text-right font-bold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {users.map((user) => (
            <tr key={user._id} className="transition-colors hover:bg-surface-elevated/50">
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-medium text-on-dark">{user.firstName} {user.lastName}</span>
                  <span className="text-xs text-muted">{user.email}</span>
                  <span className="text-xs text-muted">@{user.username}</span>
                </div>
              </td>
              <td className="px-6 py-4">{user.studentId}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user.role === 'admin' ? 'bg-m-blue-light/10 text-m-blue-light border border-m-blue-light/20' : 'bg-surface-elevated text-body-strong border border-hairline'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 text-xs whitespace-nowrap">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="text-xs font-bold uppercase tracking-wider text-m-blue-light transition-colors hover:text-m-blue-dark"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingUser(user)}
                    className="text-xs font-bold uppercase tracking-wider text-m-red transition-colors hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingUser && (
        <UserModal user={editingUser} onClose={() => setEditingUser(null)} />
      )}
      
      {deletingUser && (
        <DeleteConfirmModal
          userId={deletingUser._id}
          userName={`${deletingUser.firstName} ${deletingUser.lastName}`}
          onClose={() => setDeletingUser(null)}
        />
      )}
    </div>
  );
}
