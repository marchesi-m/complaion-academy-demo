import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { QuizSubmitResponse } from "../api";

interface AlreadyPassedState {
  alreadyPassed: true;
}

type ResultState = QuizSubmitResponse | AlreadyPassedState | null;

export default function Result() {
  const { id: assignmentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ResultState;

  if (!state) {
    navigate("/courses");
    return null;
  }

  if ("alreadyPassed" in state) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#f5f4f0" }}>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Already passed!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">You have already completed this quiz. Your certificate is available in your course list.</p>
          <button
            onClick={() => navigate("/courses")}
            className="text-white font-medium px-6 py-2 rounded-lg text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#315DC4" }}
          >
            Back to courses
          </button>
        </div>
      </div>
    );
  }

  const { score, passed, attempts_used, attempts_remaining } = state;
  const scorePercent = Math.round(score * 100);
  const canRetry = !passed && attempts_remaining !== 0;
  const exhausted = !passed && attempts_remaining === 0;

  const description = passed
    ? "Well done — you've demonstrated the required knowledge. Your certificate has been issued and is now available in your course list."
    : exhausted
    ? "You've used all your available attempts. You'll need to retake the course from the beginning before trying the quiz again."
    : `You did not reach the passing threshold.`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#f5f4f0" }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {passed ? "You passed!" : exhausted ? "No attempts left" : "Your score is"}
        </h2>

        <p
          className={`text-5xl font-bold mb-5 pb-7 pt-2 ${passed ? "text-green-600" : "text-red-400"}`}
        >
          {scorePercent}%
        </p>

        <p className="text-sm text-gray-500 leading-relaxed mb-2">
          {description}
        </p>

        <p className="text-sm text-gray-400 mb-8 pb-4 pt-8">
          Attempt {attempts_used} of {attempts_used + (attempts_remaining === -1 ? 0 : attempts_remaining)}
        </p>

        <div className="flex flex-col gap-3">
          {canRetry && (
            <button
              onClick={() => navigate(`/courses/${assignmentId}/quiz`)}
              className="text-white font-medium px-6 py-2 rounded-lg text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#315DC4" }}
            >
              Try again
            </button>
          )}
          <button
            onClick={() => navigate("/courses")}
            className="text-sm hover:underline"
            style={{ color: "#315DC4" }}
          >
            Back to courses
          </button>
        </div>
      </div>
    </div>
  );
}
