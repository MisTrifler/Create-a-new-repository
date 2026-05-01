import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Signup() {
  const [displayName, setDisplayName] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);

  async function signup() {
    if (!displayName.trim()) {
      alert("Please enter your public display name.");
      return;
    }

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setCreating(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      setCreating(false);
      alert(error.message);
      return;
    }

    const userId = data?.user?.id;

    if (userId) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        display_name: displayName.trim(),
        location: location.trim() || null,
        updated_at: new Date().toISOString()
      });

      if (profileError) {
        console.error(profileError);
      }
    }

    setCreating(false);

    alert(
      "Account created. If email confirmation is enabled, please check your inbox before logging in."
    );

    window.location.href = "/login";
  }

  return (
    <>
      <div className="page">
        <header className="header">
          <a href="/" className="logo">
            LocalDeal
          </a>
        </header>

        <main className="card">
          <h1>Create your account</h1>

          <p>
            Join LocalDeal to post products, message sellers and build trust with
            reviews.
          </p>

          <label>Public display name *</label>
          <input
            placeholder="Example: Vidyut, Sarah, Laptop Seller"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={40}
          />

          <label>Your area</label>
          <input
            placeholder="Example: Birmingham, Walsall, London"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <label>Email *</label>
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password *</label>
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={signup} disabled={creating}>
            {creating ? "Creating account..." : "Sign Up"}
          </button>

          <p className="smallText">
            Already have an account? <a href="/login">Login</a>
          </p>
        </main>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          font-family: Arial, sans-serif;
          min-height: 100vh;
          background: #f3f4f6;
        }

        .header {
          background: #111827;
          padding: 20px 40px;
        }

        .logo {
          color: white;
          font-size: 26px;
          font-weight: 800;
          text-decoration: none;
        }

        .card {
          max-width: 460px;
          margin: 60px auto;
          background: white;
          padding: 35px;
          border-radius: 16px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
        }

        h1 {
          margin-top: 0;
        }

        p {
          color: #555;
          line-height: 1.5;
        }

        label {
          display: block;
          margin-top: 14px;
          margin-bottom: 6px;
          font-weight: 700;
        }

        input {
          width: 100%;
          padding: 14px;
          border-radius: 9px;
          border: 1px solid #d1d5db;
          font-size: 15px;
        }

        button {
          width: 100%;
          margin-top: 20px;
          padding: 14px;
          background: #111827;
          color: white;
          border: none;
          border-radius: 9px;
          font-weight: 800;
          cursor: pointer;
        }

        button:disabled {
          background: #777;
          cursor: not-allowed;
        }

        .smallText {
          text-align: center;
          margin-top: 18px;
        }

        @media (max-width: 600px) {
          .header {
            padding: 18px;
            text-align: center;
          }

          .card {
            margin: 30px 14px;
            padding: 24px;
          }
        }
      `}</style>
    </>
  );
}
