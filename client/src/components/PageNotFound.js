import React from "react";

const PageNotFound = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#1a1a2e",
        color: "#e94560",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "5rem", margin: "0" }}>404</h1>
      <p style={{ fontSize: "1.5rem", margin: "10px 0" }}>
        Oops! The page you're looking for doesn't exist.
      </p>
      <a
        href="/"
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "1rem",
          backgroundColor: "#0f3460",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "5px",
          transition: "0.3s",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#16213e")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#0f3460")}
      >
        Go Home
      </a>
    </div>
  );
};

export default PageNotFound;
