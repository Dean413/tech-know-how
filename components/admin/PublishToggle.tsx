"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PublishToggle({
  quizId,
  isPublished,
  questionCount,
  shouldPublish
}: {
  quizId: string;
  isPublished: boolean;
  questionCount: number;
  shouldPublish: number
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await supabase.from("quizzes").update({ is_published: !isPublished }).eq("id", quizId);
    setLoading(false);
    router.refresh();
  }

  const canPublish = questionCount === shouldPublish;

  return (
    <div className="flex items-center gap-3">
      {!isPublished && !canPublish && (
        <span className="text-xs text-navy-400">
          Add all {shouldPublish} questions before publishing ({questionCount}/{shouldPublish})
        </span>
      )}
      <button
        onClick={toggle}
        disabled={loading || (!isPublished && !canPublish)}
        className={isPublished ? "btn-secondary" : "btn-primary"}
      >
        {loading ? "Saving…" : isPublished ? "Unpublish" : "Publish"}
      </button>
    </div>
  );
}
