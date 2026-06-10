import { useState, useEffect } from "react";

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, current: false });

  return cells;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function WorkoutList({ token, onLogout, authFetch }) {
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [allExercises, setAllExercises] = useState([]);
  const [newWorkout, setNewWorkout] = useState({ name: "", date: "" });
  const [newExercise, setNewExercise] = useState({
    exerciseId: "",
    sets: "3",
    reps: "5",
    weight: "",
  });
  const [lastSession, setLastSession] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null); // { id, sets, reps, weight }
  const [showNewWorkout, setShowNewWorkout] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  useEffect(() => {
    authFetch(`${import.meta.env.VITE_API_URL}/api/workouts`)
      .then((res) => res.json())
      .then((data) => setWorkouts(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    authFetch(`${import.meta.env.VITE_API_URL}/api/exercises`)
      .then((res) => res.json())
      .then((data) => setAllExercises(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    authFetch(`${import.meta.env.VITE_API_URL}/api/templates`)
      .then((res) => res.json())
      .then((data) => setTemplates(data))
      .catch(() => {});
  }, []);

  // Map "YYYY-MM-DD" -> workout for quick dot lookup
  const workoutByDate = {};
  workouts.forEach((w) => {
    if (w.date) workoutByDate[w.date] = w;
  });

  function isoDate(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function handleDayClick(cell) {
    if (!cell.current) return;
    const dateStr = isoDate(calYear, calMonth, cell.day);
    const workout = workoutByDate[dateStr];
    if (workout) {
      setSelectedWorkout(workout);
      authFetch(
        `${import.meta.env.VITE_API_URL}/api/workouts/${workout.id}/exercises`,
      )
        .then((res) => res.json())
        .then((data) => setExercises(data))
        .catch(() => {});
    } else {
      setSelectedWorkout(null);
      setExercises([]);
      // Pre-fill date for new workout form
      setNewWorkout({ name: "", date: dateStr });
      setShowNewWorkout(true);
    }
  }

  function prevMonth() {
    if (calMonth === 0) {
      setCalYear(calYear - 1);
      setCalMonth(11);
    } else setCalMonth(calMonth - 1);
  }

  function nextMonth() {
    if (calMonth === 11) {
      setCalYear(calYear + 1);
      setCalMonth(0);
    } else setCalMonth(calMonth + 1);
  }

  function handleCreateWorkout(e) {
    e.preventDefault();
    authFetch(`${import.meta.env.VITE_API_URL}/api/workouts`, {
      method: "POST",
      body: JSON.stringify(newWorkout),
    })
      .then((res) => res.json())
      .then((created) => {
        setWorkouts([...workouts, created]);
        setNewWorkout({ name: "", date: "" });
        setShowNewWorkout(false);
        setSelectedWorkout(created);
        setExercises([]);
      })
      .catch(() => {});
  }

  function handleAddExercise(e) {
    e.preventDefault();
    authFetch(
      `${import.meta.env.VITE_API_URL}/api/workouts/${selectedWorkout.id}/exercises/${newExercise.exerciseId}`,
      {
        method: "POST",
        body: JSON.stringify({
          sets: parseInt(newExercise.sets),
          reps: parseInt(newExercise.reps),
          weight: parseFloat(newExercise.weight),
        }),
      },
    )
      .then((res) => res.json())
      .then((created) => {
        setExercises([...exercises, created]);
        setNewExercise({ exerciseId: "", sets: "3", reps: "5", weight: "" });
        setLastSession(null);
      })
      .catch(() => {});
  }

  function confirmDeleteWorkout() {
    authFetch(
      `${import.meta.env.VITE_API_URL}/api/workouts/${workoutToDelete.id}`,
      {
        method: "DELETE",
      },
    )
      .then(() => {
        setWorkouts(workouts.filter((w) => w.id !== workoutToDelete.id));
        if (selectedWorkout?.id === workoutToDelete.id) {
          setSelectedWorkout(null);
          setExercises([]);
        }
        setWorkoutToDelete(null);
      })
      .catch(() => {});
  }

  function handleApplyTemplate(templateId) {
    authFetch(
      `${import.meta.env.VITE_API_URL}/api/templates/${templateId}/apply/${selectedWorkout.id}`,
      { method: "POST" }
    )
      .then((res) => res.json())
      .then((created) => {
        setExercises([...exercises, ...created]);
        setShowTemplateMenu(false);
      })
      .catch(() => {});
  }

  function handleSaveEdit() {
    authFetch(
      `${import.meta.env.VITE_API_URL}/api/workouts/exercises/${editingExercise.id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          sets: parseInt(editingExercise.sets),
          reps: parseInt(editingExercise.reps),
          weight: parseFloat(editingExercise.weight),
        }),
      }
    )
      .then((res) => res.json())
      .then((updated) => {
        setExercises(exercises.map((e) => (e.id === updated.id ? updated : e)));
        setEditingExercise(null);
      })
      .catch(() => {});
  }

  function confirmDeleteExercise() {
    authFetch(
      `${import.meta.env.VITE_API_URL}/api/workouts/exercises/${exerciseToDelete}`,
      {
        method: "DELETE",
      },
    )
      .then(() => {
        setExercises(exercises.filter((e) => e.id !== exerciseToDelete));
        setExerciseToDelete(null);
      })
      .catch(() => {});
  }

  const cells = buildCalendar(calYear, calMonth);
  const todayStr = isoDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 px-4 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">Starting Strength</h1>
        <button
          onClick={onLogout}
          className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col md:flex-row md:gap-8">
        {/* ── Calendar ── */}
        <div className="md:w-80 md:shrink-0">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-base font-bold">
              {MONTH_NAMES[calMonth]} {calYear}
            </span>
            <div className="flex gap-2">
              <button
                onClick={prevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors text-sm"
              >
                ‹
              </button>
              <button
                onClick={nextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors text-sm"
              >
                ›
              </button>
            </div>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {DOW.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-semibold text-zinc-600 uppercase tracking-wide py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((cell, i) => {
              const dateStr = cell.current
                ? isoDate(calYear, calMonth, cell.day)
                : null;
              const hasWorkout = dateStr && workoutByDate[dateStr];
              const isSelected = dateStr && selectedWorkout?.date === dateStr;
              const isToday = dateStr === todayStr;

              return (
                <button
                  key={i}
                  onClick={() => handleDayClick(cell)}
                  disabled={!cell.current}
                  className={[
                    "relative flex flex-col items-center justify-center aspect-square rounded-lg text-sm font-medium transition-colors",
                    !cell.current && "text-zinc-700 cursor-default",
                    cell.current &&
                      !isSelected &&
                      "text-zinc-300 hover:bg-zinc-800",
                    isToday && !isSelected && "ring-1 ring-zinc-600",
                    isSelected && "bg-orange-500 text-white",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {cell.day}
                  {hasWorkout && (
                    <span
                      className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-orange-500"}`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-zinc-600 mt-3 text-center">
            Tap a date to view or log a workout
          </p>
        </div>

        {/* ── Detail panel ── */}
        <div className="flex-1 mt-6 md:mt-0">
          {showNewWorkout && !selectedWorkout && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                  New Workout
                </h2>
                <button
                  onClick={() => setShowNewWorkout(false)}
                  className="text-zinc-500 hover:text-white text-xs transition-colors"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                placeholder="Workout name"
                value={newWorkout.name}
                onChange={(e) =>
                  setNewWorkout({ ...newWorkout, name: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && handleCreateWorkout(e)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-orange-500"
              />
              <input
                type="date"
                value={newWorkout.date}
                onChange={(e) =>
                  setNewWorkout({ ...newWorkout, date: e.target.value })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={handleCreateWorkout}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          )}

          {selectedWorkout ? (
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedWorkout.name}</h2>
                  <p className="text-zinc-500 text-sm mt-1">
                    {selectedWorkout.date}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 mt-1">
                  {templates.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => setShowTemplateMenu(!showTemplateMenu)}
                        className="text-orange-400 hover:text-orange-300 text-xs font-medium transition-colors"
                      >
                        Apply template
                      </button>
                      {showTemplateMenu && (
                        <div className="absolute right-0 top-6 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-10 min-w-40">
                          {templates.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => handleApplyTemplate(t.id)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 first:rounded-t-lg last:rounded-b-lg transition-colors"
                            >
                              {t.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => setWorkoutToDelete(selectedWorkout)}
                    className="text-zinc-600 hover:text-red-400 text-xs transition-colors"
                  >
                    Delete workout
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 mb-8">
                {exercises.length === 0 ? (
                  <p className="text-zinc-600 text-sm">
                    No exercises logged yet.
                  </p>
                ) : (
                  exercises.map((exercise) =>
                    editingExercise?.id === exercise.id ? (
                      <div
                        key={exercise.id}
                        className="bg-zinc-900 border border-orange-500 rounded-xl px-5 py-4"
                      >
                        <p className="font-semibold mb-3">{exercise.exerciseName}</p>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="number"
                            value={editingExercise.sets}
                            onChange={(e) => setEditingExercise({ ...editingExercise, sets: e.target.value })}
                            placeholder="Sets"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                          />
                          <input
                            type="number"
                            value={editingExercise.reps}
                            onChange={(e) => setEditingExercise({ ...editingExercise, reps: e.target.value })}
                            placeholder="Reps"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                          />
                          <input
                            type="number"
                            value={editingExercise.weight}
                            onChange={(e) => setEditingExercise({ ...editingExercise, weight: e.target.value })}
                            placeholder="Weight"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                            autoFocus
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingExercise(null)}
                            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={exercise.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-center justify-between"
                      >
                        <p className="font-semibold">{exercise.exerciseName}</p>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-zinc-400 text-sm">
                              {exercise.sets} × {exercise.reps}{exercise.weight != null ? ` @ ${exercise.weight} lbs` : " — tap to add weight"}
                            </p>
                            {exercise.weight != null && (
                              <p className="text-xs text-zinc-600">
                                est. 1RM: {Math.round(exercise.weight * (1 + exercise.reps / 30))} lbs
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => setEditingExercise({ id: exercise.id, sets: exercise.sets, reps: exercise.reps, weight: exercise.weight ?? "" })}
                            className="text-zinc-500 hover:text-orange-400 text-xs transition-colors p-1"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => setExerciseToDelete(exercise.id)}
                            className="text-zinc-500 hover:text-red-400 text-xs transition-colors p-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                  Log Exercise
                </h3>
                <div className="flex flex-col gap-3">
                  <select
                    value={newExercise.exerciseId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setNewExercise({ ...newExercise, exerciseId: id });
                      setLastSession(null);
                      if (id) {
                        authFetch(`${import.meta.env.VITE_API_URL}/api/workouts/exercises/${id}/last`)
                          .then((res) => res.status === 204 ? null : res.json())
                          .then((data) => setLastSession(data))
                          .catch(() => {});
                      }
                    }}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Select exercise</option>
                    {allExercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                  {lastSession && (
                    <p className="text-xs text-zinc-500">
                      Last session ({lastSession.date}): {lastSession.sets} × {lastSession.reps} @ {lastSession.weight} lbs
                    </p>
                  )}
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="Sets"
                      value={newExercise.sets}
                      onChange={(e) =>
                        setNewExercise({ ...newExercise, sets: e.target.value })
                      }
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                    />
                    <input
                      type="number"
                      placeholder="Reps"
                      value={newExercise.reps}
                      onChange={(e) =>
                        setNewExercise({ ...newExercise, reps: e.target.value })
                      }
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                    />
                    <input
                      type="number"
                      placeholder="Weight"
                      value={newExercise.weight}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          weight: e.target.value,
                        })
                      }
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <button
                    onClick={handleAddExercise}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    Log Exercise
                  </button>
                </div>
              </div>
            </div>
          ) : (
            !showNewWorkout && (
              <div className="flex items-center justify-center h-64">
                <p className="text-zinc-600 text-sm">
                  Select a date to view or log a workout
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Workout delete modal */}
      {workoutToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-2">Delete Workout?</h2>
            <p className="text-zinc-400 text-sm mb-6">
              Are you sure you want to delete{" "}
              <span className="text-white font-medium">
                {workoutToDelete.name}
              </span>
              ? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setWorkoutToDelete(null)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteWorkout}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise delete modal */}
      {exerciseToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-2">Delete Exercise?</h2>
            <p className="text-zinc-400 text-sm mb-6">
              Are you sure you want to remove this exercise? This cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setExerciseToDelete(null)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteExercise}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutList;
