import { createClient } from "@/lib/supabase/server";
import AssignmentCard from "@/components/AssignmentCard";

export default async function StudentAssignmentsPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: assignments } = await supabase
    .from("assignments")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: submissions } = await supabase
    .from("assignment_submissions")
    .select("*")
    .eq("student_id", user!.id);

  return (
    <div>
      <p className="eyebrow">Assignments</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-navy-800">
        Submit your work
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        Drop the link to your submission for each assignment below.
      </p>

      <div className="mt-8 space-y-5">
        {assignments && assignments.length > 0 ? (
          assignments.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              existingSubmission={submissions?.find((s) => s.assignment_id === a.id) ?? null}
              studentId={user!.id}
            />
          ))
        ) : (
          <div className="card text-sm text-navy-500">
            Nothing posted yet — check back once your instructor shares the first assignment.
          </div>
        )}
      </div>
    </div>
  );
}
