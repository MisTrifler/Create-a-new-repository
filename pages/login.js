import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Logged in successfully.");
    window.location.href = "/";
  }

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        background: "#f8fafc"
      }}
    >
      <div
        style={{
          padding: "20px 40px",
          background: "white",
          borderBottom: "1px solid #e5e7eb"
        }}
      >
        <a href="/" style={{ textDecoration: "none", color: "#111" }}>
          <h2 style={{ margin: 0 }}>LocalDeal</h2>
        </a>
      </div>

      <div
        style={{
          maxWidth: "420px",
          margin: "70px auto",
          background: "white",
          padding: "35px",
          borderRadius: "16px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
        }}
      >
        <h1>Login</h1>
        <p style={{ color: "#555" }}>
          Login to post and manage your local listings.
        </p>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc"
          }}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "18px",
            borderRadius: "8px",
            border: "1px solid #ccc"
          }}
        />

        <button
          onClick={login}
          style={{
            width: "100%",
            padding: "14px",
            background: "#111827",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Login
        </button>

        <p style={{ marginTop: "18px" }}>
          No account? <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  );
}
