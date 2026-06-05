import { useState, useEffect } from "react";

function Settings({ token, onLogout }) {
  const [exercises, setExercises] = useState([]);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [exerciseMessage, setExerciseMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/exercises`, { headers })
      .then((res) => res.json())
      .then((data) => setExercises(data));

    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  function handleAddExercise() {
    if (!newExerciseName.trim()) return;
    fetch(`${import.meta.env.VITE_API_URL}/api/exercises`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name: newExerciseName }),
    })
      .then((res) => res.json())
      .then((created) => {
        setExercises([...exercises, created]);
        setNewExerciseName("");
        setExerciseMessage("Exercise added");
        setTimeout(() => setExerciseMessage(""), 2000);
      });
  }

  function handleDeleteExercise(id) {
    fetch(`${import.meta.env.VITE_API_URL}/api/exercises/${id}`, {
      method: "DELETE",
      headers,
    }).then(() => {
      setExercises(exercises.filter((e) => e.id !== id));
    });
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="border-b border-zinc-800 px-4 py-4">
        <h1 className="text-lg font-bold">Settings</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Account info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Account
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Username</p>
              <p className="font-medium">{username.toUpperCase() || "—"}</p>
            </div>
            <button
              onClick={onLogout}
              className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Change Password
          </h2>
          {passwordMessage && (
            <p className="text-orange-400 text-sm mb-3">{passwordMessage}</p>
          )}
          <div className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={() =>
                setPasswordMessage("Coming soon — needs backend support")
              }
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Manage exercises */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Exercises
          </h2>
          {exerciseMessage && (
            <p className="text-orange-400 text-sm mb-3">{exerciseMessage}</p>
          )}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Exercise name"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddExercise()}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={handleAddExercise}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3"
              >
                <p className="text-sm font-medium">{exercise.name}</p>
                <button
                  onClick={() => handleDeleteExercise(exercise.id)}
                  className="text-zinc-500 hover:text-red-400 text-xs transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
