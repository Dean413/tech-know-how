import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function StudentExamsPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Admins may create the exam early but keep it unpublished until the
  // course ends — students still see the card, just locked.
  const { data: exams } = await supabase
    .from("quizzes")
    .select("*")
    .eq("kind", "exam")
    .order("created_at", { ascending: true });

  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("student_id", user!.id);

  return (
    <div>
      <p className="eyebrow">Final Exam</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-navy-800">
        Course exam
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        Same format as your quizzes. This unlocks once your instructor makes it available at the
        end of the course.
      </p>

      <div className="mt-8 space-y-4">
        {exams && exams.length > 0 ? (
          exams.map((exam) => {
            const attempt = attempts?.find((a) => a.quiz_id === exam.id);
            const completed = !!attempt?.submitted_at;

            return (
              <div key={exam.id} className="card flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-navy-800">{exam.title}</h3>
                  <p className="mt-1 text-xs text-navy-400">
                    {exam.duration_minutes} minutes · 20 objective questions
                  </p>
                  {completed && (
                    <p className="mt-2 text-sm font-medium text-teal">
                      {attempt?.released
                        ? `Score: ${attempt.score}/${attempt.total}`
                        : "Submitted — awaiting results"}
                    </p>
                  )}
                  {!exam.is_published && !completed && (
                    <p className="mt-2 text-sm font-medium text-navy-400">
                      Locked until your instructor opens it
                    </p>
                  )}
                </div>

                {completed ? (
                  <span className="rounded-full bg-navy-50 px-4 py-2 text-sm font-medium text-navy-400">
                    Completed
                  </span>
                ) : (
                  <Link
                    href={exam.is_published ? `/dashboard/exams/${exam.id}` : "#"}
                    aria-disabled={!exam.is_published}
                    className={exam.is_published ? "btn-primary" : "btn-secondary pointer-events-none opacity-50"}
                  >
                    {exam.is_published ? "Start exam" : "Locked"}
                  </Link>
                )}
              </div>
            );
          })
        ) : (
          <div className="card text-sm text-navy-500">
            The exam hasn't been created yet — it will appear here when it's ready.
          </div>
        )}
      </div>
    </div>
  );
}
