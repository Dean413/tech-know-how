const OPTION_KEYS = ["a", "b", "c", "d"] as const;

interface ReviewRow {
    question_id: string;
    position: number;
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: "a" | "b" | "c" | "d";
    selected_option: "a" | "b" | "c" | "d" | null;
}

export default function QuizReview({
    quizTitle,
    backHref,
    review
}: {
    quizTitle: string;
    backHref: string;
    review: ReviewRow[];
}) {
    const score = review.filter((r) => r.selected_option === r.correct_option).length;

    return (
        <div>
            <p className="eyebrow">Review</p>
            <h1 className="mt-2 font-display text-2xl font-semibold text-navy-800">{quizTitle}</h1>
            <p className="mt-1 text-sm text-navy-500">
                {score}/{review.length} correct
            </p>

            <div className="mt-6 space-y-4">
                {review
                    .sort((a, b) => a.position - b.position)
                    .map((q) => (
                        <div key={q.question_id} className="card">
                            <p className="font-medium text-navy-800">
                                {q.position}. {q.question}
                            </p>
                            <ul className="mt-3 space-y-1 text-sm">
                                {OPTION_KEYS.map((key) => {
                                    const isSelected = q.selected_option === key;
                                    const isCorrect = q.correct_option === key;
                                    return (
                                        <li
                                            key={key}
                                            className={
                                                isCorrect
                                                    ? "font-semibold text-teal"
                                                    : isSelected
                                                        ? "font-semibold text-red-500"
                                                        : "text-navy-500"
                                            }
                                        >
                                            {key.toUpperCase()}. {q[`option_${key}` as const]}
                                            {isCorrect && " ✓ correct answer"}
                                            {isSelected && !isCorrect && " ← your answer"}
                                        </li>
                                    );
                                })}
                                {!q.selected_option && (
                                    <li className="italic text-navy-400">You left this blank</li>
                                )}
                            </ul>
                        </div>
                    ))}
            </div>

            <a href={backHref} className="btn-secondary mt-6 inline-flex">
                Back
            </a>
        </div>
    );
}