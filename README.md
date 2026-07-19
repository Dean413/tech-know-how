# Ashirov Tech Know-How — Student Portal

Next.js (App Router) + TypeScript + Supabase. Students sign up and get an
auto-generated matric number (`ASHTCHKH001`, `ASHTCHKH002`, …), submit
assignments by link, take timed 20-question quizzes and a final exam, and an
admin panel lets you post assignments, view submissions, build quizzes/exams,
and release results.

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Once it's ready, open **SQL Editor → New query**, paste the entire
   contents of `supabase/schema.sql`, and run it. This creates every table,
   the matric-number trigger, and all the security policies/functions.
3. Go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon public key**

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the two values from above:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

When you deploy (e.g. to Vercel), set `NEXT_PUBLIC_SITE_URL` to your real
domain — it's used to build the password-reset email link.

## 3. Turn on email auth + confirm the redirect URL

In Supabase: **Authentication → URL Configuration** → set **Site URL** to
your app's URL (`http://localhost:3000` while developing), and add
`http://localhost:3000/reset-password` (and your production equivalent) to
**Redirect URLs**.

By default Supabase requires email confirmation before a new user can log
in. That's a good default for a real cohort. If you want to test quickly
without checking inboxes, you can turn "Confirm email" off in
**Authentication → Providers → Email** — just remember to turn it back on
before you actually launch.

## 4. Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## 5. Make yourself an admin

Sign up once through the normal `/signup` form — this issues you a matric
number like anyone else. Then, in the Supabase SQL Editor, run:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Log out and back in (or just refresh) and you'll land on `/admin` instead of
`/dashboard`.

## How the pieces fit together

- **Matric numbers**: a Postgres sequence + trigger (`on_auth_user_created`)
  fires the moment someone signs up, so the number is issued instantly and
  never reused.
- **Assignments**: admins post a title, instructions, and optional due date.
  Students paste a link; one submission per student per assignment (they can
  update the link any time before you review it).
- **Quizzes & exams**: same underlying table (`quizzes`), told apart by a
  `kind` column, so exams get their own dashboard tab and their own admin
  tab, but reuse the identical question-builder and grading logic.
- **Grading security**: correct answers are never sent to the browser. Three
  Postgres functions (`start_quiz_attempt`, `get_quiz_questions`,
  `submit_quiz_attempt`) handle the whole flow server-side inside Supabase —
  the client only ever sees question text and options, never the answer key.
  The 20-minute limit is also enforced server-side, not just by the
  on-screen countdown, so it can't be bypassed by pausing the client clock.
- **Releasing results**: quizzes auto-grade on submit, but scores stay
  hidden from students (`released = false`) until you click **Release
  results** on that quiz's admin page, which flips the flag for every
  attempt at once via `release_quiz_results`.
- **Exam button always visible**: the exam tab and card always render for
  students; before you publish it, it just shows "Locked" instead of a
  working "Start exam" button, per your requirement that the button stay in
  place throughout the course.

## Suggestions for what to add next

A few things worth considering as you grow this:

- **Bulk question import** — pasting 20 questions one at a time in the admin
  UI works but is slow. A "paste as text/CSV" importer for the question
  editor would save you real time before each quiz.
- **Late-submission flag** — the assignment due date is stored but not yet
  enforced or highlighted beyond a red "overdue" label; you could block
  submission after the deadline, or just leave it as a soft warning.
- **Email notifications** — Supabase can trigger a webhook/Edge Function
  when a new assignment or quiz is published, so students get an email
  instead of having to check the dashboard.
- **Per-question review after release** — right now released results show
  only a total score. A future page could let a student see which specific
  questions they missed once results are released.
- **CSV export** — an "export as CSV" button on the students list and on
  each quiz's results panel would help with record-keeping outside the app.

None of these are built yet — flagging them so you can prioritize what
matters most for your first cohort.
