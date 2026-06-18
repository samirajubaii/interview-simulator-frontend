function ReviewPage({ answers, skipped, totalScore, startInterview }) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        
        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>Interview Review</h1>
          <p style={styles.subtitle}>
            Here’s how you performed
          </p>
        </div>

        {/* SUMMARY */}
        <div style={styles.summary}>
          <div style={styles.statBox}>
            <p style={styles.statLabel}>Average Score</p>
            <h2 style={styles.statValue}>{totalScore}%</h2>
          </div>

          <div style={styles.statBox}>
            <p style={styles.statLabel}>Skipped</p>
            <h2 style={styles.statValue}>{skipped.length}</h2>
          </div>

          <div style={styles.statBox}>
            <p style={styles.statLabel}>Answered</p>
            <h2 style={styles.statValue}>{answers.length}</h2>
          </div>
        </div>

        {/* ANSWERS LIST */}
        <div style={styles.list}>
          {answers.map((a, i) => (
            <div key={i} style={styles.card}>
              
              <h3 style={styles.question}>{a.question}</h3>

              <p style={styles.answer}>
                <strong>Your Answer:</strong> {a.answer}
              </p>

              <div style={styles.scoreRow}>
                <span style={styles.scoreLabel}>Score</span>
                <span
                  style={{
                    ...styles.score,
                    color:
                      a.score >= 80
                        ? "#22c55e"
                        : a.score >= 50
                        ? "#facc15"
                        : "#ef4444",
                  }}
                >
                  {a.score}%
                </span>
              </div>

              {a.explanation && (
                <p style={styles.explanation}>
                  <strong>Feedback:</strong> {a.explanation}
                </p>
              )}

              {a.improvedAnswer && (
                <p style={styles.improved}>
                  <strong>Better Answer:</strong> {a.improvedAnswer}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* ACTION */}
        <button onClick={startInterview} style={styles.restartBtn}>
          Restart Interview
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #020617)",
    display: "flex",
    justifyContent: "center",
    padding: "40px 20px",
    position: "relative",
    overflow: "hidden",
  },

  /* glow background (same vibe as home) */
  glow1: {
    position: "absolute",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, #6366f1, transparent)",
    top: "-150px",
    right: "-150px",
    filter: "blur(120px)",
    opacity: 0.25,
  },

  glow2: {
    position: "absolute",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, #a855f7, transparent)",
    bottom: "-150px",
    left: "-150px",
    filter: "blur(120px)",
    opacity: 0.2,
  },

  container: {
    width: "100%",
    maxWidth: "900px",
    color: "white",
    display: "flex",
    flexDirection: "column",
    gap: "25px",
    position: "relative",
    zIndex: 2,
  },

  header: {
    textAlign: "center",
  },

  title: {
    fontSize: "32px",
    fontWeight: "800",
  },

  subtitle: {
    color: "#94a3b8",
    marginTop: "6px",
  },

  /* SUMMARY CARDS */
  summary: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
  },

  statBox: {
    flex: 1,
    minWidth: "180px",

    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(12px)",

    padding: "20px",
    borderRadius: "16px",
    textAlign: "center",

    border: "1px solid rgba(255,255,255,0.08)",
  },

  statLabel: {
    fontSize: "13px",
    color: "#94a3b8",
  },

  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    marginTop: "6px",
  },

  /* LIST */
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  card: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(12px)",

    padding: "20px",
    borderRadius: "16px",

    display: "flex",
    flexDirection: "column",
    gap: "12px",

    border: "1px solid rgba(255,255,255,0.08)",
  },

  question: {
    fontSize: "17px",
    fontWeight: "600",
  },

  answer: {
    fontSize: "14px",
    color: "#e2e8f0",
    lineHeight: "1.5",
  },

  scoreRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  scoreLabel: {
    fontSize: "13px",
    color: "#94a3b8",
  },

  score: {
    fontWeight: "700",
    fontSize: "16px",
  },

  explanation: {
    fontSize: "14px",
    color: "#cbd5f5",
    lineHeight: "1.5",
  },

  improved: {
    fontSize: "14px",
    color: "#86efac",
    lineHeight: "1.5",
  },

  restartBtn: {
    marginTop: "10px",
    padding: "16px",
    borderRadius: "14px",
    border: "none",

    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",

    boxShadow: "0 10px 30px rgba(99,102,241,0.4)",
  },
};
  
  export default ReviewPage;