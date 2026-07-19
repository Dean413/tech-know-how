import Link from "next/link";
import IdCard from "@/components/ui/IdCard";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <p className="font-display text-lg font-semibold text-navy-800">Ashirov Technology </p>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost">Log in</Link>
          <Link href="/signup" className="btn-primary">Sign Up</Link>
        </nav>
      </header>

      <section className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 overflow-hidden px-6 py-16 lg:grid-cols-2 lg:py-24">
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-50 opacity-70 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <p className="eyebrow">Ashirov Tech Know-How</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-navy-800 sm:text-5xl">
            Build practical skills through structured technology training.
          </h1>
          <p className="mt-5 max-w-md text-navy-500">
            Learn modern development concepts, complete hands-on assignments, test your knowledge with
            quizzes, and track your progress through a guided learning experience designed to help you
            grow your technical skills.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary">Create your account</Link>
            <Link href="/login" className="btn-secondary">I already have one</Link>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <IdCard fullName="Your Name Here" matricNumber="ASHTCHKH001" />
        </div>
      </section>

      <section className="border-t border-navy-50 bg-sky/50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-16 sm:grid-cols-3">
          {[
            {
              title: "Structured Lessons",
              copy: "Follow a guided curriculum designed to build your knowledge from the basics to advanced concepts."
            },
            {
              title: "Practical Projects",
              copy: "Apply what you learn by building real-world projects and solving hands-on challenges."
            },
            {
              title: "Skill Assessment",
              copy: "Test your understanding through quizzes, assignments, and evaluations that measure your progress."
            }
          ].map((item) => (
            <div key={item.title} className="card">
              <h3 className="font-display text-lg font-semibold text-navy-800">{item.title}</h3>
              <p className="mt-2 text-sm text-navy-500">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-8 text-xs text-navy-300">
        © 2026 Ashirov Tech Know-How
      </footer>
    </main>
  );
}
