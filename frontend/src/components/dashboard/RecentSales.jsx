import React, { useEffect, useState } from "react";
import { FiShoppingBag, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { getRentals } from "../../api/rentalApi";

export default function RecentSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSales = async () => {
      setLoading(true);
      try {
        const res = await getRentals();
        setSales((res.data || []).slice(0, 5));
      } catch (err) {
        console.error("Failed to load recent sales", err);
      } finally {
        setLoading(false);
      }
    };
    loadSales();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const today = new Date().toISOString().split("T")[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split("T")[0];

    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return "Yesterday";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-[#00000014] shadow-sm">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-gray-800 tracking-tight">Recent Sales</h3>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Latest Product Sales</p>
        </div>
        <Link
          to="/rental"
          className="text-xs font-bold text-black hover:text-yellow-600 transition flex items-center gap-1 cursor-pointer"
        >
          View All <FiArrowRight size={12} />
        </Link>
      </div>

      {/* LIST */}
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
        {loading ? (
          <div className="py-8 text-center text-xs text-gray-400">Loading recent sales...</div>
        ) : sales.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-gray-400 italic">No recent sales.</p>
          </div>
        ) : (
          sales.map((item, i) => (
            <div
              key={i}
              className="group p-3 rounded-xl border border-gray-100 hover:border-yellow-400/50 hover:bg-yellow-400/10 transition-all duration-300"
            >
              <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <div className="p-2 rounded-lg bg-yellow-400/20 text-black">
                    <FiShoppingBag size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      {item.item_name || (item.items && item.items[0]?.product_name) || "Product Sale"}
                    </p>
                    <p className="text-[11px] text-gray-500 font-medium">{item.customer_name || "Member"}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black text-black">₹{Number(item.rental_amount || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">{formatDate(item.rental_date)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
