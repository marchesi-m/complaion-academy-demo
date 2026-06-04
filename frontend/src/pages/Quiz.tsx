import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchQuiz, submitQuiz, type QuizFetchResponse, type QuizSubmitResponse } from "../api";

export default function Quiz() {
  const { id: assignmentId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<QuizFetchResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!assignmentId) return;
    fetchQuiz(assignmentId)
      .then((data) => {
        if (data.already_passed) {
          navigate(`/courses/${assignmentId}/result`, {
            state: { alreadyPassed: true },
            replace: true,
          });
          return;
        }
        setQuiz(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [assignmentId, navigate]);

  function handleSelect(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: [optionId] }));
  }

  async function handleSubmit() {
    if (!assignmentId || !quiz) return;
    const unanswered = quiz.questions.filter((q) => !answers[q.question_id]);
    if (unanswered.length > 0) {
      setError("Please answer all questions before submitting.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const result: QuizSubmitResponse = await submitQuiz(assignmentId, answers);
      navigate(`/courses/${assignmentId}/result`, { state: result });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading quiz…</p>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/courses")}
            className="text-indigo-600 hover:underline text-sm"
          >
            Back to courses
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const answeredCount = Object.keys(answers).length;
  const totalCount = quiz.questions.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Complaion Academy</h1>
        <button
          onClick={() => navigate("/courses")}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← My Courses
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Quiz</h2>
          <p className="text-sm text-gray-500 mt-1">
            Attempt {quiz.attempt_number} ·{" "}
            {quiz.attempts_remaining === -1
              ? "Unlimited attempts"
              : `${quiz.attempts_remaining} attempt${quiz.attempts_remaining !== 1 ? "s" : ""} remaining after this`}
          </p>
        </div>

        <div className="space-y-6">
          {quiz.questions.map((q, idx) => (
            <div key={q.question_id} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="font-medium text-gray-900 mb-4">
                {idx + 1}. {q.text}
              </p>
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const selected = answers[q.question_id]?.[0] === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                        selected
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.question_id}
                        value={opt.id}
                        checked={selected}
                        onChange={() => handleSelect(q.question_id, opt.id)}
                        className="accent-indigo-600"
                      />
                      <span className="text-sm text-gray-800">{opt.text}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-4">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {answeredCount} / {totalCount} answered
          </p>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors"
          >
            {submitting ? "Submitting…" : "Submit answers"}
          </button>
        </div>
      </main>
    </div>
  );
}
