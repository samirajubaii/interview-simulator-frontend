import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function AuthPage() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [mode, setMode] = useState(
    searchParams.get("mode") === "register" ? "register" : "login"
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirectTo]);

  if (authLoading) {
    return (
      <div style={s.page}>
        <div style={s.ambientTop} />
        <div style={s.grid} />
        <p style={{ color: "#475569", position: "relative", zIndex: 1 }}>Loading...</p>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/login" : "/register";
      const payload = mode === "login"
        ? { email, password }
        : { name, email, password, password_confirmation: passwordConfirmation };

      const res = await api.post(endpoint, payload);
      login(res.data.token, res.data.user);
      navigate(redirectTo);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        Object.values(err?.response?.data?.errors || {})?.[0]?.[0] ||
        "Authentication failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.ambientTop} />
      <div style={s.grid} />

      <div style={s.centerWrap}>
        {/* BRAND */}
        <div style={s.brand} onClick={() => navigate("/")}>
          <span style={s.brandLogo}>▲</span>
          <span style={s.brandName}>InterviewAI</span>
        </div>
        <motion.div
          style={s.card}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* HEADER */}
          <div style={s.cardHeader}>
            <h1 style={s.cardTitle}>
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p style={s.cardSub}>
              {mode === "login"
                ? "Sign in to continue your interview practice."
                : "Start practicing interviews with AI feedback."}
            </p>
          </div>

          {/* MODE TOGGLE */}
          <div style={s.toggle}>
            {["login", "register"].map((m) => (
              <button
                key={m}
                style={{
                  ...s.toggleBtn,
                  background: mode === m ? "rgba(99,102,241,0.15)" : "transparent",
                  color: mode === m ? "#818cf8" : "#475569",
                  borderColor: mode === m ? "rgba(99,102,241,0.3)" : "transparent",
                }}
                onClick={() => { setMode(m); setError(""); }}
              >
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* FORM */}
          <form onSubmit={submit} style={s.form}>
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={s.fieldWrap}>
                    <label style={s.label}>Full Name</label>
                    <input
                      style={s.input}
                      placeholder="John Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={s.fieldWrap}>
              <label style={s.label}>Email</label>
              <input
                style={s.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={s.fieldWrap}>
              <label style={s.label}>Password</label>
              <input
                style={s.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {mode === "login" && (
  <div style={{ textAlign: "right", marginTop: -8, marginBottom: 12 }}>
    <span
      style={{ color: "#6366f1", fontSize: 12, cursor: "pointer" }}
      onClick={() => navigate("/forgot-password")}
    >
      Forgot password?
    </span>
  </div>
)}

            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={s.fieldWrap}>
                    <label style={s.label}>Confirm Password</label>
                    <input
                      style={s.input}
                      type="password"
                      placeholder="••••••••"
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ERROR */}
            <AnimatePresence>
              {error && (
                <motion.div
                  style={s.errorBox}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <span style={s.errorIcon}>⚠</span>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign In →"
                : "Create Account →"}
            </button>
          </form>
        </motion.div>

        <p style={s.footerNote}>
          By continuing you agree to our{" "}
          <span style={s.footerLink}>Terms of Service</span>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#080c14",
    color: "#e2e8f0",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: "24px",
  },
  ambientTop: {
    position: "fixed",
    top: "-200px",
    right: "-100px",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  grid: {
    position: "fixed",
    inset: 0,
    backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
    backgroundSize: "80px 80px",
    pointerEvents: "none",
    zIndex: 0,
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    zIndex: 10,
    marginBottom: "8px",
  },
  brandLogo: { fontSize: "14px", color: "#6366f1" },
  brandName: { fontSize: "14px", fontWeight: "700", color: "#f1f5f9" },

  centerWrap: {
    width: "100%",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    position: "relative",
    zIndex: 1,
  },

  card: {
    width: "100%",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    backdropFilter: "blur(12px)",
  },

  cardHeader: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  cardTitle: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#f1f5f9",
    margin: 0,
    letterSpacing: "-0.3px",
  },
  cardSub: {
    fontSize: "13px",
    color: "#475569",
    margin: 0,
  },

  toggle: {
    display: "flex",
    gap: "4px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "8px",
    padding: "4px",
  },
  toggleBtn: {
    flex: 1,
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  input: {
    padding: "11px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.3)",
    color: "#e2e8f0",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#fca5a5",
  },
  errorIcon: { fontSize: "12px" },

  submitBtn: {
    padding: "13px",
    borderRadius: "8px",
    border: "none",
    background: "#6366f1",
    color: "white",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "4px",
    transition: "opacity 0.2s",
  },

  footerNote: {
    fontSize: "12px",
    color: "#334155",
    textAlign: "center",
    margin: 0,
  },
  footerLink: {
    color: "#475569",
    cursor: "pointer",
  },
};
