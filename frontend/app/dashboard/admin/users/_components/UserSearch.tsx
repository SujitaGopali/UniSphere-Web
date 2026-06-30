"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

export function UserSearch({ initialSearch }: { initialSearch: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    
    params.set("page", "1"); // Reset to page 1 on new search

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [search, searchParams, pathname, router]);

  return (
    <form onSubmit={handleSearch} className="flex max-w-md gap-2">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email, or username..."
        className="h-10 w-full border border-hairline bg-surface-card px-4 text-sm text-on-dark placeholder:text-muted outline-none transition-colors focus:border-on-dark"
      />
      <button
        type="submit"
        disabled={isPending}
        className="h-10 bg-surface-elevated px-4 text-xs font-bold uppercase tracking-wider text-on-dark transition-colors hover:bg-carbon disabled:opacity-50 border border-hairline"
      >
        {isPending ? "..." : "Search"}
      </button>
    </form>
  );
}
