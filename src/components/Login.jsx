import { useState } from "react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin() {
    console.log("HandleLogin fired");
    fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid credentials");
        return res.text();
      })
      .then((token) => onLogin(token, username))
      .catch((err) => setError(err.message));
  }
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 w-80">
        <h1 className="text-xl font-bold mb-6">Starting Strength</h1>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
