export type Role = "student" | "admin";
export type QuizKind = "quiz" | "exam";
export type OptionKey = "a" | "b" | "c" | "d";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  matric_number: string | null;
  role: Role;
  created_at: string;
};

export type Assignment = {
  id: string;
  title: string;
  description: string;
  due_at: string | null;
  created_by: string | null;
  created_at: string;
};

// export type AssignmentSubmission = {
//   id: string;
//   assignment_id: string;
//   student_id: string;
//   link: string;
//   submitted_at: string;
// };

export type AssignmentSubmission = {
  id: string;
  assignment_id: string;
  student_id: string;
  link: string;
  submitted_at: string;
  grade: number | null;
  graded_at: string | null;
  feedback: string | null;
}

export type Quiz = {
  id: string;
  kind: QuizKind;
  title: string;
  description: string | null;
  duration_minutes: number;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
};

export type QuizQuestion = {
  id: string;
  quiz_id: string;
  position: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: OptionKey;
};

export type QuizAttempt = {
  id: string;
  quiz_id: string;
  student_id: string;
  started_at: string;
  submitted_at: string | null;
  score: number | null;
  total: number | null;
  released: boolean;
};

export type QuizAnswer = {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option: OptionKey | null;
  is_correct: boolean | null;
};

// Minimal Supabase Database type so createClient<Database>() type-checks.
// Extend with generated types (`supabase gen types typescript`) any time.
//
// NOTE: newer versions of @supabase/postgrest-js require every table entry to
// include a `Relationships` array (even if empty) and the schema to declare a
// `Views` map, or the whole schema fails to satisfy `GenericSchema` and every
// query silently falls back to `never`. Keep these fields even though this
// project has no foreign-table embeds or views today.
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
        Relationships: [];
      };
      assignments: {
        Row: Assignment;
        Insert: Partial<Assignment>;
        Update: Partial<Assignment>;
        Relationships: [];
      };
      assignment_submissions: {
        Row: AssignmentSubmission;
        Insert: Partial<AssignmentSubmission>;
        Update: Partial<AssignmentSubmission>;
        Relationships: [];
      };
      quizzes: {
        Row: Quiz;
        Insert: Partial<Quiz>;
        Update: Partial<Quiz>;
        Relationships: [];
      };
      quiz_questions: {
        Row: QuizQuestion;
        Insert: Partial<QuizQuestion>;
        Update: Partial<QuizQuestion>;
        Relationships: [];
      };
      quiz_attempts: {
        Row: QuizAttempt;
        Insert: Partial<QuizAttempt>;
        Update: Partial<QuizAttempt>;
        Relationships: [];
      };
      quiz_answers: {
        Row: QuizAnswer;
        Insert: Partial<QuizAnswer>;
        Update: Partial<QuizAnswer>;
        Relationships: [];
      };
    };
    Views: {};
    // Functions: {
    //   start_quiz_attempt: { Args: { p_quiz_id: string }; Returns: QuizAttempt };
    //   get_quiz_questions: {
    //     Args: { p_quiz_id: string };
    //     Returns: Omit<QuizQuestion, "correct_option">[];
    //   };
    //   submit_quiz_attempt: {
    //     Args: { p_quiz_id: string; p_answers: { question_id: string; selected_option: OptionKey | null }[] };
    //     Returns: QuizAttempt;
    //   };
    //   release_quiz_results: { Args: { p_quiz_id: string }; Returns: undefined };
    // };

    Functions: {
      start_quiz_attempt: { Args: { p_quiz_id: string }; Returns: QuizAttempt };
      get_quiz_questions: {
        Args: { p_quiz_id: string };
        Returns: Omit<QuizQuestion, "correct_option">[];
      };
      submit_quiz_attempt: {
        Args: { p_quiz_id: string; p_answers: { question_id: string; selected_option: OptionKey | null }[] };
        Returns: QuizAttempt;
      };
      release_quiz_results: { Args: { p_quiz_id: string }; Returns: undefined };
      get_quiz_review: {
        Args: { p_quiz_id: string };
        Returns: {
          question_id: string;
          position: number;
          question: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          correct_option: OptionKey;
          selected_option: OptionKey | null;
        }[];
      };
    };
  };
};
