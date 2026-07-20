import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/ui/NavBar";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/assignments", label: "Assignments" },
  { href: "/dashboard/quizzes", label: "Quizzes" },
  { href: "/dashboard/exams", label: "Exams" }
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") redirect("/admin");

  return (
    <div className="min-h-screen bg-sky/40">
      <NavBar
        items={NAV_ITEMS}
        fullName={profile?.full_name ?? "Student"}
        matricOrRole={profile?.matric_number ?? ""}
      />
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
