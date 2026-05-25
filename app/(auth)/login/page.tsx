import Link from "next/link";

export default function LoginPage() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "400px",
        background: "white",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        Login
      </h1>

      <form
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <input
          type="email"
          placeholder="Email"
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          style={inputStyle}
        />

        <button style={buttonStyle}>
          Login
        </button>
      </form>

      <p
        style={{
          marginTop: "20px",
          textAlign: "center",
        }}
      >
        Don’t have an account?{" "}
        <Link href="/register">
          Register
        </Link>
      </p>
    </div>
  );
}

const inputStyle = {
  padding: "12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  padding: "12px",
  borderRadius: "6px",
  border: "none",
  background: "#0070f3",
  color: "black",
  cursor: "pointer",
};