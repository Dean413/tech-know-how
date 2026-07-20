import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/ui/NavBar";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/assignments", label: "Assignments" },
  { href: "/admin/quizzes", label: "Quizzes" },
  { href: "/admin/exams", label: "Exams" },
  { href: "/admin/students", label: "Students" }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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

  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-sky/40">
      <NavBar items={NAV_ITEMS} fullName={profile.full_name} matricOrRole="Admin" />
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
