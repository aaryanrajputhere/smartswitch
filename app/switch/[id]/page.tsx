"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";

type SwitchType = {
  id: number;
  name: string;
  switchId?: string;
  isOn: boolean;
};

function UsageChart({ seed }: { seed: string }) {
  // deterministic pseudo-random generator from seed
  function rng(s: string) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++)
      h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return function () {
      h += h << 13;
      h ^= h >>> 7;
      h += h << 3;
      h ^= h >>> 17;
      return (h >>> 0) / 4294967295;
    };
  }

  const rand = rng(seed);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  // generate bar heights (0-100)
  const bars = months.map((m, i) =>
    Math.floor(10 + rand() * 90 * (1 + ((i + Number(seed.length)) % 4) / 4))
  );
  // generate a line data (smaller scale)

  const width = 800;
  const height = 180;
  const padding = 36;

  const maxBar = Math.max(...bars);
  const barW = (width - padding * 2) / months.length;

  // map bar values to money for left axis (mock). Choose scale so values look like currency
  const moneyScaleFactor = 600; // multiplier to convert bar units to rupees
  const maxMoney = Math.ceil((maxBar * moneyScaleFactor) / 1000) * 1000; // round to nearest 1000
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  return (
    <div className="overflow-auto">
      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.9" />
            <stop offset="100%" stopColor="white" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* grid lines and left-side currency labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = padding + t * (height - padding * 2);
          const val = Math.round((1 - t) * maxMoney);
          return (
            <g key={i}>
              <line
                x1={padding + 5}
                x2={width - padding}
                y1={y}
                y2={y}
                stroke="#e6e6e6"
                strokeWidth={1}
              />
              <text
                x={padding + 3}
                y={y + 4}
                fontSize={11}
                fill="#666"
                textAnchor="end"
              >
                {formatter.format(val)}
              </text>
            </g>
          );
        })}

        {/* bars */}
        {bars.map((b, i) => {
          const x = padding + i * barW + barW * 0.1;
          const h = (b / maxBar) * (height - padding * 2);
          const y = height - padding - h;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barW * 0.8}
              height={h}
              fill="url(#g)"
            />
          );
        })}

        {/* months labels */}
        {months.map((m, i) => {
          const x = padding + i * barW + barW / 2;
          return (
            <text
              key={i}
              x={x}
              y={height - 8}
              fontSize={10}
              fill="#666"
              textAnchor="middle"
            >
              {m + " 2025"}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export default function SwitchDetailPage() {
  const params = useParams();
  const idParam = params?.id as string | undefined;
  const router = useRouter();
  const [sw, setSw] = React.useState<SwitchType | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/switch");
        if (!res.ok) {
          setError(`Failed to load switch: ${res.status}`);
          return;
        }
        const data = await res.json();
        const list: SwitchType[] = data.switches || [];
        const found = list.find(
          (s) =>
            String(s.id) === String(idParam) ||
            String(s.switchId) === String(idParam)
        );
        if (!found) {
          setError("Switch not found");
        } else {
          if (mounted) setSw(found);
        }
      } catch (err: any) {
        setError(String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [idParam]);

  // Mock frontend-only stats
  function makeStats(s: SwitchType | null) {
    if (!s) return null;
    // deterministic RNG from id
    function rngFromId(n: number) {
      let x = n % 2147483647;
      return function () {
        x = (x * 16807) % 2147483647;
        return (x - 1) / 2147483646;
      };
    }

    const rand = rngFromId(s.id);

    // Hours on in last month (0 - 720)
    const hoursOn = Math.min(
      720,
      Math.max(0, Math.round(((s.id * 37) % 200) + Math.round(rand() * 120)))
    );

    // average power when on in kW (mock, e.g. 0.06 kW = 60W)
    const avgKW = 0.06;
    const powerConsumed = +(hoursOn * avgKW).toFixed(2); // kWh

    // price per kWh in INR (mock)
    const rate = 12; // ₹12 per kWh
    const price = Math.round(powerConsumed * rate);

    const lastActive = new Date(
      Date.now() - (s.id % 5) * 3600 * 1000
    ).toLocaleString();

    return { hoursOn, powerConsumed, price, lastActive };
  }

  const stats = makeStats(sw);

  function goBack() {
    try {
      router.back();
    } catch {
      history.back();
    }
  }

  return (
    <main className="p-6">
      <button onClick={goBack} className="mb-4 text-sm underline">
        Back
      </button>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : sw ? (
        <div>
          <h1 className="text-2xl font-bold mb-2">{sw.name}</h1>
          <div className="text-sm text-gray-500 mb-4">
            ID: {sw.switchId ?? `#${sw.id}`}
          </div>

          <div className="mb-6">
            <div className="p-4 bg-white dark:bg-gray-800 border rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div
                    className={`font-semibold ${
                      sw.isOn ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {sw.isOn ? "On" : "Off"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Last active</div>
                  <div className="font-medium">{stats?.lastActive}</div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-2">Stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 border rounded-md">
              <div className="text-sm text-gray-500">Hours On (last month)</div>
              <div className="text-2xl font-bold">{stats?.hoursOn ?? "-"}</div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border rounded-md">
              <div className="text-sm text-gray-500">Power Consumed (kWh)</div>
              <div className="text-2xl font-bold">
                {stats?.powerConsumed ?? "-"}
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border rounded-md">
              <div className="text-sm text-gray-500">Price (INR)</div>
              <div className="text-2xl font-bold">
                {stats?.price ? `₹${stats.price}` : "-"}
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold mt-6 mb-2">Usage (mock)</h2>
          <div className="p-4 bg-white dark:bg-gray-800 border rounded-md">
            <UsageChart seed={String(sw?.id ?? idParam ?? "0")} />
          </div>
        </div>
      ) : null}
    </main>
  );
}
