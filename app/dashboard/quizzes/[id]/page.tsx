import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import QuizRunner from "@/components/QuizRunner";

export default async function TakeQuizPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: quiz } = await supabase.from("quizzes").select("*").eq("id", params.id).single();
  if (!quiz || !quiz.is_published) redirect("/dashboard/quizzes");

  const { data: attempt, error } = await supabase.rpc("start_quiz_attempt", {
    p_quiz_id: params.id
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
