"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AssignmentActions({
    id,
    title,
    description,
    dueAt
}: {
    id: string;
    title: string;
    description: string;
    dueAt: string | null;
}) {
    const router = useRouter();
    const supabase = createClient();

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        title,
        description,
        due_at: dueAt ? dueAt.slice(0, 16) : ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error: updateError } = await supabase
            .from("assignments")
            .update({
                title: form.title,
                description: form.description,
                due_at: form.due_at ? new Date(form.due_at).toISOString() : null
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

    async function handleDelete() {
        if (!confirm(`Delete "${title}"? This also deletes all student submissions for it.`)) return;
        setLoading(true);
        const { error: deleteError } = await supabase.from("assignments").delete().eq("id", id);
        setLoading(false);
        if (deleteError) {
            setError(deleteError.message);
            return;
        }
        router.refresh();
    }

    if (editing) {
        return (
            <form onSubmit={handleSave} className="mt-3 space-y-3 rounded-lg border border-navy-100 p-4">
                <input
                    className="input"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <textarea
                    className="input min-h-[100px]"
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <input
                    type="datetime-local"
                    className="input"
                    value={form.due_at}
                    onChange={(e) => setForm({ ...form, due_at: e.target.value })}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex gap-2">
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? "Saving…" : "Save changes"}
                    </button>
                    <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                        Cancel
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="mt-2 flex gap-3">
            <button onClick={() => setEditing(true)} className="text-xs font-medium text-brand hover:underline">
                Edit
            </button>
            <button onClick={handleDelete} disabled={loading} className="text-xs font-medium text-red-500 hover:underline">
                Delete
            </button>
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}