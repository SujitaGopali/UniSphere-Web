"use client";

import { useState, useEffect } from "react";
import { handleGetPendingVerifications, handleReviewVerification } from "@/lib/actions/verification-action";

interface AdminVerificationsClientProps {
  user: Record<string, any>;
}

export default function AdminVerificationsClient({ user }: AdminVerificationsClientProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const result = await handleGetPendingVerifications(1, 50);
      if (result.success) {
        setRequests(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load verifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filter is currently rudimentary because the API mainly returns pending. 
  // 'all' could theoretically fetch from getAllUsers if needed, but for now we stick to pending.
  const filtered = filter === "pending"
    ? requests.filter((r) => r.verificationStatus === "pending")
    : requests;

  const handleReview = async (id: string, approve: boolean) => {
    try {
      await handleReviewVerification(id, approve);
      load();
    } catch (error) {
      alert("Failed to review verification. Please try again.");
    }
  };

  const pendingCount = requests.filter((r) => r.verificationStatus === "pending").length;

  return (
    <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-800">Student ID Verifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review and approve student ID submissions from students of your college only.
          </p>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter("pending")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              filter === "pending" ? "bg-amber-100 text-amber-800" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              filter === "all" ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            All Requests
          </button>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          {loading ? (
             <div className="flex justify-center items-center py-20 text-slate-500">Loading verifications...</div>
          ) : filtered.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filtered.map((req) => (
                <div key={req._id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800">{req.firstName} {req.lastName}</p>
                    <p className="text-xs text-slate-500">{req.studentId}</p>
                    <p className="text-xs text-blue-600 mt-0.5">{req.college}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Submitted {new Date(req.updatedAt).toLocaleString()}
                    </p>
                    <span className={`inline-block mt-2 rounded-full px-3 py-0.5 text-xs font-semibold ${
                      req.verificationStatus === "pending" ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : req.verificationStatus === "approved" ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {req.verificationStatus.charAt(0).toUpperCase() + req.verificationStatus.slice(1)}
                    </span>
                  </div>

                  {req.idImage && (
                    <div className="shrink-0 h-20 w-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={req.idImage} alt="Student ID" className="h-full w-full object-cover" />
                    </div>
                  )}

                  {req.verificationStatus === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleReview(req._id, true)}
                        className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReview(req._id, false)}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">No verification requests</p>
              <p className="text-xs text-slate-400">Students will appear here after submitting their college ID for review.</p>
            </div>
          )}
        </div>
      </main>
  );
}
