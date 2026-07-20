import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import QuizRunner from "@/components/QuizRunner";

export default async function TakeExamPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: exam } = await supabase.from("quizzes").select("*").eq("id", params.id).single();
  if (!exam || !exam.is_published) redirect("/dashboard/exams");

  const { data: attempt, error } = await supabase.rpc("start_quiz_attempt", {
    p_quiz_id: params.id
  });

  if (error || !attempt) redirect("/dashboard/exams");
  if (attempt.submitted_at) redirect("/dashboard/exams");

  return (
    <QuizRunner
      quizId={exam.id}
      quizTitle={exam.title}
      durationMinutes={exam.duration_minutes}
      startedAt={attempt.started_at}
      backHref="/dashboard/exams"
    />
  );
}
