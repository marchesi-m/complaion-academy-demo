interface Props {
  assignmentId: string;
  courseName: string;
  onClose: () => void;
}

function deriveCertificateId(assignmentId: string): string {
  return btoa(assignmentId).replace(/[^a-z0-9]/gi, "").slice(0, 10).toLowerCase();
}

export default function CertificateModal({ assignmentId, courseName, onClose }: Props) {
  const certId = deriveCertificateId(assignmentId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-8 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-lg font-light"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold text-gray-900 mb-3">Congratulations!</h2>
        <div className="text-4xl mb-4">🎉</div>
        <p className="text-sm text-gray-500 mb-1">{courseName}</p>
        <p className="text-sm text-gray-500 mb-6">Your certificate ID is:</p>
        <p
          className="text-xl font-mono font-semibold tracking-wider px-4 py-3 rounded-lg"
          style={{ backgroundColor: "#f5f4f0", color: "#1a1a1a" }}
        >
          {certId}
        </p>
      </div>
    </div>
  );
}
