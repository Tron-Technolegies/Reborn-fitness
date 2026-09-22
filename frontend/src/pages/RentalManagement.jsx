import React, { useState, useEffect } from "react";
import RentalTable from "../components/rental/RentalTable";
import NewRentalModal from "../components/rental/NewRentalModal";
import AlterationModal from "../components/rental/AlterationModal";
import RentalDetailModal from "../components/rental/RentalDetailModal";
import { getRentals } from "../api/rentalApi";
import Toast from "../components/common/Toast";

export default function RentalManagement() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alterationModalOrder, setAlterationModalOrder] = useState(null);
  const [detailModalOrder, setDetailModalOrder] = useState(null);
  const [toast, setToast] = useState(null);

  const loadRentals = async () => {
    setLoading(true);

    try {
      const response = await getRentals();
      setRentals(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRentals();
  }, []);

  const handleNewRentalSaved = () => {
    loadRentals();
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#00000014]">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Sales & Orders Dashboard
          </h1>

          <p className="text-sm text-gray-400">
            Track sales and customer orders
          </p>
        </div>
      </div>

      <div className="w-full">
        <RentalTable
          rentals={rentals}
          loading={loading}
          onRefresh={loadRentals}
          onNewRentalClick={() => setIsModalOpen(true)}
          setToast={setToast}
          onDetailClick={(order) => setDetailModalOrder(order)}
          onAlterationClick={(order) =>
            setAlterationModalOrder(order)
          }
        />
      </div>

      {isModalOpen && (
        <NewRentalModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleNewRentalSaved}
        />
      )}

      {detailModalOrder && (
        <RentalDetailModal
          order={detailModalOrder}
          onClose={() => setDetailModalOrder(null)}
          onRefresh={loadRentals}
          onAlterationClick={(order) =>
            setAlterationModalOrder(order)
          }
        />
      )}

      {alterationModalOrder && (
        <AlterationModal
          order={alterationModalOrder}
          onClose={() => {
            setAlterationModalOrder(null);
            loadRentals();
          }}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
