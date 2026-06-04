const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function token(): string | null {
  return localStorage.getItem("token");
}

function authHeaders(): HeadersInit {
  const t = token();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function handle(res: Response) {
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/";
    throw new Error("Unauthorised");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? res.statusText);
  }
  return res.json();
}

export async function login(email: string, password: string): Promise<{ access_token: string }> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handle(res);
}

export interface CourseListItem {
  assignment_id: string;
  course_name: string;
  quiz_required: boolean;
  status: string;
  quiz_status: string;
  quiz_attempts_count: number;
}

export async function listCourses(): Promise<CourseListItem[]> {
  const res = await fetch(`${BASE}/me/courses`, {
    headers: authHeaders(),
  });
  return handle(res);
}

export interface AnswerOption {
  id: string;
  text: string;
}

export interface ServedQuestion {
  question_id: string;
  type: string;
  text: string;
  options: AnswerOption[];
}

export interface QuizFetchResponse {
  attempt_number: number;
  attempts_remaining: number;
  questions: ServedQuestion[];
  already_passed: boolean;
}

export async function fetchQuiz(assignmentId: string): Promise<QuizFetchResponse> {
  const res = await fetch(
    `${BASE}/share/interactive_courses/${assignmentId}/quiz`,
    { headers: authHeaders() }
  );
  return handle(res);
}

export interface QuizSubmitResponse {
  score: number;
  passed: boolean;
  attempts_used: number;
  attempts_remaining: number;
}

export async function submitQuiz(
  assignmentId: string,
  answers: Record<string, string[]>
): Promise<QuizSubmitResponse> {
  const res = await fetch(
    `${BASE}/share/interactive_courses/${assignmentId}/quiz/submit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ answers }),
    }
  );
  return handle(res);
}
