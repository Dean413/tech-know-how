// "use client";

// import { useState } from "react";
// import { createClient } from "@/lib/supabase/client";
// import type { Assignment, AssignmentSubmission } from "@/types/database";

// export default function AssignmentCard({
//   assignment,
//   existingSubmission,
//   studentId
// }: {
//   assignment: Assignment;
//   existingSubmission: AssignmentSubmission | null;
//   studentId: string;
// }) {
//   const supabase = createClient();
//   const [link, setLink] = useState(existingSubmission?.link ?? "");
//   const [saved, setSaved] = useState(existingSubmission);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     const { data, error: upsertError } = await supabase
//       .from("assignment_submissions")
//       .upsert(
//         { assignment_id: assignment.id, student_id: studentId, link },
//         { onConflict: "assignment_id,student_id" }
//       )
//       .select()
//       .single();

//     setLoading(false);

//     if (upsertError) {
//       setError(upsertError.message);
//       return;
//     }
//     setSaved(data);
//   }

//   const overdue = assignment.due_at ? new Date(assignment.due_at) < new Date() : false;

//   return (
//     <div className="card">
//       <div className="flex items-start justify-between gap-4">

//         <div>
//           <h3 className="font-display text-lg font-semibold text-navy-800">{assignment.title}</h3>
//           {assignment.due_at && (
//             <p className={`mt-1 text-xs font-medium ${overdue ? "text-red-500" : "text-navy-400"}`}>
//               Due {new Date(assignment.due_at).toLocaleString()}
//             </p>
//           )}
//         </div>
//         {saved && (
//           <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">
//             Submitted
//           </span>
//         )}
//       </div>



//       <p className="mt-3 whitespace-pre-wrap text-sm text-navy-600">{assignment.description}</p>

//       <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-2 sm:flex-row">
//         <input
//           type="url"
//           required
//           className="input"
//           placeholder="Paste your submission link"
//           value={link}
//           onChange={(e) => setLink(e.target.value)}
//         />
//         <button type="submit" disabled={loading} className="btn-primary sm:w-auto">
//           {loading ? "Saving…" : saved ? "Update link" : "Submit"}
//         </button>
//       </form>
//       {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
//       {saved && (
//         <p className="mt-2 text-xs text-navy-400">
//           Last submitted {new Date(saved.submitted_at).toLocaleString()}
//         </p>
//       )}
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Assignment, AssignmentSubmission } from "@/types/database";

export default function AssignmentCard({
  assignment,
  existingSubmission,
  studentId
}: {
  assignment: Assignment;
  existingSubmission: AssignmentSubmission | null;
  studentId: string;
}) {
  const supabase = createClient();

  const [link, setLink] = useState(existingSubmission?.link ?? "");
  const [saved, setSaved] = useState<AssignmentSubmission | null>(
    existingSubmission
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setLoading(true);

    const { data, error: upsertError } = await supabase
      .from("assignment_submissions")
      .upsert(
        {
          assignment_id: assignment.id,
          student_id: studentId,
          link
        },
        {
          onConflict: "assignment_id,student_id"
        }
      )
      .select()
      .single();

    setLoading(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    setSaved(data);
  }

  const overdue = assignment.due_at
    ? new Date(assignment.due_at) < new Date()
    : false;

  return (
    <div className="card">

      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-navy-800">
            {assignment.title}
          </h3>

          {assignment.due_at && (
            <p
              className={`mt-1 text-xs font-medium ${overdue ? "text-red-500" : "text-navy-400"
                }`}
            >
              Due {new Date(assignment.due_at).toLocaleString()}
            </p>
          )}
        </div>

        {saved && (
          <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">
            Submitted
          </span>
        )}
      </div>


      <p className="mt-3 whitespace-pre-wrap text-sm text-navy-600">
        {assignment.description}
      </p>


      {/* Grade section */}
      {saved?.grade ? (
        <div className="mt-4 rounded-lg bg-teal-50 p-3">
          <p className="font-semibold text-navy-800">
            Score: {saved.grade}/5
          </p>

          {saved.feedback && (
            <p className="mt-1 text-sm text-navy-600">
              Feedback: {saved.feedback}
            </p>
          )}
        </div>
      ) : saved ? (
        <p className="mt-4 text-sm text-navy-400">
          Awaiting grading
        </p>
      ) : null}


      <form
        onSubmit={handleSubmit}
        className="mt-5 flex flex-col gap-2 sm:flex-row"
      >
        <input
          type="url"
          required
          className="input"
          placeholder="Paste your submission link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="btn-primary sm:w-auto"
        >
          {loading ? "Saving…" : saved ? "Update link" : "Submit"}
        </button>
      </form>


      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}


      {saved && (
        <p className="mt-2 text-xs text-navy-400">
          Last submitted{" "}
          {new Date(saved.submitted_at).toLocaleString()}
        </p>
      )}

    </div>
  );
}