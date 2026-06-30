"use client";

export function LoginHistoryTable({ history }: { history: any[] }) {
  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-hairline bg-surface-card p-12 text-center">
        <p className="text-body-strong mb-2">No login history found</p>
        <p className="text-sm text-muted">Login activity will appear here once users log in.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-hairline bg-surface-card">
      <table className="w-full text-left text-sm text-body">
        <thead className="bg-surface-elevated text-xs uppercase text-body-strong">
          <tr>
            <th className="px-6 py-4 font-bold">User</th>
            <th className="px-6 py-4 font-bold">Email</th>
            <th className="px-6 py-4 font-bold">Username</th>
            <th className="px-6 py-4 font-bold">Login Time</th>
            <th className="px-6 py-4 font-bold">IP Address</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {history.map((entry) => (
            <tr key={entry._id} className="transition-colors hover:bg-surface-elevated/50">
              <td className="px-6 py-4">
                <span className="font-medium text-on-dark">User ID: {entry.userId}</span>
              </td>
              <td className="px-6 py-4">{entry.email}</td>
              <td className="px-6 py-4">@{entry.username}</td>
              <td className="px-6 py-4 text-xs whitespace-nowrap">
                {new Date(entry.loginTime).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-xs text-muted">
                {entry.ipAddress || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
