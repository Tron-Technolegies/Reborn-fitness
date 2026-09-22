import React from "react";
import { Link } from "react-router-dom";

export default function ErrorPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <h1 className="text-6xl font-black text-black">404</h1>

      <h2 className="text-xl font-bold mt-2 text-gray-800">Page Not Found</h2>

      <p className="text-gray-500 mt-2">The page you are looking for doesn’t exist.</p>

      <Link
        to="/dashboard"
        className="mt-6 px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-[#e5c004] shadow-md shadow-yellow-400/20 transition"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
