import { theme } from "../theme";

function Button({ children, onClick, variant = "primary", disabled }) {
  const isPrimary = variant === "primary";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 16px",
        borderRadius: theme.radius.md,
        border: `1px solid ${
          isPrimary ? theme.colors.primarySoft : theme.colors.border
        }`,
        background: isPrimary
          ? theme.colors.primary
          : theme.colors.surface,
        color: "white",
        cursor: "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

export default Button;