"use client";

import { useTransition } from "react";
import { handleDeleteAdminUser } from "@/lib/actions/admin-action";

export function DeleteConfirmModal({ userId, userName, onClose }: { userId: string, userName: string, onClose: () => void }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await handleDeleteAdminUser(userId);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm border border-hairline bg-surface-card p-6 shadow-xl">
        <h3 className="text-xl font-bold uppercase tracking-wide text-on-dark mb-4">Delete User</h3>
        <p className="text-sm text-body mb-6">
          Are you sure you want to delete <strong className="text-on-dark">{userName}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted transition-colors hover:text-on-dark disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="bg-m-red px-4 py-2 text-xs font-bold uppercase tracking-wider text-canvas transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? "Deleting..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
