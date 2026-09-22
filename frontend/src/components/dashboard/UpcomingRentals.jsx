import React from "react";
import { FiCalendar, FiMessageCircle } from "react-icons/fi";

export default function UpcomingRentals({ rentals = [] }) {
  const handleRemind = (item) => {
    const message = `Hello ${item.customer}, your order for ${item.item} is ready for pickup at Reborn Fitness. Thank you!`;
    const whatsappUrl = `https://wa.me/${item.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-[#00000014] shadow-sm">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-gray-800 tracking-tight">Upcoming Pickups</h3>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Top 5 Pending Pickups</p>
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
        {rentals.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-gray-400 italic">No upcoming pickups.</p>
          </div>
        ) : (
          rentals.map((item, i) => (
            <div key={i} className="group p-3 rounded-xl border border-gray-100 hover:border-yellow-400/50 hover:bg-yellow-400/10 transition-all duration-300">
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-yellow-400/20 text-black">
                    <FiCalendar size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{item.customer}</p>
                    <p className="text-[10px] text-gray-500 font-medium">
                      {item.item} • <span className="text-black font-bold">Date: {new Date(item.rental_date).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemind(item)}
                  className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1"
                  title="Notify via WhatsApp"
                >
                  <FiMessageCircle size={16} />
                  <span className="text-[9px] font-bold uppercase hidden group-hover:block">Notify</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
