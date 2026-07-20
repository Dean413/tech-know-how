"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function GradeSubmission({
    submissionId,
    currentGrade,
    currentFeedback,
}: {
    submissionId: string;
    currentGrade: number | null;
    currentFeedback: string | null;
}) {
    const supabase = createClient();

    const [grade, setGrade] = useState(currentGrade ?? 0);
    const [feedback, setFeedback] = useState(currentFeedback ?? "");
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    async function saveGrade() {
        setLoading(true);
        setSaved(false);

        const { error } = await supabase
            .from("assignment_submissions")
            .update({
                grade,
                feedback,
                graded_at: new Date().toISOString(),
            })
            .eq("id", submissionId);

        setLoading(false);

        if (!error) {
            setSaved(true);
        }
    }

    return (
        <div className="mt-3 space-y-2 rounded-lg bg-navy-50 p-3">

            <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="input"
            >
                <option value={0}>Select grade</option>
                {[1, 2, 3, 4, 5].map((item) => (
                    <option key={item} value={item}>
                        {item}/5
                    </option>
                ))}
            </select>


            <textarea
                className="input min-h-20"
                placeholder="Write feedback for the student..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
            />


            <button
                onClick={saveGrade}
                disabled={loading || grade === 0}
                className="btn-primary w-full text-sm"
            >
                {loading ? "Saving..." : "Send grade"}
            </button>

            {saved && (
                <p className="text-sm text-teal">
                    Grade sent successfully
                </p>
            )}

        </div>
    );
}