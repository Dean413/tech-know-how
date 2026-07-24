import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import QuizReview from "@/components/quickReview";

export default async function QuizReviewPage({
    params
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: quiz } = await supabase.from("quizzes").select("*").eq("id", id).single();
    if (!quiz) redirect("/dashboard/quizzes");

    const { data: review, error } = await supabase.rpc("get_quiz_review", { p_quiz_id: id });
    if (error || !review) redirect("/dashboard/quizzes");

    return <QuizReview quizTitle={quiz.title} backHref="/dashboard/quizzes" review={review} />;
}