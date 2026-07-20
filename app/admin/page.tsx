import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOverview() {
  const supabase = await createClient();

  const [{ count: students }, { count: assignments }, { count: quizzes }, { count: exams }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("assignments").select("*", { count: "exact", head: true }),
      supabase.from("quizzes").select("*", { count: "exact", head: true }).eq("kind", "quiz"),
      supabase.from("quizzes").select("*", { count: "exact", head: true }).eq("kind", "exam")
    ]);

  const cards = [
    { label: "Students enrolled", value: students ?? 0, href: "/admin/students" },
    { label: "Assignments posted", value: assignments ?? 0, href: "/admin/assignments" },
    { label: "Quizzes created", value: quizzes ?? 0, href: "/admin/quizzes" },
    { label: "Exams created", value: exams ?? 0, href: "/admin/exams" }
  ];

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-navy-800">
        Program overview
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card group hover:shadow-card-hover">
            <p className="font-display text-3xl font-semibold text-navy-800">{c.value}</p>
            <p className="mt-1 text-sm text-navy-500">{c.label}</p>
            <span className="mt-4 inline-block text-sm font-medium text-brand group-hover:underline">
              Manage →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
