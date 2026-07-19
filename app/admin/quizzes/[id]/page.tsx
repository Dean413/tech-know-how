import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import QuestionEditor from "@/components/admin/QuestionEditor";
import PublishToggle from "@/components/admin/PublishToggle";
import AttemptsPanel from "@/components/admin/AttemptsPanel";

export default async function AdminQuizDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: quiz } = await supabase.from("quizzes").select("*").eq("id", params.id).single();
  if (!quiz) notFound();

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", params.id)
    .order("position");



  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("*, profiles(full_name, matric_number)")
    .eq("quiz_id", params.id)
    .order("submitted_at", { ascending: false });

  const attemptRows = (attempts ?? []).map((a: any) => ({
    id: a.id,
    student_name: a.profiles?.full_name ?? "—",
    matric_number: a.profiles?.matric_number ?? null,
    score: a.score,
    total: a.total,
    submitted_at: a.submitted_at,
    released: a.released
  }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">{quiz.kind === "exam" ? "Exam" : "Quiz"}</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-navy-800">{quiz.title}</h1>
          <p className="mt-1 text-sm text-navy-500">
            {quiz.duration_minutes} minutes · {questions?.length ?? 0}/{quiz.kind === "quiz" ? 3 : 5} questions
          </p>
        </div>
        <PublishToggle
          shouldPublish={quiz.kind === "quiz" ? 3 : 5}
          quizId={quiz.id}
          isPublished={quiz.is_published}
          questionCount={questions?.length ?? 0}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <QuestionEditor quizTotal={quiz.kind === "quiz" ? 3 : 5} questionNo={quiz.kind === "quiz" ? 3 : 5} quizId={quiz.id} questions={questions ?? []} />
        <AttemptsPanel quizId={quiz.id} attempts={attemptRows} />
      </div>
    </div>
  );
}
