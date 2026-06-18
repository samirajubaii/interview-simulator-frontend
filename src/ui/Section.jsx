function Section({ title, children }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "500" }}>{title}</h2>
        {children}
      </div>
    );
  }
  
  export default Section;