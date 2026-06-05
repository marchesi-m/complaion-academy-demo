import { useState } from "react";
import { completeVideo } from "../api";

interface Props {
  courseTitle: string;
  assignmentId: string;
  onClose: () => void;
  onCompleted: () => void;
}

export default function VideoModal({ courseTitle, assignmentId, onClose, onCompleted }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    setLoading(true);
    try {
      await completeVideo(assignmentId);
      onCompleted();
      onClose();
    } catch {
      // ignore, parent will refresh
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl overflow-hidden w-full max-w-3xl mx-4 flex flex-col" style={{ maxHeight: "90vh" }}>
        {/* Title bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <span className="font-medium text-gray-800 text-sm truncate pr-4">{courseTitle}</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-lg font-light leading-none"
          >
            ✕
          </button>
        </div>

        {/* Video area */}
        <div
          className="flex items-center justify-center text-gray-400 text-sm font-medium"
          style={{ backgroundColor: "#111", aspectRatio: "16/9" }}
        >
          [ VIDEO HERE ]
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 py-3 border-t border-gray-200">
          <button
            onClick={handleComplete}
            disabled={loading}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-colors"
            style={{ backgroundColor: "#1B9D46" }}
          >
            {loading ? "Saving…" : "Complete Course"}
          </button>
        </div>
      </div>
    </div>
  );
}
