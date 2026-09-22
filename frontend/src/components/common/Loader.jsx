import React from "react";

export default function Loader() {
  return (
    <div className="flex items-center justify-center p-6">
      <div className="w-8 h-8 border-4 border-black/10 border-t-yellow-400 rounded-full animate-spin"></div>
    </div>
  );
}
