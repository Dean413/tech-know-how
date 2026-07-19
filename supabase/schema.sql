-- ============================================================================
-- Ashirov Tech Know-How — Database Schema
-- Run this once in Supabase SQL Editor (Project > SQL Editor > New query).
-- Safe to re-run: uses "create if not exists" / drop-and-recreate for policies.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. Profiles (one row per auth.users row) + matric number auto-generation
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  matric_number text unique,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

-- Sequence that drives the numeric part of the matric number.
create sequence if not exists public.matric_number_seq start 1;

create or replace function public.generate_matric_number()
returns text
language plpgsql
as $$
declare
  next_val int;
begin
  next_val := nextval('public.matric_number_seq');
  return 'ASHTCHKH' || lpad(next_val::text, 3, '0');
end;
$$;

-- Automatically create a profile (with matric number) whenever a new user
-- signs up via Supabase Auth. full_name is read from the signup metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, matric_number, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Student'),
    new.email,
    public.generate_matric_number(),
    'student'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. Assignments + submissions
-- ---------------------------------------------------------------------------
create table if not exists public.assignments (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  due_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.assignment_submissions (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  link text not null,
  submitted_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);

-- ---------------------------------------------------------------------------
-- 3. Quizzes & Exams (share one table; "kind" tells them apart)
-- ---------------------------------------------------------------------------
create table if not exists public.quizzes (
  id uuid primary key default uuid_generate_v4(),
  kind text not null default 'quiz' check (kind in ('quiz', 'exam')),
  title text not null,
  description text,
  duration_minutes int not null default 20,
  is_published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  position int not null,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option text not null check (correct_option in ('a', 'b', 'c', 'd')),
  unique (quiz_id, position)
);

-- One attempt per student per quiz.
create table if not exists public.quiz_attempts (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score int,
  total int,
  released boolean not null default false,
  unique (quiz_id, student_id)
);

create table if not exists public.quiz_answers (
  id uuid primary key default uuid_generate_v4(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  selected_option text check (selected_option in ('a', 'b', 'c', 'd')),
  is_correct boolean,
  unique (attempt_id, question_id)
);

-- ---------------------------------------------------------------------------
-- 4. Helper: is the current user an admin?
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- 5. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_answers enable row level security;

-- profiles
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- assignments: everyone signed in can read; only admins write
drop policy if exists "assignments_select_all" on public.assignments;
create policy "assignments_select_all" on public.assignments
  for select using (auth.uid() is not null);

drop policy if exists "assignments_write_admin" on public.assignments;
create policy "assignments_write_admin" on public.assignments
  for all using (public.is_admin()) with check (public.is_admin());

-- submissions: students see & insert their own; admins see & manage all
drop policy if exists "submissions_select_own_or_admin" on public.assignment_submissions;
create policy "submissions_select_own_or_admin" on public.assignment_submissions
  for select using (student_id = auth.uid() or public.is_admin());

drop policy if exists "submissions_insert_own" on public.assignment_submissions;
create policy "submissions_insert_own" on public.assignment_submissions
  for insert with check (student_id = auth.uid());

drop policy if exists "submissions_update_own" on public.assignment_submissions;
create policy "submissions_update_own" on public.assignment_submissions
  for update using (student_id = auth.uid() or public.is_admin());

-- quizzes: students see only published; admins see & manage all
drop policy if exists "quizzes_select_published_or_admin" on public.quizzes;
create policy "quizzes_select_published_or_admin" on public.quizzes
  for select using (is_published = true or public.is_admin());

drop policy if exists "quizzes_write_admin" on public.quizzes;
create policy "quizzes_write_admin" on public.quizzes
  for all using (public.is_admin()) with check (public.is_admin());

-- quiz_questions: RLS is row-level only, so a plain "select" policy would
-- also hand back the correct_option column to any student who queries the
-- table directly from the browser. Instead, ONLY admins may select this
-- table directly; students reach questions (without the answer key) and
-- submit answers through the security-definer functions defined below.
drop policy if exists "questions_select_published_or_admin" on public.quiz_questions;
create policy "questions_select_admin_only" on public.quiz_questions
  for select using (public.is_admin());

drop policy if exists "questions_write_admin" on public.quiz_questions;
create policy "questions_write_admin" on public.quiz_questions
  for all using (public.is_admin()) with check (public.is_admin());

-- quiz_attempts: students see & manage their own; admins see & release all
drop policy if exists "attempts_select_own_or_admin" on public.quiz_attempts;
create policy "attempts_select_own_or_admin" on public.quiz_attempts
  for select using (student_id = auth.uid() or public.is_admin());

drop policy if exists "attempts_insert_own" on public.quiz_attempts;
create policy "attempts_insert_own" on public.quiz_attempts
  for insert with check (student_id = auth.uid());

drop policy if exists "attempts_update_own_or_admin" on public.quiz_attempts;
create policy "attempts_update_own_or_admin" on public.quiz_attempts
  for update using (student_id = auth.uid() or public.is_admin());

-- quiz_answers: students see & write their own (via attempt ownership); admins see all
drop policy if exists "answers_select_own_or_admin" on public.quiz_answers;
create policy "answers_select_own_or_admin" on public.quiz_answers
  for select using (
    public.is_admin()
    or exists (select 1 from public.quiz_attempts a where a.id = attempt_id and a.student_id = auth.uid())
  );

drop policy if exists "answers_write_own" on public.quiz_answers;
create policy "answers_write_own" on public.quiz_answers
  for all using (
    exists (select 1 from public.quiz_attempts a where a.id = attempt_id and a.student_id = auth.uid())
  )
  with check (
    exists (select 1 from public.quiz_attempts a where a.id = attempt_id and a.student_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- 6. Quiz-taking functions (security definer — these are the ONLY way a
--    student ever touches question/answer data, so the answer key never
--    travels to the browser).
-- ---------------------------------------------------------------------------

-- Start (or resume) an attempt. Returns the attempt row so the client can
-- read started_at and run the countdown from a server-trusted timestamp.
create or replace function public.start_quiz_attempt(p_quiz_id uuid)
returns public.quiz_attempts
language plpgsql
security definer set search_path = public
as $$
declare
  v_quiz public.quizzes;
  v_attempt public.quiz_attempts;
begin
  select * into v_quiz from public.quizzes where id = p_quiz_id;
  if v_quiz is null or not v_quiz.is_published then
    raise exception 'This quiz is not available.';
  end if;

  select * into v_attempt
  from public.quiz_attempts
  where quiz_id = p_quiz_id and student_id = auth.uid();

  if v_attempt is null then
    insert into public.quiz_attempts (quiz_id, student_id)
    values (p_quiz_id, auth.uid())
    returning * into v_attempt;
  end if;

  return v_attempt;
end;
$$;

-- Return questions for an attempt WITHOUT the correct_option column, and
-- only if the requesting student owns an in-progress attempt on this quiz.
create or replace function public.get_quiz_questions(p_quiz_id uuid)
returns table (
  id uuid, position int, question text,
  option_a text, option_b text, option_c text, option_d text
)
language plpgsql
security definer set search_path = public
as $$
begin
  if not exists (
    select 1 from public.quiz_attempts
    where quiz_id = p_quiz_id and student_id = auth.uid() and submitted_at is null
  ) then
    raise exception 'No active attempt for this quiz.';
  end if;

  return query
    select q.id, q.position, q.question, q.option_a, q.option_b, q.option_c, q.option_d
    from public.quiz_questions q
    where q.quiz_id = p_quiz_id
    order by q.position;
end;
$$;

-- Grade and submit. p_answers is a JSON array of
-- {"question_id": "...", "selected_option": "a"|"b"|"c"|"d"|null}.
-- Enforces the time limit server-side using started_at + duration_minutes,
-- so a student can't out-wait the client-side timer.
create or replace function public.submit_quiz_attempt(p_quiz_id uuid, p_answers jsonb)
returns public.quiz_attempts
language plpgsql
security definer set search_path = public
as $$
declare
  v_attempt public.quiz_attempts;
  v_quiz public.quizzes;
  v_score int := 0;
  v_total int := 0;
  v_item jsonb;
  v_correct text;
begin
  select * into v_attempt
  from public.quiz_attempts
  where quiz_id = p_quiz_id and student_id = auth.uid();

  if v_attempt is null then
    raise exception 'No attempt found — call start_quiz_attempt first.';
  end if;
  if v_attempt.submitted_at is not null then
    return v_attempt; -- already graded; idempotent
  end if;

  select * into v_quiz from public.quizzes where id = p_quiz_id;

  -- allow a small grace window (10s) for network latency at the deadline
  if now() > v_attempt.started_at + (v_quiz.duration_minutes || ' minutes')::interval + interval '10 seconds' then
    raise exception 'Time is up for this attempt.';
  end if;

  for v_item in select * from jsonb_array_elements(p_answers)
  loop
    v_total := v_total + 1;

    select correct_option into v_correct
    from public.quiz_questions
    where id = (v_item->>'question_id')::uuid and quiz_id = p_quiz_id;

    insert into public.quiz_answers (attempt_id, question_id, selected_option, is_correct)
    values (
      v_attempt.id,
      (v_item->>'question_id')::uuid,
      nullif(v_item->>'selected_option', ''),
      (v_item->>'selected_option') is not distinct from v_correct
    )
    on conflict (attempt_id, question_id) do update
      set selected_option = excluded.selected_option,
          is_correct = excluded.is_correct;

    if (v_item->>'selected_option') is not distinct from v_correct then
      v_score := v_score + 1;
    end if;
  end loop;

  update public.quiz_attempts
  set submitted_at = now(), score = v_score, total = v_total
  where id = v_attempt.id
  returning * into v_attempt;

  return v_attempt;
end;
$$;

-- Admin action: release results for every attempt on a quiz at once.
create or replace function public.release_quiz_results(p_quiz_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can release results.';
  end if;

  update public.quiz_attempts
  set released = true
  where quiz_id = p_quiz_id and submitted_at is not null;
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. Make yourself an admin (run manually, after you sign up once)
-- ---------------------------------------------------------------------------
-- update public.profiles set role = 'admin' where email = 'you@example.com';
