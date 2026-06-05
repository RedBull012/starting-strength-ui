import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import WorkoutList from "./components/WorkoutList";
import ProgressChart from "./components/ProgressChart";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Settings from "./components/Settings";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [allExercises, setAllExercises] = useState([]);

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

  useEffect(() => {
    if (!token) return;
    fetch(``${import.meta.env.VITE_API_URL}/api/exercises`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAllExercises(data));
  }, [token]);

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-16">
      <Routes>
        <Route
          path="/"
          element={<WorkoutList token={token} onLogout={handleLogout} />}
        />
        <Route
          path="/progress"
          element={<ProgressChart allExercises={allExercises} token={token} />}
        />
        <Route
          path="/settings"
          element={<Settings token={token} onLogout={handleLogout} />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Navbar />
    </div>
  );
}

export default App;
