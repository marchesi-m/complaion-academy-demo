import { useEffect, useState } from "react";
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
      return `${base} · Quiz score ${Math.round(c.last_quiz_score * 100)}%`;
    }
    return base;
  }
  if (!c.quiz_required) return "No quiz required";
  const attempts = c.max_attempts ?? "?";
  return `Quiz required · ${attempts} attempts available`;
}

function courseButton(c: CourseListItem): { label: string; color: string; action: "video" | "quiz" | "certificate" | "retake" } {
  if (c.status === "done") {
    return { label: "View Certificate", color: "#315DC4", action: "certificate" };
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
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={complaionLogo} alt="Complaion" className="h-9 w-auto" />
            <span className="text-sm text-gray-500 font-medium">Area Personale</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{email}</span>
            <button
              onClick={signOut}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors underline underline-offset-2"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Your Training</h1>
        <p className="text-sm text-gray-500 mb-8">
          Here you'll find all courses assigned to you. Complete your training to earn certificates and improve your skills.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm">
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

function CourseRow({ course, onAction }: { course: CourseListItem; onAction: (c: CourseListItem) => void }) {
  const btn = courseButton(course);
  return (
    <li className="px-6 py-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-medium text-gray-800 text-sm truncate">{course.course_name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{courseSubtitle(course)}</p>
      </div>
      <button
        onClick={() => onAction(course)}
        className="shrink-0 px-4 py-1.5 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
        style={{ backgroundColor: btn.color }}
      >
        {btn.label}
      </button>
    </li>
  );
}
