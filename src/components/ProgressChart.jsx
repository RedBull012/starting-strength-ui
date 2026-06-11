import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function ProgressChart({ allExercises, authFetch, onLogout }) {
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    if (!selectedExerciseId) return;
    authFetch(
      `${import.meta.env.VITE_API_URL}/api/workouts/exercises/${selectedExerciseId}/progress`,
    )
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => new Date(a.date) - new Date(b.date),
        );
        setProgressData(sorted);
      })
      .catch(() => {});
  }, [selectedExerciseId]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-x-hidden">
      <div className="pointer-events-none fixed top-0 right-0 w-96 h-96 rounded-full" style={{background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)", transform: "translate(30%, -30%)"}} />
      <div className="pointer-events-none fixed bottom-0 left-0 w-72 h-72 rounded-full" style={{background: "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)", transform: "translate(-30%, 30%)"}} />
      <div className="border-b border-zinc-800 px-4 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Progress</h1>
        <button
          onClick={onLogout}
          className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 mb-6"
          >
            <option value="">Select exercise</option>
            {allExercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>

          {progressData.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-zinc-600 text-sm">
                Select an exercise to see progress
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 12 }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 12 }} unit="lb" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#a1a1aa" }}
                  itemStyle={{ color: "#f97316" }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: "#f97316" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgressChart;
