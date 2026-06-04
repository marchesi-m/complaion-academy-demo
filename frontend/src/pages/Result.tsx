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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-5xl mb-4">🎓</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Already passed!</h2>
          <p className="text-gray-500 text-sm mb-6">You have already completed this quiz.</p>
          <button
            onClick={() => navigate("/courses")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors"
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-5xl mb-4">{passed ? "🎉" : "😞"}</div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-1">
          {passed ? "You passed!" : "Not quite"}
        </h2>

        <p
          className={`text-4xl font-bold mt-4 mb-2 ${
            passed ? "text-green-600" : "text-red-500"
          }`}
        >
          {scorePercent}%
        </p>

        <p className="text-sm text-gray-500 mb-6">
          {passed
            ? "Congratulations — your certificate has been issued."
            : attempts_remaining === 0
            ? "You have used all your attempts."
            : `${attempts_remaining} attempt${attempts_remaining !== 1 ? "s" : ""} remaining.`}
        </p>

        <div className="text-xs text-gray-400 mb-6">
          Attempt {attempts_used} completed
        </div>

        <div className="flex flex-col gap-3">
          {canRetry && (
            <button
              onClick={() => navigate(`/courses/${assignmentId}/quiz`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors"
            >
              Try again
            </button>
          )}
          <button
            onClick={() => navigate("/courses")}
            className="text-indigo-600 hover:underline text-sm"
          >
            Back to courses
          </button>
        </div>
      </div>
    </div>
  );
}
