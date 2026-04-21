import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

// Inline Logo for auth pages
function AuthLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L14.5 9H9.5L12 2Z" fill="#38bdf8" opacity="0.9" />
        <rect x="9" y="8" width="6" height="8" rx="1" fill="#38bdf8" opacity="0.7" />
        <path d="M9 13L6 17H9V13Z" fill="#38bdf8" opacity="0.5" />
        <path d="M15 13L18 17H15V13Z" fill="#38bdf8" opacity="0.5" />
        <circle cx="12" cy="11" r="1.5" fill="#0a0a0a" />
        <rect x="10.5" y="16" width="3" height="2" rx="0.5" fill="#38bdf8" opacity="0.4" />
      </svg>
      <span className="text-xl font-bold tracking-tight text-text-primary">Asktronaut</span>
    </div>
  );
}

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await loginAPI(form);
      login(data);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base flex relative overflow-hidden">
      {/* Starfield */}
      <div className="starfield" />

      {/* ── LEFT: Brand column ── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0
        border-r border-border-subtle bg-surface px-12 py-16 relative z-10">
        <AuthLogo />

        <div>
          <h1 className="text-3xl font-bold text-text-primary leading-snug mb-4 tracking-tight">
            AI conversations,<br />built for thinkers.
          </h1>
          <p className="text-text-muted text-[15px] leading-relaxed max-w-xs">
            Asktronaut is a focused AI assistant built for quality conversations — no noise, no fluff.
          </p>
        </div>

        {/* Minimal decorative grid dots */}
        <div className="flex gap-3 items-center">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`block rounded-full ${
                i === 0 ? "w-2 h-2 bg-accent" : "w-1.5 h-1.5 bg-border-subtle"
              }`}
            />
          ))}
          <span className="text-text-muted text-xs ml-1">Login</span>
        </div>
      </div>

      {/* ── RIGHT: Form column ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <AuthLogo />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-1.5 tracking-tight">
              Welcome back
            </h2>
            <p className="text-text-muted text-sm">
              Log in to continue your conversations.
            </p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-md bg-red-500/10 border border-red-500/20
              text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="input-base"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-medium text-text-secondary">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[12px] text-accent hover:underline font-medium">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="input-base pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                    text-text-muted hover:text-text-secondary transition-colors duration-150"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full mt-6 h-10"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-text-muted text-[13px]">
            Don't have an account?{" "}
            <Link to="/signup" className="text-accent hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
