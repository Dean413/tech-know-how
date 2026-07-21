import { createClient } from "@/lib/supabase/server";
import CreateAssignmentForm from "@/components/admin/CreateAssignmentForm";
import GradeSubmission from "@/components/admin/gradeSubmission";
import AssignmentActions from "@/components/admin/assignmentAction";

export default async function AdminAssignmentsPage() {
  const supabase = await createClient();

  const { data: assignments } = await supabase
    .from("assignments")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: submissions } = await supabase
    .from("assignment_submissions")
    .select("*, profiles(full_name, matric_number)")
    .order("submitted_at", { ascending: false });

  return (
    <div>
      <p className="eyebrow">Assignments</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-navy-800">
        Post work, review submissions
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <CreateAssignmentForm />

        <div className="space-y-5">
          {assignments && assignments.length > 0 ? (
            assignments.map((a) => {
              const subs = submissions?.filter((s) => s.assignment_id === a.id) ?? [];
              return (
                <div key={a.id} className="card">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-semibold text-navy-800">
                      {a.title}
                    </h3>
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                      {subs.length} submission{subs.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <AssignmentActions id={a.id} title={a.title} description={a.description} dueAt={a.due_at} />
                  {subs.length > 0 ? (
                    <ul className="mt-4 divide-y divide-navy-50">
                      {subs.map((s: any) => (
                        <li key={s.id}>
                          <div className="flex items-center justify-between gap-4 py-2.5">
                            <div>
                              <p className="text-sm font-medium text-navy-800">
                                {s.profiles?.full_name}
                              </p>
                              <p className="font-mono text-xs text-navy-400">
                                {s.profiles?.matric_number}
                              </p>
                            </div>
                            <a
                              href={s.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-medium text-brand hover:underline"
                            >
                              Open link →
                            </a>
                          </div>


                          <div>
                            <GradeSubmission
                              submissionId={s.id}
                              currentGrade={s.grade}
                              currentFeedback={s.feedback}
                            />
                          </div>

                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-navy-400">No submissions yet.</p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="card text-sm text-navy-500">No assignments posted yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
