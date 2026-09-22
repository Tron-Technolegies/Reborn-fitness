import React, { useState } from "react";
import { FiShoppingBag, FiBox } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import NewRentalModal from "../rental/NewRentalModal";

export default function QuickActions() {
  const [rentalOpen, setRentalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className="bg-white p-5 rounded-xl border border-[#00000014]">
        <h3 className="text-sm text-gray-400 mb-3 font-semibold">QUICK ACTIONS</h3>

        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => setRentalOpen(true)}
            className="border border-[#00000014] rounded-lg p-4 flex flex-col items-center gap-2 hover:bg-yellow-400/15 hover:border-yellow-400 cursor-pointer transition"
          >
            <FiShoppingBag className="text-black text-lg" />
            <p className="text-sm font-medium">New Sale</p>
          </div>

          <div
            onClick={() => navigate("/inventory")}
            className="border border-[#00000014] rounded-lg p-4 flex flex-col items-center gap-2 hover:bg-yellow-400/15 hover:border-yellow-400 cursor-pointer transition"
          >
            <FiBox className="text-black text-lg" />
            <p className="text-sm font-medium">Add Stock</p>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {rentalOpen && (
        <NewRentalModal
          onClose={() => setRentalOpen(false)}
          onSave={() => {
            setRentalOpen(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
