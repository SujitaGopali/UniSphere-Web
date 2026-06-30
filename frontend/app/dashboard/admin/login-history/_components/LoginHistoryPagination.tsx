"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";

export function LoginHistoryPagination({ meta }: { meta: { page: number, totalPages: number } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > meta.totalPages) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [meta.totalPages, searchParams, pathname, router]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handlePageChange(meta.page - 1)}
        disabled={meta.page <= 1 || isPending}
        className="h-8 px-3 border border-hairline bg-surface-card text-xs font-bold uppercase text-on-dark transition-colors hover:bg-surface-elevated disabled:opacity-50"
      >
        Prev
      </button>
      <span className="text-sm text-body mx-2">
        Page {meta.page} of {meta.totalPages}
      </span>
      <button
        onClick={() => handlePageChange(meta.page + 1)}
        disabled={meta.page >= meta.totalPages || isPending}
        className="h-8 px-3 border border-hairline bg-surface-card text-xs font-bold uppercase text-on-dark transition-colors hover:bg-surface-elevated disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
