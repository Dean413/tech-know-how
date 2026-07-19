"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { OptionKey } from "@/types/database";

type Question = {
  id: string;
  position: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
};

export default function QuizRunner({
  quizId,
  quizTitle,
  durationMinutes,
  startedAt,
  backHref
}: {
  quizId: string;
  quizTitle: string;
  durationMinutes: number;
  startedAt: string;
  backHref: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, OptionKey>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const submittedRef = useRef(false);

  const deadline = useMemo(
    () => new Date(startedAt).getTime() + durationMinutes * 60_000,
    [startedAt, durationMinutes]
  );
  const [remainingMs, setRemainingMs] = useState(deadline - Date.now());

  useEffect(() => {
    supabase
      .rpc("get_quiz_questions", { p_quiz_id: quizId })
      .then(({ data, error: rpcError }) => {
        if (rpcError) setError(rpcError.message);
        else setQuestions((data as Question[]) ?? []);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  useEffect(() => {
    const t = setInterval(() => setRemainingMs(deadline - Date.now()), 1000);
    return () => clearInterval(t);
  }, [deadline]);

  useEffect(() => {
    if (remainingMs <= 0 && !submittedRef.current && questions) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs, questions]);

  async function handleSubmit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    setError(null);

    const payload = (questions ?? []).map((q) => ({
      question_id: q.id,
      selected_option: answers[q.id] ?? null
    }));

    const { data, error: rpcError } = await supabase.rpc("submit_quiz_attempt", {
      p_quiz_id: quizId,
      p_answers: payload
    });

    setSubmitting(false);

    if (rpcError) {
      submittedRef.current = false;
      setError(rpcError.message);
      return;
    }

    if (data) setResult({ score: data.score ?? 0, total: data.total ?? 0 });
  }

  const minutes = Math.max(0, Math.floor(remainingMs / 60000));
  const seconds = Math.max(0, Math.floor((remainingMs % 60000) / 1000));
  const timeLow = remainingMs < 60_000;

  if (result) {
    return (
      <div className="card mx-auto max-w-lg text-center">
        <p className="eyebrow">Submitted</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-navy-800">
          Your answers are in.
        </h1>
        <p className="mt-2 text-sm text-navy-500">
          {quizTitle} has been auto-marked. Your instructor will release your result shortly.
        </p>
        <a href={backHref} className="btn-primary mt-6 inline-flex">
          Back to list
        </a>
      </div>
    );
  }

  if (!questions) {
    return <div className="card text-sm text-navy-500">Loading questions…</div>;
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div>
      <div className="sticky top-[73px] z-10 -mx-6 mb-6 border-b border-navy-50 bg-white/95 px-6 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <p className="font-display text-lg font-semibold text-navy-800">{quizTitle}</p>
            <p className="text-xs text-navy-400">
              {answeredCount}/{questions.length} answered
            </p>
          </div>
          <div
            className={`rounded-lg px-3 py-1.5 font-mono text-lg font-bold ${
              timeLow ? "bg-red-50 text-red-600" : "bg-brand-50 text-brand-700"
            }`}
          >
            {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-5">
        {questions
          .sort((a, b) => a.position - b.position)
          .map((q, idx) => (
            <div key={q.id} className="card">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                Question {idx + 1} of {questions.length}
              </p>
              <p className="mt-2 font-medium text-navy-800">{q.question}</p>
              <div className="mt-4 space-y-2">
                {(["a", "b", "c", "d"] as const).map((key) => {
                  const label = q[`option_${key}` as const];
                  const checked = answers[q.id] === key;
                  return (
                    <label
                      key={key}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                        checked
                          ? "border-brand bg-brand-50 text-navy-800"
                          : "border-navy-100 text-navy-600 hover:bg-navy-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={checked}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: key }))}
                        className="h-4 w-4 accent-brand"
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary w-full sm:w-auto"
        >
          {submitting ? "Submitting…" : "Submit final answers"}
        </button>
      </div>
    </div>
  );
}
