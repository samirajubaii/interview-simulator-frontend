import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";
  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/reset-password", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
      setTimeout(() => navigate("/auth"), 3000);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Invalid or expired token. Request a new link."
      );
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: {
      minHeight: "100vh",
      background: "#080c14",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      position: "relative",
      overflow: "hidden",
    },
    ambientTop: {
      position: "absolute", top: -200, left: "50%",
      transform: "translateX(-50%)",
      width: 600, height: 400,
      background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)",
      pointerEvents: "none",
    },
    grid: {
      position: "absolute", inset: 0,
      backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
      backgroundSize: "40px 40px",
      pointerEvents: "none",
    },
    brand: {
      position: "absolute", top: 24, left: 32,
      display: "flex", alignItems: "center", gap: 8,
      cursor: "pointer", zIndex: 10,
    },
    brandLogo: { color: "#6366f1", fontSize: 18, fontWeight: 700 },
    brandName: { color: "#f1f5f9", fontSize: 15, fontWeight: 600, letterSpacing: "-0.3px" },
    card: {
      background: "rgba(15,20,30,0.9)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16,
      padding: "36px 32px",
      width: "100%",
      maxWidth: 400,
      position: "relative",
      zIndex: 1,
      backdropFilter: "blur(12px)",
    },
    cardTitle: { color: "#f1f5f9", fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" },
    cardSub: { color: "#475569", fontSize: 13, marginTop: 6, marginBottom: 24 },
    label: { display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 500, marginBottom: 6, letterSpacing: "0.3px" },
    input: {
      width: "100%", padding: "10px 12px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 8, color: "#f1f5f9", fontSize: 14,
      outline: "none", boxSizing: "border-box",
    },
    fieldWrap: { marginBottom: 16 },
    submitBtn: {
      width: "100%", padding: "11px",
      background: "linear-gradient(135deg, #6366f1, #4f46e5)",
      border: "none", borderRadius: 8,
      color: "#fff", fontSize: 14, fontWeight: 600,
      cursor: "pointer", marginTop: 8,
      transition: "opacity 0.2s",
    },
    errorBox: {
      background: "rgba(239,68,68,0.1)",
      border: "1px solid rgba(239,68,68,0.2)",
      borderRadius: 8, padding: "10px 12px",
      color: "#fca5a5", fontSize: 13,
      display: "flex", alignItems: "center", gap: 8,
      marginBottom: 12,
    },
    successBox: {
      background: "rgba(34,197,94,0.1)",
      border: "1px solid rgba(34,197,94,0.2)",
      borderRadius: 8, padding: "16px",
      color: "#86efac", fontSize: 14,
      textAlign: "center", lineHeight: 1.6,
    },
    backLink: {
      color: "#6366f1", fontSize: 13, cursor: "pointer",
      textAlign: "center", marginTop: 20, display: "block",
    },
  };

  return (
    <div style={s.page}>
      <div style={s.ambientTop} />
      <div style={s.grid} />

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
        {success ? (
          <div style={s.successBox}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
            <strong style={{ display: "block", marginBottom: 6 }}>Password reset!</strong>
            Redirecting you to sign in...
          </div>
        ) : (
          <>
            <h1 style={s.cardTitle}>Reset password</h1>
            <p style={s.cardSub}>Enter your new password below.</p>

            <form onSubmit={submit}>
              <AnimatePresence>
                {error && (
                  <motion.div
                    style={s.errorBox}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    ⚠ {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={s.fieldWrap}>
                <label style={s.label}>Email Address</label>
                <input
                  style={s.input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div style={s.fieldWrap}>
                <label style={s.label}>New Password</label>
                <input
                  style={s.input}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <div style={s.fieldWrap}>
                <label style={s.label}>Confirm New Password</label>
                <input
                  style={s.input}
                  type="password"
                  placeholder="••••••••"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password →"}
              </button>
            </form>
          </>
        )}

        <span style={s.backLink} onClick={() => navigate("/auth")}>
          ← Back to Sign In
        </span>
      </motion.div>
    </div>
  );
}