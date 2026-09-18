import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate(user.role === "host" || user.role === "admin" ? "/admin/listings" : (location.state?.from ?? "/"), { replace: true });
  }, [user, navigate, location.state]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const signedInUser = mode === "login"
        ? await login({ email: form.email, password: form.password })
        : await register(form);
      const defaultDestination = signedInUser.role === "host" || signedInUser.role === "admin" ? "/admin/listings" : "/";
      navigate(location.state?.from ?? defaultDestination, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <Link className="auth-brand" to="/">airbnb</Link>
      <section className="auth-card">
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p>{mode === "login" ? "Log in to book a stay or manage your listings." : "Create a guest account to make reservations."}</p>
        <form onSubmit={submit}>
          {mode === "register" && <label><span>Name</span><input name="username" value={form.username} onChange={updateField} required minLength="2" /></label>}
          <label><span>Email</span><input type="email" name="email" value={form.email} onChange={updateField} required /></label>
          <label><span>Password</span><input type="password" name="password" value={form.password} onChange={updateField} required minLength="8" /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="reserve-button" type="submit" disabled={submitting}>{submitting ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
        </form>
        <button className="auth-switch" type="button" onClick={() => { setMode((current) => current === "login" ? "register" : "login"); setError(""); }}>
          {mode === "login" ? "New here? Create a guest account" : "Already registered? Log in"}
        </button>
        <div className="demo-login"><strong>Demo host after seeding</strong><span>host@zaioairbnb.test</span><span>Host1234!</span></div>
      </section>
    </main>
  );
}
