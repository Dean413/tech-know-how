import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CreateQuizForm from "@/components/admin/CreateQuizForm";

export default async function AdminExamsPage() {
  const supabase = createClient();
  const { data: exams } = await supabase
    .from("quizzes")
    .select("*")
    .eq("kind", "exam")
    .order("created_at", { ascending: false });

  return (
    <div>
      <p className="eyebrow">Exams</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-navy-800">
        The course exam
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        Build it whenever you like — keep it as a draft, then publish it when the course ends.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <CreateQuizForm kind="exam" />

        <div className="space-y-4">
          {exams && exams.length > 0 ? (
            exams.map((q) => (
              <Link key={q.id} href={`/admin/quizzes/${q.id}`} className="card flex items-center justify-between hover:shadow-card-hover">
                <div>
                  <h3 className="font-display text-base font-semibold text-navy-800">{q.title}</h3>
                  <p className="mt-1 text-xs text-navy-400">{q.duration_minutes} minutes</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${q.is_published ? "bg-teal/10 text-teal" : "bg-navy-50 text-navy-400"
                    }`}
                >
                  {q.is_published ? "Published" : "Draft"}
                </span>
              </Link>
            ))
          ) : (
            <div className="card text-sm text-navy-500">No exam created yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
