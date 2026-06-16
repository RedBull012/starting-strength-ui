import { useState, useEffect } from "react";

function Settings({ token, onLogout, authFetch }) {
  const [exercises, setExercises] = useState([]);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [exerciseMessage, setExerciseMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  // Template state
  const [templates, setTemplates] = useState([]);
  const [exportStart, setExportStart] = useState("");
  const [exportEnd, setExportEnd] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateRows, setTemplateRows] = useState([
    { exerciseId: "", sets: "3", reps: "5" },
  ]);
  const [templateMessage, setTemplateMessage] = useState("");

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    authFetch(`${API}/api/exercises`)
      .then((res) => res.json())
      .then((data) => setExercises(data));

    authFetch(`${API}/api/templates`)
      .then((res) => res.json())
      .then((data) => setTemplates(data))
      .catch(() => {});

    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  function handleExport() {
    if (!exportStart || !exportEnd) return;
    authFetch(
      `${API}/api/workouts/export?startDate=${exportStart}&endDate=${exportEnd}`,
    )
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `workouts_${exportStart}_to_${exportEnd}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => {});
  }

  function handleChangePassword() {
    if (!currentPassword || !newPassword) return;
    authFetch(`${API}/auth/change-password`, {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    })
      .then((res) => res.text().then((msg) => ({ ok: res.ok, msg })))
      .then(({ ok, msg }) => {
        setPasswordMessage(msg);
        if (ok) {
          setCurrentPassword("");
          setNewPassword("");
        }
        setTimeout(() => setPasswordMessage(""), 3000);
      })
      .catch(() => {});
  }

  function handleAddExercise() {
    if (!newExerciseName.trim()) return;
    authFetch(`${API}/api/exercises`, {
      method: "POST",
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
    authFetch(`${API}/api/exercises/${id}`, { method: "DELETE" }).then(() => {
      setExercises(exercises.filter((e) => e.id !== id));
    });
  }

  function addTemplateRow() {
    setTemplateRows([
      ...templateRows,
      { exerciseId: "", sets: "3", reps: "5" },
    ]);
  }

  function removeTemplateRow(index) {
    setTemplateRows(templateRows.filter((_, i) => i !== index));
  }

  function updateTemplateRow(index, field, value) {
    const updated = templateRows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row,
    );
    setTemplateRows(updated);
  }

  function handleCreateTemplate() {
    if (!templateName.trim()) return;
    const validRows = templateRows.filter((r) => r.exerciseId);
    if (validRows.length === 0) return;

    const payload = {
      name: templateName,
      exercises: validRows.map((r) => ({
        exerciseId: parseInt(r.exerciseId),
        sets: parseInt(r.sets),
        reps: parseInt(r.reps),
      })),
    };

    authFetch(`${API}/api/templates`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((created) => {
        setTemplates([...templates, created]);
        setTemplateName("");
        setTemplateRows([{ exerciseId: "", sets: "3", reps: "5" }]);
        setTemplateMessage("Template saved");
        setTimeout(() => setTemplateMessage(""), 2000);
      })
      .catch(() => {});
  }

  function handleDeleteTemplate(id) {
    authFetch(`${API}/api/templates/${id}`, { method: "DELETE" }).then(() => {
      setTemplates(templates.filter((t) => t.id !== id));
    });
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-x-hidden">
      <div
        className="pointer-events-none fixed top-0 right-0 w-96 h-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)",
          transform: "translate(30%, -30%)",
        }}
      />
      <div
        className="pointer-events-none fixed bottom-0 left-0 w-72 h-72 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)",
          transform: "translate(-30%, 30%)",
        }}
      />
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
              onClick={handleChangePassword}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Export */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Export Workouts
          </h2>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Start date</p>
                <input
                  type="date"
                  value={exportStart}
                  onChange={(e) => setExportStart(e.target.value)}
                  className="w-full min-w-0 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">End date</p>
                <input
                  type="date"
                  value={exportEnd}
                  onChange={(e) => setExportEnd(e.target.value)}
                  className="w-full min-w-0 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
            <button
              onClick={handleExport}
              disabled={!exportStart || !exportEnd}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              Download CSV
            </button>
          </div>
        </div>

        {/* Workout templates */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Workout Templates
          </h2>
          {templateMessage && (
            <p className="text-orange-400 text-sm mb-3">{templateMessage}</p>
          )}

          {/* Existing templates */}
          {templates.length > 0 && (
            <div className="flex flex-col gap-2 mb-5">
              {templates.map((t) => (
                <div key={t.id} className="bg-zinc-800 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm">{t.name}</p>
                    <button
                      onClick={() => handleDeleteTemplate(t.id)}
                      className="text-zinc-500 hover:text-red-400 text-xs transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {t.exercises
                      .map((e) => `${e.exerciseName} ${e.sets}×${e.reps}`)
                      .join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Create template form */}
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Template name (e.g. Workout A)"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
            {templateRows.map((row, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select
                  value={row.exerciseId}
                  onChange={(e) =>
                    updateTemplateRow(i, "exerciseId", e.target.value)
                  }
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                >
                  <option value="">Exercise</option>
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={row.sets}
                  onChange={(e) => updateTemplateRow(i, "sets", e.target.value)}
                  placeholder="Sets"
                  className="w-16 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:border-orange-500"
                />
                <input
                  type="number"
                  value={row.reps}
                  onChange={(e) => updateTemplateRow(i, "reps", e.target.value)}
                  placeholder="Reps"
                  className="w-16 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:border-orange-500"
                />
                {templateRows.length > 1 && (
                  <button
                    onClick={() => removeTemplateRow(i)}
                    className="text-zinc-500 hover:text-red-400 text-xs transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addTemplateRow}
              className="text-sm text-zinc-500 hover:text-zinc-300 text-left transition-colors"
            >
              + Add exercise
            </button>
            <button
              onClick={handleCreateTemplate}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              Save Template
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
