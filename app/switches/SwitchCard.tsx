"use client";

import React from "react";
import { useRouter } from "next/navigation";

type SwitchCardProps = {
  id: number | string;
  name: string;
  isOn: boolean;
  onToggle?: (id: number | string, next: boolean) => void;
};

export default function SwitchCard({
  id,
  name,
  isOn,
  onToggle,
}: SwitchCardProps) {
  const [on, setOn] = React.useState(Boolean(isOn));
  const router = useRouter();

  React.useEffect(() => {
    setOn(Boolean(isOn));
  }, [isOn]);

  async function handleToggle(e: React.MouseEvent) {
    // Prevent the card click handler from firing when the toggle button is pressed
    e.stopPropagation();
    const next = !on;
    setOn(next);
    if (onToggle) onToggle(id, next);
  }

  function goToDetail() {
    router.push(`/switch/${id}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goToDetail();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={handleKeyDown}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm flex flex-col items-center cursor-pointer"
      aria-label={`Open details for ${name}`}
    >
      <h3 className="text-lg font-medium mb-3">{name}</h3>

      <button
        onClick={handleToggle}
        className={`px-4 py-2 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          on ? "bg-green-500 text-white" : "bg-gray-200 text-gray-800"
        }`}
        aria-pressed={on}
        aria-label={`${name} toggle`}
      >
        {on ? "On" : "Off"}
      </button>

      <div className="mt-3 text-sm text-gray-500">
        {on ? "Power supplied" : "Powered off"}
      </div>
    </div>
  );
}
