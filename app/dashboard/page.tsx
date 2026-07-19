import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import IdCard from "@/components/ui/IdCard";

export default async function DashboardOverview() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const { count: assignmentCount } = await supabase
    .from("assignments")
    .select("*", { count: "exact", head: true });

  const { count: quizCount } = await supabase
    .from("quizzes")
    .select("*", { count: "exact", head: true })
    .eq("kind", "quiz")
    .eq("is_published", true);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <IdCard fullName={profile?.full_name ?? ""} matricNumber={profile?.matric_number ?? null} />
      </div>

      <div className="lg:col-span-2">
        <p className="eyebrow">Overview</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-navy-800">
          Welcome back, {profile?.full_name?.split(" ")[0]}.
        </h1>
        <p className="mt-1 text-sm text-navy-500">
          Here's everything you need for this program.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href="/dashboard/assignments" className="card group hover:shadow-card-hover">
            <p className="text-3xl font-display font-semibold text-navy-800">{assignmentCount ?? 0}</p>
            <p className="mt-1 text-sm text-navy-500">Assignments posted</p>
            <span className="mt-4 inline-block text-sm font-medium text-brand group-hover:underline">
              View assignments →
            </span>
          </Link>
          <Link href="/dashboard/quizzes" className="card group hover:shadow-card-hover">
            <p className="text-3xl font-display font-semibold text-navy-800">{quizCount ?? 0}</p>
            <p className="mt-1 text-sm text-navy-500">Quizzes available</p>
            <span className="mt-4 inline-block text-sm font-medium text-brand group-hover:underline">
              Go to quizzes →
            </span>
          </Link>
          <Link href="/dashboard/exams" className="card group hover:shadow-card-hover">
            <p className="text-3xl font-display font-semibold text-navy-800">Final</p>
            <p className="mt-1 text-sm text-navy-500">Course exam</p>
            <span className="mt-4 inline-block text-sm font-medium text-brand group-hover:underline">
              Go to exams →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
