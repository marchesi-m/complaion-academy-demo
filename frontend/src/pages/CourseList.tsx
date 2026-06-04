import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listCourses, type CourseListItem } from "../api";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  not_started: { label: "Not started", className: "bg-gray-100 text-gray-600" },
  in_progress: { label: "In progress", className: "bg-yellow-100 text-yellow-700" },
  passed: { label: "Passed", className: "bg-green-100 text-green-700" },
  exhausted: { label: "Exhausted", className: "bg-red-100 text-red-700" },
};

export default function CourseList() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listCourses()
      .then(setCourses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleSignOut() {
    localStorage.removeItem("token");
    navigate("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Complaion Academy</h1>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Sign out
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">My Courses</h2>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            {error}
          </p>
        )}

        {courses.length === 0 && !error ? (
          <p className="text-gray-400 text-sm">No courses assigned.</p>
        ) : (
          <div className="space-y-3">
            {courses.map((c) => {
              const badge = STATUS_LABELS[c.quiz_status] ?? STATUS_LABELS.not_started;
              const canTakeQuiz =
                c.quiz_required &&
                c.quiz_status !== "passed" &&
                c.quiz_status !== "exhausted";

              return (
                <div
                  key={c.assignment_id}
                  className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{c.course_name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {c.quiz_required && (
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}
                        >
                          Quiz: {badge.label}
                        </span>
                      )}
                      {c.quiz_attempts_count > 0 && (
                        <span className="text-xs text-gray-400">
                          {c.quiz_attempts_count} attempt{c.quiz_attempts_count !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {canTakeQuiz && (
                    <button
                      onClick={() => navigate(`/courses/${c.assignment_id}/quiz`)}
                      className="ml-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
                    >
                      {c.quiz_status === "in_progress" ? "Resume quiz" : "Take quiz"}
                    </button>
                  )}

                  {c.quiz_status === "passed" && (
                    <span className="ml-4 text-green-600 text-sm font-medium shrink-0">✓ Completed</span>
                  )}

                  {c.quiz_status === "exhausted" && (
                    <span className="ml-4 text-red-500 text-sm shrink-0">No attempts remaining</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
