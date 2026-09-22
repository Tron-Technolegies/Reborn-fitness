import React from "react";
import { LuIndianRupee } from "react-icons/lu";
import { FiAlertCircle, FiShoppingBag } from "react-icons/fi";

export default function DashboardStats({ stats: data }) {
  if (!data) return null;

  const stats = [
    {
      title: "Total Revenue",
      value: data.total_revenue.toLocaleString(),
      change: null,
      icon: <LuIndianRupee />,
      color: "text-green-600 bg-green-50",
    },
    {
      title: "Active Orders / Sales",
      value: data.rentals.active_orders,
      extra: data.rentals.overdue_orders > 0 ? `${data.rentals.overdue_orders} pending` : null,
      icon: <FiShoppingBag />,
      color: "text-black bg-yellow-400/20",
    },
    {
      title: "Low Stock Products",
      value: data.accessories?.low_stock_count || 0,
      extra: (data.accessories?.low_stock_count || 0) > 0 ? "Action required" : "Inventory healthy",
      icon: <FiAlertCircle />,
      color: "text-orange-600 bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-xl border border-[#00000010] flex justify-between items-center transition-all hover:shadow-md"
        >
          <div>
            <p className="text-sm text-gray-400 font-medium">{stat.title}</p>
            <h2 className="text-2xl font-black mt-1 text-gray-800">
              {stat.title.includes("Revenue") ? "₹" : ""}{stat.value}
            </h2>

            {stat.change && (
              <p className="text-green-500 text-xs mt-2 font-bold flex items-center gap-1">
                <span>↑</span> {stat.change}
              </p>
            )}

            {stat.extra && (
              <p className={`text-[10px] mt-2 font-black uppercase tracking-wider ${stat.extra.includes("Action") ? "text-red-500" : "text-yellow-600"}`}>
                {stat.extra}
              </p>
            )}
          </div>

          <div className="bg-yellow-400/20 text-black p-3 rounded-lg text-lg border border-yellow-400/30">
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
