import { handleGetLoginHistory } from "@/lib/actions/login-history-action";
import { LoginHistoryTable } from "./_components/LoginHistoryTable";
import { LoginHistoryPagination } from "./_components/LoginHistoryPagination";
import Link from "next/link";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function LoginHistoryPage({ searchParams }: PageProps) {
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;
  const limit = 20;

  const response = await handleGetLoginHistory(page, limit);

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 w-full flex-1 flex flex-col">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wide text-on-dark">
            Login History
          </h1>
          <p className="mt-1 text-sm text-muted">
            Track user login activity and access patterns.
          </p>
        </div>
        <Link
          href="/dashboard/admin/users"
          className="inline-flex h-10 items-center rounded border border-hairline px-5 text-xs uppercase tracking-[1.5px] text-body transition-colors hover:border-on-dark"
        >
          Back to Users
        </Link>
      </div>

      {response.success ? (
        <div className="flex-1 flex flex-col min-h-0">
          <LoginHistoryTable history={response.data} />
          {response.meta && response.meta.totalPages > 1 && (
            <div className="mt-6 flex justify-end">
              <LoginHistoryPagination meta={response.meta} />
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-m-red bg-m-red/10 p-6 text-center text-m-red">
          <p>{response.message}</p>
        </div>
      )}
    </div>
  );
}
