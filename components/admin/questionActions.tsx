"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function QuizActions({
    id,
    title,
    description,
    durationMinutes
}: {
    id: string;
    title: string;
    description: string | null;
    durationMinutes: number;
}) {
    const router = useRouter();
    const supabase = createClient();

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        title,
        description: description ?? "",
        duration_minutes: durationMinutes
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        setError(null);

        const { error: updateError } = await supabase
            .from("quizzes")
            .update({
                title: form.title,
                description: form.description,
                duration_minutes: form.duration_minutes
            })
            .eq("id", id);

        setLoading(false);
        if (updateError) {
            setError(updateError.message);
            return;
        }
        setEditing(false);
        router.refresh();
    }

    async function handleDelete(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (
            !confirm(
                `Delete "${title}"? This also deletes all its questions and every student's attempt/answers.`
            )
        )
            return;

        setLoading(true);
        const { error: deleteError } = await supabase.from("quizzes").delete().eq("id", id);
        setLoading(false);
        if (deleteError) {
            setError(deleteError.message);
            return;
        }
        router.refresh();
    }

    if (editing) {
        return (
            <form
                onSubmit={handleSave}
                onClick={(e) => e.stopPropagation()}
                className="mt-3 space-y-3 rounded-lg border border-navy-100 p-4"
            >
                <input
                    className="input"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <input
                    className="input"
                    placeholder="Description (optional)"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <input
                    type="number"
                    min={1}
                    className="input"
                    required
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex gap-2">
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? "Saving…" : "Save changes"}
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditing(false);
                        }}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="mt-3 flex gap-3" onClick={(e) => e.stopPropagation()}>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditing(true);
                }}
                className="text-xs font-medium text-brand hover:underline"
            >
                Edit
            </button>
            <button
                onClick={handleDelete}
                disabled={loading}
                className="text-xs font-medium text-red-500 hover:underline"
            >
                Delete
            </button>
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}