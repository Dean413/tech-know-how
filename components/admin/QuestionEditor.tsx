"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { OptionKey, QuizQuestion } from "@/types/database";

const EMPTY = { question: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "a" as OptionKey };

export default function QuestionEditor({
  quizId,
  questions,
  questionNo,
  quizTotal
}: {
  quizId: string;
  questions: QuizQuestion[];
  questionNo: number;
  quizTotal: number;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextPosition = questions.length + 1;
  const canAddMore = questions.length < questionNo;

  // async function handleAdd(e: React.FormEvent) {
  //   e.preventDefault();
  //   setError(null);
  //   setLoading(true);

  //   const { error: insertError } = await supabase.from("quiz_questions").insert({
  //     quiz_id: quizId,
  //     position: nextPosition,
  //     ...form
  //   });

  //   setLoading(false);

  //   if (insertError) {
  //     setError(insertError.message);
  //     return;
  //   }

  //   setForm(EMPTY);
  //   router.refresh();
  // }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setLoading(true);

    if (editingId) {
      const { error } = await supabase
        .from("quiz_questions")
        .update(form)
        .eq("id", editingId);

      setLoading(false);

      if (error) {
        setError(error.message);
        return;
      }

      setEditingId(null);
      setForm(EMPTY);
      router.refresh();
      return;
    }

    const { error } = await supabase
      .from("quiz_questions")
      .insert({
        quiz_id: quizId,
        position: nextPosition,
        ...form,
      });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setForm(EMPTY);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("quiz_questions").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-display text-lg font-semibold text-navy-800">
          Question {nextPosition} of {quizTotal}
        </h3>

        {canAddMore ? (
          <form onSubmit={handleSave} className="mt-4 space-y-3">
            <textarea
              className="input"
              required
              placeholder="Question text"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
            />
            {(["a", "b", "c", "d"] as const).map((key) => (
              <div key={key} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correct"
                  checked={form.correct_option === key}
                  onChange={() => setForm({ ...form, correct_option: key })}
                  className="h-4 w-4 accent-brand"
                  title="Mark as correct answer"
                />
                <input
                  className="input"
                  required
                  placeholder={`Option ${key.toUpperCase()}`}
                  value={form[`option_${key}` as const]}
                  onChange={(e) => setForm({ ...form, [`option_${key}`]: e.target.value })}
                />
              </div>
            ))}
            <p className="text-xs text-navy-400">Select the radio button next to the correct option.</p>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary">
              {loading
                ? editingId
                  ? "Updating..."
                  : "Adding..."
                : editingId
                  ? "Update Question"
                  : "Add Question"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(EMPTY);
                }}
                className="ml-3 rounded border px-4 py-2"
              >
                Cancel
              </button>
            )}
          </form>
        ) : (
          <p className="mt-3 text-sm text-teal">All {quizTotal} questions are in — ready to publish.</p>
        )}
      </div>

      <div className="space-y-3">
        {questions
          .sort((a, b) => a.position - b.position)
          .map((q) => (
            <div key={q.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-medium text-navy-800">
                  {q.position}. {q.question}
                </p>
                {/* <button
                  onClick={() => handleDelete(q.id)}
                  className="shrink-0 text-xs font-medium text-red-500 hover:underline"
                >
                  Remove
                </button> */}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(q.id);

                      setForm({
                        question: q.question,
                        option_a: q.option_a,
                        option_b: q.option_b,
                        option_c: q.option_c,
                        option_d: q.option_d,
                        correct_option: q.correct_option,
                      });

                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    className="text-xs font-medium text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <ul className="mt-2 grid grid-cols-1 gap-1 text-sm text-navy-500 sm:grid-cols-2">
                {(["a", "b", "c", "d"] as const).map((key) => (
                  <li
                    key={key}
                    className={q.correct_option === key ? "font-semibold text-teal" : ""}
                  >
                    {key.toUpperCase()}. {q[`option_${key}` as const]}
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}
