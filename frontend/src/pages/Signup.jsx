import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    display_name: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm) {
      setError("passwords don't match");
      return;
    }
    setSubmitting(true);
    try {
      await signup({
        email: form.email,
        password: form.password,
        display_name: form.display_name || undefined,
      });
      // first-run onboarding — logins still go straight to the dashboard,
      // so this page shows exactly once, right after account creation.
      navigate("/welcome", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-100 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-6 bg-gold rounded-sm" />
            Pursuit
          </h1>
          <p className="text-sm text-slate-400 mt-1">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-lg font-medium">Sign up</h2>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              className="input"
              value={form.email}
              onChange={update("email")}
            />
          </div>
          <div>
            <label className="label" htmlFor="display_name">
              Display name <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              id="display_name"
              type="text"
              className="input"
              value={form.display_name}
              onChange={update("display_name")}
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              className="input"
              value={form.password}
              onChange={update("password")}
            />
            <p className="text-xs text-slate-400 mt-1">At least 8 characters.</p>
          </div>
          <div>
            <label className="label" htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              type="password"
              required
              className="input"
              value={form.confirm}
              onChange={update("confirm")}
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Creating account…" : "Sign up"}
          </button>
          <p className="text-sm text-center text-slate-300">
            Already have an account?{" "}
            <Link to="/login" className="text-accent font-medium hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
