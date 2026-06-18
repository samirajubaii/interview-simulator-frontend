import { motion, AnimatePresence } from "framer-motion";

export default function InterviewCard({
  q,
  answer,
  setAnswer,
  checkAnswer,
  handleSkip,
  goNext,
  feedback,
  submitted,
  evaluating,
  timeLeft,
}) {
  if (!q) return null;

  const canGoNext = feedback && !evaluating;
  const canSubmit = answer && !submitted && !evaluating;

  const timerPercent = Math.max(0, (timeLeft / 60) * 100);
  const timerColor =
    timeLeft < 15 ? "#ef4444" : timeLeft < 30 ? "#f59e0b" : "#6366f1";

  return (
    <div style={s.card}>
      {/* QUESTION */}
      <div style={s.questionBlock}>
        <h2 style={s.question}>{q.question}</h2>
        {q.category?.name && (
          <span style={s.categoryBadge}>{q.category.name}</span>
        )}
      </div>

      {/* TIMER BAR */}
      {timeLeft !== undefined && (
        <div style={s.timerRow}>
          <span style={{ ...s.timerLabel, color: timerColor }}>
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </span>
          <div style={s.timerBar}>
            <motion.div
              style={{ ...s.timerFill, background: timerColor }}
              animate={{ width: `${timerPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* TEXTAREA */}
      <div style={s.textareaWrap}>
        <textarea
          style={{
            ...s.textarea,
            borderColor: submitted
              ? "rgba(99,102,241,0.3)"
              : "rgba(255,255,255,0.08)",
            opacity: evaluating ? 0.6 : 1,
          }}
          placeholder="Type your answer as you would in a real interview..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitted || evaluating}
          rows={7}
        />
        {answer.length > 0 && !submitted && (
          <span style={s.charCount}>{answer.length} chars</span>
        )}
      </div>

      {/* EVALUATING STATE */}
      <AnimatePresence>
        {evaluating && (
          <motion.div
            style={s.evaluatingBox}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <motion.div
              style={s.evalSpinner}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
            <div>
              <p style={s.evalTitle}>AI is evaluating your answer</p>
              <p style={s.evalSub}>This may take a few seconds</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FEEDBACK */}
      <AnimatePresence>
        {feedback && !evaluating && (
          <motion.div
            style={s.feedbackBlock}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div style={s.feedbackHeader}>
              <span style={s.feedbackIcon}>◎</span>
              <span style={s.feedbackLabel}>AI Feedback</span>
            </div>
            <p style={s.feedbackText}>{feedback}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTIONS */}
      <div style={s.actions}>
        {!submitted ? (
          <>
            <button
              onClick={checkAnswer}
              disabled={!canSubmit}
              style={{
                ...s.primaryBtn,
                opacity: canSubmit ? 1 : 0.4,
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
            >
              Submit Answer
            </button>
            <button
              onClick={handleSkip}
              disabled={evaluating}
              style={s.ghostBtn}
            >
              Skip
            </button>
          </>
        ) : canGoNext ? (
          <motion.button
            onClick={goNext}
            style={s.nextBtn}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            Next Question →
          </motion.button>
        ) : null}
      </div>
    </div>
  );
}

const s = {
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    backdropFilter: "blur(12px)",
  },

  questionBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  question: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#f1f5f9",
    lineHeight: "1.4",
    letterSpacing: "-0.3px",
    margin: 0,
  },
  categoryBadge: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: "600",
    color: "#818cf8",
    background: "rgba(99,102,241,0.1)",
    border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: "6px",
    padding: "3px 10px",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    alignSelf: "flex-start",
  },

  timerRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  timerLabel: {
    fontSize: "12px",
    fontWeight: "700",
    fontVariantNumeric: "tabular-nums",
    minWidth: "36px",
  },
  timerBar: {
    flex: 1,
    height: "3px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "2px",
    overflow: "hidden",
  },
  timerFill: {
    height: "100%",
    borderRadius: "2px",
    transition: "background 0.3s",
  },

  textareaWrap: {
    position: "relative",
  },
  textarea: {
    width: "100%",
    padding: "16px",
    borderRadius: "10px",
    border: "1px solid",
    background: "rgba(0,0,0,0.3)",
    color: "#e2e8f0",
    fontSize: "15px",
    lineHeight: "1.65",
    resize: "vertical",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  charCount: {
    position: "absolute",
    bottom: "10px",
    right: "14px",
    fontSize: "11px",
    color: "#334155",
  },

  evaluatingBox: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background: "rgba(99,102,241,0.06)",
    border: "1px solid rgba(99,102,241,0.15)",
    borderRadius: "10px",
    padding: "16px",
  },
  evalSpinner: {
    width: "20px",
    height: "20px",
    border: "2px solid rgba(99,102,241,0.2)",
    borderTop: "2px solid #6366f1",
    borderRadius: "50%",
    flexShrink: 0,
  },
  evalTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#818cf8",
    margin: "0 0 2px",
  },
  evalSub: {
    fontSize: "12px",
    color: "#475569",
    margin: 0,
  },

  feedbackBlock: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    padding: "20px",
  },
  feedbackHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
  },
  feedbackIcon: {
    fontSize: "14px",
    color: "#22c55e",
  },
  feedbackLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#22c55e",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  feedbackText: {
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: "1.7",
    margin: 0,
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "4px",
  },
  primaryBtn: {
    flex: 1,
    padding: "13px 20px",
    borderRadius: "8px",
    border: "none",
    background: "#6366f1",
    color: "white",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  ghostBtn: {
    padding: "13px 18px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "transparent",
    color: "#475569",
    fontSize: "14px",
    cursor: "pointer",
  },
  nextBtn: {
    flex: 1,
    padding: "13px 20px",
    borderRadius: "8px",
    border: "none",
    background: "#22c55e",
    color: "white",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
