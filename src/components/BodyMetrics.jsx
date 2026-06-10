import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function BodyMetrics({ authFetch }) {
  const [metrics, setMetrics] = useState([]);
  const [weight, setWeight] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [message, setMessage] = useState("");

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    authFetch(`${API}/api/metrics`)
      .then((res) => res.json())
      .then((data) => setMetrics(data))
      .catch(() => {});
  }, []);

  function handleAdd() {
    if (!weight) return;
    const latest = metrics[0];
    const payload = {
      weight: parseFloat(weight),
      heightFeet: heightFeet ? parseInt(heightFeet) : latest?.heightFeet ?? null,
      heightInches: heightInches ? parseInt(heightInches) : latest?.heightInches ?? null,
      recordedAt: date,
    };
    authFetch(`${API}/api/metrics`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((created) => {
        setMetrics([created, ...metrics]);
        setWeight("");
        setHeightFeet("");
        setHeightInches("");
        setMessage("Logged");
        setTimeout(() => setMessage(""), 2000);
      })
      .catch(() => {});
  }

  function handleDelete(id) {
    authFetch(`${API}/api/metrics/${id}`, { method: "DELETE" }).then(() => {
      setMetrics(metrics.filter((m) => m.id !== id));
    });
  }

  const latest = metrics[0];

  // Chart data — oldest to newest
  const chartData = [...metrics]
    .reverse()
    .map((m) => ({ date: m.recordedAt, weight: m.weight }));

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="border-b border-zinc-800 px-4 py-4">
        <h1 className="text-lg font-bold">Body Metrics</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">

        {/* Current stats */}
        {latest && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex justify-around">
            <div className="text-center">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Current Weight</p>
              <p className="text-2xl font-bold text-orange-400">{latest.weight} <span className="text-sm text-zinc-400">lbs</span></p>
            </div>
            {latest.heightFeet != null && (
              <div className="text-center">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Height</p>
                <p className="text-2xl font-bold">{latest.heightFeet}<span className="text-sm text-zinc-400">'</span>{latest.heightInches ?? 0}<span className="text-sm text-zinc-400">"</span></p>
              </div>
            )}
          </div>
        )}

        {/* Log weight */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Log Weight
          </h2>
          {message && <p className="text-orange-400 text-sm mb-3">{message}</p>}
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Weight (lbs)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={`Height ft${latest?.heightFeet != null ? ` (${latest.heightFeet})` : ""}`}
                value={heightFeet}
                onChange={(e) => setHeightFeet(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
              />
              <input
                type="number"
                placeholder={`in${latest?.heightInches != null ? ` (${latest.heightInches})` : ""}`}
                value={heightInches}
                onChange={(e) => setHeightInches(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
            <p className="text-xs text-zinc-600">Height is optional — leave blank to keep last entry.</p>
            <button
              onClick={handleAdd}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              Log
            </button>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 1 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              Weight Over Time
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 11 }} />
                <YAxis
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
                  labelStyle={{ color: "#a1a1aa" }}
                  itemStyle={{ color: "#f97316" }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: "#f97316", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* History */}
        {metrics.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              History
            </h2>
            <div className="flex flex-col gap-2">
              {metrics.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{m.weight} lbs</p>
                    <p className="text-xs text-zinc-500">{m.recordedAt}</p>
                  </div>
                  {m.heightFeet != null && (
                    <p className="text-sm text-zinc-400">
                      {m.heightFeet}'{m.heightInches ?? 0}"
                    </p>
                  )}
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-zinc-500 hover:text-red-400 text-xs transition-colors ml-4"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BodyMetrics;
