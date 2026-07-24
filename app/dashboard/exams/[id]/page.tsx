import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import QuizRunner from "@/components/QuizRunner";

export default async function TakeExamPage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params
  const supabase = await createClient();

  const { data: exam } = await supabase.from("quizzes").select("*").eq("id", id).single();
  if (!exam || !exam.is_published) redirect("/dashboard/exams");

  const { data: attempt, error } = await supabase.rpc("start_quiz_attempt", {
    p_quiz_id: id
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
