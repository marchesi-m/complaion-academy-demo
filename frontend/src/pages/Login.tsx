import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import complaionLogo from "../assets/complaion-logo.png";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? "Invalid credentials");
      }
      const { access_token } = await res.json();
      localStorage.setItem("token", access_token);
      navigate("/courses");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-3" style={{ backgroundColor: "#f5f4f0" }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col items-center mb-6">
          <img src={complaionLogo} alt="Complaion" className="w-auto mb-2 rounded-xl" style={{ height: "100px" }} />
          <span className="text-2xl font-semibold tracking-wide uppercase pt-2" style={{ color: "#6b6b6b" }}>
            A c a d e m y
          </span>
        </div>

        <div className="mb-6 text-center pt-3">
          <p className="text-bg font-medium whitespace-nowrap" style={{ color: "#9ca3af" }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pt-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="demo@complaion.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors"
            style={{ backgroundColor: "#6d28d9" }}
            onMouseEnter={(e) => { if (!loading) (e.target as HTMLElement).style.backgroundColor = "#5b21b6"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = "#6d28d9"; }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
