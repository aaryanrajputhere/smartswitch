"use client";

import React from "react";
import SwitchCard from "./SwitchCard";

type SwitchType = {
  id: number;
  name: string;
  isOn: boolean;
};

export default function Page() {
  const [switches, setSwitches] = React.useState<SwitchType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/switch");
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error("Failed to fetch switches:", res.status, text);
          if (mounted) setError(`Failed to load switches: ${res.status}`);
          return;
        }
        let data: any = null;
        try {
          data = await res.json();
        } catch (err) {
          console.error("Failed to parse JSON from /api/switch:", err);
          if (mounted) setError("Invalid response from server");
          return;
        }
        if (mounted) setSwitches(data.switches || []);
      } catch (err) {
        console.error("Network error fetching switches:", err);
        if (mounted) setError(String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function createSwitch() {
    const res = await fetch("/api/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, switchId: newSwitchId }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("createSwitch failed:", res.status, text);
      return;
    }

    let sw = null;
    try {
      sw = await res.json();
    } catch (err) {
      console.error("Failed to parse JSON from createSwitch response", err);
      return;
    }

    setSwitches((s) => [sw, ...s]);
    setNewName("");
    setNewSwitchId("");
    setShowModal(false);
  }

  const [newName, setNewName] = React.useState("");
  const [newSwitchId, setNewSwitchId] = React.useState("");
  const [showModal, setShowModal] = React.useState(false);

  async function toggleSwitch(id: number | string, next: boolean) {
    // Update your local API (database)
    await fetch("/api/switch", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isOn: next }),
    });

    // Then call the remote bulb control API
    await fetch("/api/bulb1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "SW01",
        state: next ? "ON" : "OFF",
      }),
    });

    // Finally update UI state
    setSwitches((s) => s.map((x) => (x.id === id ? { ...x, isOn: next } : x)));
  }

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Smart Switches</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-2 bg-blue-600 text-white rounded-md"
          >
            Add Switch
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-md w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Create Switch</h2>

            <label className="block mb-2 text-sm">Name (optional)</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Human-friendly name"
              className="w-full px-3 py-2 border rounded-md mb-3"
            />

            <label className="block mb-2 text-sm">Switch ID</label>
            <input
              value={newSwitchId}
              onChange={(e) => setNewSwitchId(e.target.value)}
              placeholder="e.g. SWABC123"
              className="w-full px-3 py-2 border rounded-md mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-2 rounded-md border"
              >
                Cancel
              </button>
              <button
                onClick={createSwitch}
                className="px-3 py-2 bg-blue-600 text-white rounded-md"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {switches.map((s) => (
            <SwitchCard
              key={s.id}
              id={s.id}
              name={s.name}
              isOn={s.isOn}
              onToggle={toggleSwitch}
            />
          ))}
        </div>
      )}
    </main>
  );
}
