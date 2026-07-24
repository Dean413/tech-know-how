import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function StudentQuizzesPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("*")
    .eq("kind", "quiz")
    .order("created_at", { ascending: true });

  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("student_id", user!.id);

  return (
    <div>
      <p className="eyebrow">Quizzes</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-navy-800">
        20 questions · 20 minutes
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        Each quiz is auto-marked the moment you submit. Once your instructor releases results,
        your score will show here.
      </p>

      <div className="mt-8 space-y-4">
        {quizzes && quizzes.length > 0 ? (
          quizzes.map((quiz) => {
            const attempt = attempts?.find((a) => a.quiz_id === quiz.id);
            const completed = !!attempt?.submitted_at;

            return (
              <div key={quiz.id} className="card flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-navy-800">{quiz.title}</h3>
                  <p className="mt-1 text-xs text-navy-400">
                    {quiz.duration_minutes} minutes · 20 objective questions
                  </p>
                  {completed && (
                    <p className="mt-2 text-sm font-medium text-teal">
                      {attempt?.released
                        ? `Score: ${attempt.score}/${attempt.total}`
                        : "Submitted — awaiting results"}
                    </p>
                  )}
                </div>

                {/* {completed ? (
                  <span className="rounded-full bg-navy-50 px-4 py-2 text-sm font-medium text-navy-400">
                    Completed
                  </span>
                ) : (
                  <Link href={`/dashboard/quizzes/${quiz.id}`} className="btn-primary">
                    Start quiz
                  </Link>
                )} */}

                {completed && (
                  <p className="mt-2 text-sm font-medium text-teal">
                    {attempt?.released
                      ? `Score: ${attempt.score}/${attempt.total}`
                      : "Submitted — awaiting results"}
                  </p>
                )}
                {completed && attempt?.released && (
                  <Link
                    href={`/dashboard/quizzes/${quiz.id}/review`}
                    className="mt-2 inline-block text-sm font-medium text-brand hover:underline"
                  >
                    Review answers →
                  </Link>
                )}
              </div>
            );
          })
        ) : (
          <div className="card text-sm text-navy-500">No quizzes published yet.</div>
        )}
      </div>
    </div>
  );
}
