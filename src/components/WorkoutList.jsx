import { useState, useEffect } from "react";

function WorkoutList({ token, onLogout }) {
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [allExercises, setAllExercises] = useState([]);
  const [newWorkout, setNewWorkout] = useState({ name: "", date: "" });
  const [newExercise, setNewExercise] = useState({
    exerciseId: "",
    sets: "",
    reps: "",
    weight: "",
  });
  const [showNewWorkout, setShowNewWorkout] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [view, setView] = useState("list");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/workouts`, { headers })
      .then((res) => res.json())
      .then((data) => setWorkouts(data));
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/exercises`, { headers })
      .then((res) => res.json())
      .then((data) => setAllExercises(data));
  }, []);

  function handleWorkoutClick(workout) {
    setSelectedWorkout(workout);
    fetch(
      `${import.meta.env.VITE_API_URL}/api/workouts/${workout.id}/exercises`,
      {
        headers,
      },
    )
      .then((res) => res.json())
      .then((data) => {
        setExercises(data);
        setView("detail");
      });
  }

  function handleCreateWorkout(e) {
    e.preventDefault();
    fetch(`${import.meta.env.VITE_API_URL}/api/workouts`, {
      method: "POST",
      headers,
      body: JSON.stringify(newWorkout),
    })
      .then((res) => res.json())
      .then((created) => {
        setWorkouts([...workouts, created]);
        setNewWorkout({ name: "", date: "" });
        setShowNewWorkout(false);
      });
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleCreateWorkout(e);
  };

  function handleAddExercise(e) {
    e.preventDefault();
    fetch(
      `${import.meta.env.VITE_API_URL}/api/workouts/${selectedWorkout.id}/exercises/${newExercise.exerciseId}`,
      {
        method: "POST",
        headers,
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
        setNewExercise({ exerciseId: "", sets: "", reps: "", weight: "" });
      });
  }

  function handleDeleteClick(e, workout) {
    e.stopPropagation();
    setWorkoutToDelete(workout);
  }

  function confirmDeleteWorkout() {
    fetch(
      `${import.meta.env.VITE_API_URL}/api/workouts/${workoutToDelete.id}`,
      {
        method: "DELETE",
        headers,
      },
    ).then(() => {
      setWorkouts(workouts.filter((w) => w.id !== workoutToDelete.id));
      if (selectedWorkout?.id === workoutToDelete.id) {
        setSelectedWorkout(null);
        setExercises([]);
        setView("list");
      }
      setWorkoutToDelete(null);
    });
  }

  function handleDeleteExerciseClick(exerciseId) {
    setExerciseToDelete(exerciseId);
  }

  function confirmDeleteExercise() {
    fetch(
      `${import.meta.env.VITE_API_URL}/api/workouts/exercises/${exerciseToDelete}`,
      {
        method: "DELETE",
        headers,
      },
    ).then(() => {
      setExercises(exercises.filter((e) => e.id !== exerciseToDelete));
      setExerciseToDelete(null);
    });
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {view === "detail" && (
            <button
              onClick={() => setView("list")}
              className="text-zinc-400 hover:text-white text-sm transition-colors md:hidden"
            >
              ← Back
            </button>
          )}
          <h1 className="text-lg font-bold tracking-tight">
            Starting Strength
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowNewWorkout(!showNewWorkout);
              setView("list");
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            + New
          </button>
          <button
            onClick={onLogout}
            className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Desktop: side by side. Mobile: single view with back button */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:gap-8">
          {/* Workout list — hidden on mobile when detail is showing */}
          <div
            className={`md:w-72 md:shrink-0 ${view === "detail" ? "hidden md:block" : "block"}`}
          >
            {showNewWorkout && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
                <h2 className="flex text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  New Workout
                  <button
                    onClick={() => setShowNewWorkout(false)}
                    className="flex space-x-3 text-zinc-500 hover:text-red text-xs transition-colors ml-6"
                  >
                    ✕
                  </button>
                </h2>
                <input
                  type="text"
                  placeholder="Workout name"
                  value={newWorkout.name}
                  onChange={(e) =>
                    setNewWorkout({ ...newWorkout, name: e.target.value })
                  }
                  onKeyDown={handleKeyDown}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-orange-500"
                />
                <input
                  type="date"
                  value={newWorkout.date}
                  onChange={(e) =>
                    setNewWorkout({ ...newWorkout, date: e.target.value })
                  }
                  onKeyDown={handleKeyDown}
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

            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Workouts
            </h2>
            <div className="flex flex-col gap-2">
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  onClick={() => handleWorkoutClick(workout)}
                  className={`cursor-pointer rounded-xl px-4 py-3 border transition-colors ${
                    selectedWorkout?.id === workout.id
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{workout.name}</p>
                      <p
                        className={`text-xs mt-0.5 ${selectedWorkout?.id === workout.id ? "text-orange-100" : "text-zinc-500"}`}
                      >
                        {workout.date}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteClick(e, workout)}
                      className="text-zinc-500 hover:text-red-400 text-xs transition-colors p-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workout detail — hidden on mobile when list is showing */}
          <div
            className={`flex-1 ${view === "list" ? "hidden md:block" : "block"}`}
          >
            {selectedWorkout ? (
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {selectedWorkout.name}
                </h2>
                <p className="text-zinc-500 text-sm mb-6">
                  {selectedWorkout.date}
                </p>

                <div className="flex flex-col gap-3 mb-8">
                  {exercises.length === 0 ? (
                    <p className="text-zinc-600 text-sm">
                      No exercises logged yet.
                    </p>
                  ) : (
                    exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-center justify-between"
                      >
                        <p className="font-semibold">{exercise.exerciseName}</p>
                        <div className="flex items-center gap-4">
                          <p className="text-zinc-400 text-sm">
                            {exercise.sets} × {exercise.reps} @{" "}
                            {exercise.weight} lbs
                          </p>
                          <button
                            onClick={() =>
                              handleDeleteExerciseClick(exercise.id)
                            }
                            className="text-zinc-500 hover:text-red-400 text-xs transition-colors p-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                    Log Exercise
                  </h3>
                  <div className="flex flex-col gap-3">
                    <select
                      value={newExercise.exerciseId}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          exerciseId: e.target.value,
                        })
                      }
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                    >
                      <option value="">Select exercise</option>
                      {allExercises.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        placeholder="Sets"
                        value={newExercise.sets}
                        onChange={(e) =>
                          setNewExercise({
                            ...newExercise,
                            sets: e.target.value,
                          })
                        }
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                      />
                      <input
                        type="number"
                        placeholder="Reps"
                        value={newExercise.reps}
                        onChange={(e) =>
                          setNewExercise({
                            ...newExercise,
                            reps: e.target.value,
                          })
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
              <div className="hidden md:flex items-center justify-center h-64">
                <p className="text-zinc-600">
                  Select a workout to view details
                </p>
              </div>
            )}
          </div>
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
