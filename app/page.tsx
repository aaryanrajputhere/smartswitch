"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-8 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
          Smart Switch Control
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Manage and control your smart switches from anywhere. Monitor usage,
          toggle devices, and track power consumption in real-time.
        </p>
        <Link
          href="/switches"
          className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
        >
          Go to Smart Switches
        </Link>
      </div>
    </div>
  );
}
