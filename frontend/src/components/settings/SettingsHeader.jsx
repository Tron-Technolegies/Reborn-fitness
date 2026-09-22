import React from "react";

export default function SettingsHeader() {
  return (
    <div className="flex justify-between items-center mb-6 pt-4">
      <div>
        <h1 className="text-lg font-semibold">Simple settings for daily operations</h1>
        <p className="text-sm text-gray-400">
          Keep only the most important sections so staff can review store details easily.
        </p>
      </div>

      <div className="flex gap-3">
        <button className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm">


          <p className="text-black-500">Discard Changes</p>
        </button>
        <button className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm">
          Save Settings
        </button>
      </div>
    </div>
  );
}
