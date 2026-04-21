import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { resetPasswordAPI } from "../services/api";

function AuthLogo() {
  return (
    <div className="flex items-center gap-2.5 mb-8 justify-center lg:justify-start">
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

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.newPassword.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }
    if (form.newPassword !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);

    try {
      await resetPasswordAPI(token, form.newPassword);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000); // redirect to login securely
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired token.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-base flex flex-col items-center justify-center relative overflow-hidden px-6 py-12">
        <div className="starfield" />
        <div className="w-full max-w-sm relative z-10 z-[100] mx-auto text-center">
          <AuthLogo />
          <h2 className="text-2xl font-bold text-text-primary mb-3">Password Reset!</h2>
          <p className="text-text-muted text-sm mb-6">
            Your password has been successfully updated.
          </p>
          <Link to="/login" className="btn-accent inline-flex items-center justify-center w-full h-10">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center relative overflow-hidden px-6 py-12">
      <div className="starfield" />

      <div className="w-full max-w-sm relative z-10 z-[100] mx-auto">
        <AuthLogo />

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-text-primary mb-1.5 tracking-tight">
            Reset Password
          </h2>
          <p className="text-text-muted text-sm">
            Please enter your new password below.
          </p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="input-base"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="input-base"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-accent w-full mt-6 h-10"
          >
            {loading ? "Updating…" : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
