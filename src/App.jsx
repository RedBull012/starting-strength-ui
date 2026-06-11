import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import WorkoutList from "./components/WorkoutList";
import ProgressChart from "./components/ProgressChart";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Settings from "./components/Settings";
import BodyMetrics from "./components/BodyMetrics";

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function App() {
  const storedToken = localStorage.getItem("token");
  const validToken = storedToken && !isTokenExpired(storedToken) ? storedToken : null;

  const [token, setToken] = useState(validToken);
  const [allExercises, setAllExercises] = useState([]);

  // Clear expired token on load
  useEffect(() => {
    if (!validToken && storedToken) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
    }
  }, []);

  function handleLogin(token, username) {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    setToken(token);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
  }

  // Central fetch wrapper — auto logout on 401
  function authFetch(url, options = {}) {
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    }).then((res) => {
      if (res.status === 401) {
        handleLogout();
        return Promise.reject(new Error("Session expired"));
      }
      return res;
    });
  }

  useEffect(() => {
    if (!token) return;
    authFetch(`${import.meta.env.VITE_API_URL}/api/exercises`)
      .then((res) => res.json())
      .then((data) => setAllExercises(data))
      .catch(() => {});
  }, [token]);

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-16">
      <Routes>
        <Route
          path="/"
          element={<WorkoutList token={token} onLogout={handleLogout} authFetch={authFetch} />}
        />
        <Route
          path="/progress"
          element={<ProgressChart allExercises={allExercises} token={token} authFetch={authFetch} onLogout={handleLogout} />}
        />
        <Route
          path="/metrics"
          element={<BodyMetrics authFetch={authFetch} onLogout={handleLogout} />}
        />
        <Route
          path="/settings"
          element={<Settings token={token} onLogout={handleLogout} authFetch={authFetch} />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Navbar />
    </div>
  );
}

export default App;
