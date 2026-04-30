export default function Login() {
  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>Login</h1>

      <input placeholder="Email" style={{ display: "block", margin: "10px auto", padding: "10px" }} />
      <input placeholder="Password" type="password" style={{ display: "block", margin: "10px auto", padding: "10px" }} />

      <button style={{ padding: "10px 20px" }}>Login</button>
    </div>
  );
}
