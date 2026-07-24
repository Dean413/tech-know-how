"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AttemptRow {
  id: string;
  student_name: string;
  matric_number: string | null;
  score: number | null;
  total: number | null;
  submitted_at: string | null;
  released: boolean;
}

export default function AttemptsPanel({ quizId, attempts }: { quizId: string; attempts: AttemptRow[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const submitted = attempts.filter((a) => a.submitted_at);
  const anyUnreleased = submitted.some((a) => !a.released);

  async function handleRelease() {
    setLoading(true);
    await supabase.rpc("release_quiz_results", { p_quiz_id: quizId });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-navy-800">
          Results ({submitted.length} submitted)
        </h3>
        <button
          onClick={handleRelease}
          disabled={loading || submitted.length === 0 || !anyUnreleased}
          className="btn-primary"
        >
          {loading ? "Releasing…" : "Release results"}
        </button>
      </div>

      {submitted.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-navy-400">
                <th className="pb-2">Student</th>
                <th className="pb-2">Matric No.</th>
                <th className="pb-2">Score</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {submitted.map((a) => (
                <tr key={a.id}>
                  <td className="py-2 text-navy-800">
                    <button
                      onClick={() => router.push(`/admin/quizzes/${quizId}/attempts/${a.id}`)}
                      className="hover:underline text-blue-600"
                    >
                      {a.student_name}
                    </button>
                  </td>
                  <td className="py-2 font-mono text-navy-500">{a.matric_number}</td>
                  <td className="py-2 font-medium text-navy-800">{a.score}/{a.total}</td>
                  <td className="py-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${a.released ? "bg-teal/10 text-teal" : "bg-navy-50 text-navy-400"
                        }`}
                    >
                      {a.released ? "Released" : "Held"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 text-sm text-navy-400">No submissions yet.</p>
      )}
    </div>
  );
}
