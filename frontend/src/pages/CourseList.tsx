import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listCourses, retakeCourse, type CourseListItem, getEmailFromToken } from "../api";
import complaionLogo from "../assets/small-logo.jpg";
import VideoModal from "../components/VideoModal";
import CertificateModal from "../components/CertificateModal";

type ModalState =
  | { kind: "video"; assignmentId: string; courseTitle: string }
  | { kind: "certificate"; assignmentId: string; courseName: string }
  | null;

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function courseSubtitle(c: CourseListItem): string {
  if (c.status === "done") {
    const base = `Completed ${formatDate(c.completed_date)}`;
    if (c.last_quiz_score !== null) {
      return `${base} · Score ${Math.round(c.last_quiz_score * 100)}%`;
    }
    return base;
  }
  if (c.quiz_status === "exhausted") {
    return "You failed the quiz, you must watch the course again";
  }
  if (!c.quiz_required) return "No quiz required";
  if (c.content_completed) {
    const remaining = (c.max_attempts ?? 0) - (c.quiz_attempts_count ?? 0);
    return `${remaining} attempt${remaining !== 1 ? "s" : ""} left`;
  }
  return `Quiz required · ${c.max_attempts ?? "?"} attempts available`;
}

function courseButton(c: CourseListItem): { label: string; color: string; action: "video" | "quiz" | "certificate" | "retake" } {
  if (c.status === "done") {
    return { label: "View Certificate", color: "#D99308", action: "certificate" };
  }
  if (c.quiz_status === "exhausted") {
    return { label: "Retake Course", color: "#DC2626", action: "retake" };
  }
  if (c.content_completed && c.quiz_required) {
    return { label: "Take Quiz", color: "#315DC4", action: "quiz" };
  }
  return { label: "Watch Course", color: "#1B9D46", action: "video" };
}

export default function CourseList() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>(null);
  const email = getEmailFromToken();

  async function loadCourses() {
    try {
      const data = await listCourses();
      setCourses(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCourses(); }, []);

  function signOut() {
    localStorage.removeItem("token");
    navigate("/");
  }

  async function handleRetake(c: CourseListItem) {
    try {
      const updated = await retakeCourse(c.assignment_id);
      setCourses((prev) => prev.map((x) => x.assignment_id === updated.assignment_id ? updated : x));
    } catch {
      // ignore
    }
  }

  function handleButton(c: CourseListItem) {
    const btn = courseButton(c);
    if (btn.action === "video") {
      setModal({ kind: "video", assignmentId: c.assignment_id, courseTitle: c.course_name });
    } else if (btn.action === "certificate") {
      setModal({ kind: "certificate", assignmentId: c.assignment_id, courseName: c.course_name });
    } else if (btn.action === "quiz") {
      navigate(`/courses/${c.assignment_id}/quiz`);
    } else if (btn.action === "retake") {
      handleRetake(c);
    }
  }

  const incomplete = courses.filter((c) => c.status !== "done");
  const complete = courses.filter((c) => c.status === "done");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f4f0" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={complaionLogo} alt="Complaion" className="h-12 w-auto rounded-lg" />
            <span className="text-base text-gray-600 font-semibold">Personal Area</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100">
              <span className="text-sm text-gray-600">{email}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-gray-400 shrink-0">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/>
              </svg>
            </div>
            <button
              onClick={signOut}
              className="text-sm text-gray-500 hover:text-gray-800 px-3 transition-colors underline underline-offset-2"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Your Training</h1>
        <p className="text-base text-gray-500 mb-8 pb-10">
          Here you'll find all courses assigned to you. Complete your training to earn certificates and improve your skills.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-semibold text-gray-900">{incomplete.length}</p>
            <p className="text-sm text-gray-500 mt-1">To complete</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-semibold text-gray-900">{complete.length}</p>
            <p className="text-sm text-gray-500 mt-1">Completed</p>
          </div>
        </div>

        {loading && (
          <p className="text-sm text-gray-400 text-center py-10">Loading…</p>
        )}

        {!loading && (
          <>
            {/* Courses to complete */}
            <section className="bg-white rounded-2xl border border-gray-200 mb-6 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Courses to complete</h2>
                <p className="text-xs text-gray-400 mt-0.5">{incomplete.length} course{incomplete.length !== 1 ? "s" : ""} pending</p>
              </div>
              {incomplete.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No courses to complete</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {incomplete.map((c) => (
                    <CourseRow key={c.assignment_id} course={c} onAction={handleButton} />
                  ))}
                </ul>
              )}
            </section>

            {/* Completed courses */}
            <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Completed courses</h2>
                <p className="text-xs text-gray-400 mt-0.5">{complete.length} certificate{complete.length !== 1 ? "s" : ""} earned</p>
              </div>
              {complete.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No completed courses yet</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {complete.map((c) => (
                    <CourseRow key={c.assignment_id} course={c} onAction={handleButton} />
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>

      {/* Modals */}
      {modal?.kind === "video" && (
        <VideoModal
          courseTitle={modal.courseTitle}
          assignmentId={modal.assignmentId}
          onClose={() => setModal(null)}
          onCompleted={loadCourses}
        />
      )}
      {modal?.kind === "certificate" && (
        <CertificateModal
          assignmentId={modal.assignmentId}
          courseName={modal.courseName}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

const BUTTON_ICONS: Record<string, React.ReactNode> = {
  video: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
      <path d="M8 5v14l11-7z"/>
    </svg>
  ),
  retake: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0">
      <path d="M1 4v6h6M23 20v-6h-6"/>
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
    </svg>
  ),
  certificate: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  quiz: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
};

function CourseRow({ course, onAction }: { course: CourseListItem; onAction: (c: CourseListItem) => void }) {
  const btn = courseButton(course);
  return (
    <li className="px-6 py-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-medium text-gray-800 text-base truncate">{course.course_name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{courseSubtitle(course)}</p>
      </div>
      <button
        onClick={() => onAction(course)}
        className="shrink-0 w-40 flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
        style={{ backgroundColor: btn.color }}
      >
        {btn.label}
        {BUTTON_ICONS[btn.action]}
      </button>
    </li>
  );
}
