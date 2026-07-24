import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

const OPTION_KEYS = ["a", "b", "c", "d"] as const;

export default async function AttemptDetailsPage({
    params
}: {
    params: Promise<{ id: string; attemptId: string }>;
}) {
    const { attemptId } = await params;
    const supabase = await createClient();

    const { data: attempt } = await supabase
        .from("quiz_attempts")
        .select("*, profiles(full_name, matric_number)")
        .eq("id", attemptId)
        .single();

    if (!attempt) notFound();

    const { data: answers } = await supabase
        .from("quiz_answers")
        .select(
            `
      id,
      selected_option,
      is_correct,
      quiz_questions (
        position,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option
      )
    `
        )
        .eq("attempt_id", attemptId);

    const sorted = [...(answers ?? [])].sort(
        (a: any, b: any) => a.quiz_questions.position - b.quiz_questions.position
    );

    return (
        <div className="p-6">
            <p className="eyebrow">Attempt review</p>
            <h1 className="mt-2 text-2xl font-bold">
                {(attempt as any).profiles?.full_name}{" "}
                <span className="font-mono text-base font-normal text-navy-400">
                    {(attempt as any).profiles?.matric_number}
                </span>
            </h1>
            <p className="mt-1 text-sm text-navy-500">
                Score: {attempt.score}/{attempt.total}
            </p>

            <div className="mt-6 space-y-4">
                {sorted.map((answer: any) => {
                    const q = answer.quiz_questions;
                    return (
                        <div key={answer.id} className="rounded-lg border p-4">
                            <h2 className="font-semibold">
                                {q.position}. {q.question}
                            </h2>

                            <ul className="mt-3 space-y-1 text-sm">
                                {OPTION_KEYS.map((key) => {
                                    const isSelected = answer.selected_option === key;
                                    const isCorrect = q.correct_option === key;
                                    return (
                                        <li
                                            key={key}
                                            className={
                                                isCorrect
                                                    ? "font-semibold text-green-600"
                                                    : isSelected
                                                        ? "font-semibold text-red-600"
                                                        : "text-navy-600"
                                            }
                                        >
                                            {key.toUpperCase()}. {q[`option_${key}`]}
                                            {isCorrect && " ✓ correct answer"}
                                            {isSelected && !isCorrect && " ← student's answer"}
                                        </li>
                                    );
                                })}
                                {!answer.selected_option && (
                                    <li className="italic text-navy-400">Student left this blank</li>
                                )}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}