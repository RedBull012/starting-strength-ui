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

function ProgressChart({ allExercises, token }) {
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    if (!selectedExerciseId) return;
    fetch(
      `${import.meta.env.VITE_API_URL}/api/workouts/exercises/${selectedExerciseId}/progress`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
      .then((res) => res.json())
      .then((data) => setProgressData(data));
  }, [selectedExerciseId]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Progress</h2>
        <select
          value={selectedExerciseId}
          onChange={(e) => setSelectedExerciseId(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
        >
          <option value="">Select exercise</option>
          {allExercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
      </div>

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
  );
}

export default ProgressChart;
