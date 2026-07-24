import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import QuizRunner from "@/components/QuizRunner";

export default async function TakeQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params
  const { data: quiz } = await supabase.from("quizzes").select("*").eq("id", id).single();
  if (!quiz || !quiz.is_published) redirect("/dashboard/quizzes");

  const { data: attempt, error } = await supabase.rpc("start_quiz_attempt", {
    p_quiz_id: id
  });

  if (error || !attempt) redirect("/dashboard/quizzes");
  if (attempt.submitted_at) redirect("/dashboard/quizzes");

  return (
    <QuizRunner
      quizId={quiz.id}
      quizTitle={quiz.title}
      durationMinutes={quiz.duration_minutes}
      startedAt={attempt.started_at}
      backHref="/dashboard/quizzes"
    />
  );
}
