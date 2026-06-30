import { handleGetAdminUsers } from "@/lib/actions/admin-action";
import { UsersTable } from "./_components/UsersTable";
import { UserSearch } from "./_components/UserSearch";
import { UserPagination } from "./_components/UserPagination";
import { UserModal } from "./_components/UserModal";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const search = typeof params.search === "string" ? params.search : "";
  const limit = 10;

  const response = await handleGetAdminUsers(page, limit, search);

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 w-full flex-1 flex flex-col">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wide text-on-dark">
            User Management
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage users, roles, and access.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/admin/login-history"
            className="inline-flex h-10 items-center rounded border border-hairline px-5 text-xs uppercase tracking-[1.5px] text-body transition-colors hover:border-on-dark"
          >
            Login History
          </Link>
          <UserModal />
        </div>
      </div>

      <div className="mb-6">
        <UserSearch initialSearch={search} />
      </div>

      {response.success ? (
        <div className="flex-1 flex flex-col min-h-0">
          <UsersTable users={response.data} />
          {response.meta && response.meta.totalPages > 1 && (
            <div className="mt-6 flex justify-end">
              <UserPagination meta={response.meta} />
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
