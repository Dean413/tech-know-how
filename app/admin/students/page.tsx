import { createClient } from "@/lib/supabase/server";

export default async function AdminStudentsPage() {
  const supabase = createClient();

  const { data: students } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("matric_number");

  return (
    <div>
      <p className="eyebrow">Students</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-navy-800">
        Enrolled students
      </h1>
      <p className="mt-1 text-sm text-navy-500">
        {students?.length ?? 0} student{(students?.length ?? 0) === 1 ? "" : "s"} signed up so far.
      </p>

      <div className="card mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-navy-400">
              <th className="pb-3">Matric No.</th>
              <th className="pb-3">Full name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50">
            {students && students.length > 0 ? (
              students.map((s) => (
                <tr key={s.id}>
                  <td className="py-3 font-mono font-medium text-brand-700">{s.matric_number}</td>
                  <td className="py-3 text-navy-800">{s.full_name}</td>
                  <td className="py-3 text-navy-500">{s.email}</td>
                  <td className="py-3 text-navy-400">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-6 text-center text-navy-400">
                  No students have signed up yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
