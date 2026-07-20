"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { QuizKind } from "@/types/database";

export default function CreateQuizForm({ kind }: { kind: QuizKind }) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(kind === "quiz" ? 20 : 80);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    const { data, error: insertError } = await supabase
      .from("quizzes")
      .insert({ title, description, duration_minutes: duration, kind, created_by: user?.id })
      .select()
      .single();

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push(`/admin/quizzes/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="font-display text-lg font-semibold text-navy-800">
        Create a new {kind === "exam" ? "exam" : "quiz"}
      </h3>
      <div>
        <label className="label" htmlFor="title">Title</label>
        <input
          id="title"
          className="input"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={kind === "exam" ? "e.g. Final Course Exam" : "e.g. Week 3 Quiz"}
        />
      </div>
      <div>
        <label className="label" htmlFor="description">Description (optional)</label>
        <input
          id="description"
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="duration">Duration (minutes)</label>
        <input
          id="duration"
          type="number"
          min={1}
          className="input"
          required
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Creating…" : "Create & add questions"}
      </button>
    </form>
  );
}
