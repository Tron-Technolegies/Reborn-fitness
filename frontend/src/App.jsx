import React from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Layouts from "./layouts/Layouts";
import ErrorPage from "./pages/ErrorPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import InventoryManagement from "./pages/InventoryManagement";
import RentalManagement from "./pages/RentalManagement";
import StitchingManagement from "./pages/StitchingManagement";
import BillingManagement from "./pages/BillingManagement";
import FinancialManagement from "./pages/FinancialManagement";
import Reports from "./pages/Reports";
import BranchManagement from "./pages/BranchManagement";
import Settings from "./pages/Settings";
import CategoryManagement from "./pages/CategoryManagement";
import Accessories from "./pages/Accessories";
import CouponManagement from "./pages/CouponManagement";

// AUTH
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LockScreen from "./components/auth/LockScreen";

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading)
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center font-sans z-[9999]">
        <div className="w-24 h-24 rounded-full shadow-xl flex items-center justify-center mb-6 overflow-hidden border-4 border-yellow-400">
          <img src="/logo.png" alt="Reborn Fitness" className="w-full h-full object-cover" />
        </div>
        <div className="w-10 h-10 border-4 border-gray-200 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
        <h1 className="text-2xl font-black text-black tracking-tight">Reborn Fitness</h1>
        <p className="text-sm text-gray-500 font-medium mt-2 animate-pulse">
          Starting local server...
        </p>
      </div>
    );

  if (!isAuthenticated) {
    return <LockScreen />;
  }

  const router = createHashRouter([
    {
      path: "/",
      element: <Layouts />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: "dashboard", element: <Dashboard /> },
        { path: "inventory", element: <InventoryManagement /> },
        { path: "categories", element: <CategoryManagement /> },
        { path: "rental", element: <RentalManagement /> },
        { path: "stitching", element: <StitchingManagement /> },
        { path: "accessories", element: <Accessories /> },
        { path: "coupons", element: <CouponManagement /> },
        { path: "billing", element: <BillingManagement /> },
        { path: "financial", element: <FinancialManagement /> },
        { path: "reports", element: <Reports /> },
        { path: "branches", element: <BranchManagement /> },
        { path: "settings", element: <Settings /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
