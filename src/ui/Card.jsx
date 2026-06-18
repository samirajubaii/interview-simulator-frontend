import { theme } from "../theme";

function Card({ children }) {
  return (
    <div style={styles.card}>
      {children}
    </div>
  );
}

const styles = {
  card: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.lg,
    padding: "20px",
  },
};

export default Card;