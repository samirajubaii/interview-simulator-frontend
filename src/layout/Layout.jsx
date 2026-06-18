import { theme } from "../theme";

function Layout({ children }) {
  return (
    <div style={styles.page}>
      <div style={styles.content}>{children}</div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: theme.colors.bg,
    display: "flex",
    justifyContent: "center",
    padding: "40px 20px",
  },
  content: {
    width: "100%",
    
  },
};

export default Layout;