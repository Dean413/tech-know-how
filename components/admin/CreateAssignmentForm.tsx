"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CreateAssignmentForm() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("assignments").insert({
      title,
      description,
      due_at: dueAt ? new Date(dueAt).toISOString() : null,
      created_by: user?.id
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setTitle("");
    setDescription("");
    setDueAt("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="font-display text-lg font-semibold text-navy-800">Post a new assignment</h3>
      <div>
        <label className="label" htmlFor="title">Title</label>
        <input
          id="title"
          className="input"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Build a To-Do App"
        />
      </div>
      <div>
        <label className="label" htmlFor="description">Instructions</label>
        <textarea
          id="description"
          className="input min-h-[120px]"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Paste the assignment brief here…"
        />
      </div>
      <div>
        <label className="label" htmlFor="dueAt">Due date (optional)</label>
        <input
          id="dueAt"
          type="datetime-local"
          className="input"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Posting…" : "Post assignment"}
      </button>
    </form>
  );
}
