interface Props {
  assignmentId: string;
  courseName: string;
  onClose: () => void;
}

function deriveCertificateId(assignmentId: string): string {
  let h1 = 5381, h2 = 52711;
  for (let i = 0; i < assignmentId.length; i++) {
    const c = assignmentId.charCodeAt(i);
    h1 = (((h1 << 5) + h1) ^ c) & 0x7fffffff;
    h2 = (((h2 << 5) + h2) ^ c) & 0x7fffffff;
  }
  const part1 = h1.toString(36).toUpperCase().padStart(5, "0");
  const part2 = h2.toString(36).toUpperCase().padStart(5, "0");
  return `${part1}${part2}`.slice(0, 10);
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

        <h2 className="text-3xl font-semibold text-gray-900 mb-3">Congratulations!</h2>
        <div className="text-4xl mb-4 pb-3">🎉</div>
        <p className="text-md text-gray-500 mb-1 font-semibold">{courseName}</p>
        <p className="text-md text-gray-500 mb-6 pb-4 pt-6">Your certificate ID is:</p>
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
