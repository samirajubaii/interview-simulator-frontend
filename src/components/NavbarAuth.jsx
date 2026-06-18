import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useBreakpoint } from "../hooks/useBreakpoint";

function NavbarAuth({ styles }) {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  if (loading) return (
    <>
      <button
        type="button"
        style={styles.linkBtn}
        onClick={() => navigate("/auth")}
      >
        Log in
      </button>
      <button
        type="button"
        style={styles.linkBtn}
        onClick={() => navigate("/auth?mode=register")}
      >
        Sign up
      </button>
    </>
  );

  if (isAuthenticated) {
    return (
      <>
        <span style={styles.userName}>
          Hi, {isMobile ? user.name?.split(' ')[0] : user.name}
        </span>
        <button
          type="button"
          style={styles.linkBtn}
          onClick={() => navigate("/dashboard")}>Dashboard</button>
        <button type="button" style={styles.outlineBtn} onClick={logout}>
          Logout
        </button>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        style={styles.linkBtn}
        onClick={() => navigate("/auth")}
      >
        Log in
      </button>
      <button
        type="button"
        style={styles.linkBtn}
        onClick={() => navigate("/auth?mode=register")}
      >
        Sign up
      </button>
    </>
  );
}

export default NavbarAuth;