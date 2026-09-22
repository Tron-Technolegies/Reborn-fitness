import React from "react";
import {
  FiX,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiShoppingBag,
} from "react-icons/fi";

export default function RentalDetailModal({
  order,
  onClose,
}) {
  if (!order) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "PRE_BOOKED":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ACTIVE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "RETURNED":
        return "bg-green-100 text-green-800 border-green-200";
      case "OVERDUE":
        return "bg-red-100 text-red-800 border-red-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const statusColor = getStatusColor(order.status);

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl max-h-[90%] shadow-2xl overflow-hidden overflow-y-auto border border-gray-100 my-8">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              Order{" "}
              {order.order_code ||
                `ORD-${order.id
                  ?.toString()
                  .padStart(4, "0")}`}

              <span
                className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border ${statusColor}`}
              >
                {order.status?.replace("_", " ")}
              </span>
            </h2>

            <p className="text-xs text-gray-500 mt-1 font-medium">
              Sale Order
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-100"
          >
            <FiX className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* CUSTOMER INFO */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FiUser />
              Customer / Member
            </h3>

            <div className="bg-white p-4 rounded-xl border border-yellow-400 shadow-sm">
              <p className="font-bold text-gray-800 text-lg">
                Name: {order.customer_name || "-"}
              </p>

              <p className="text-sm text-gray-600 mt-1">
                Phone: {order.customer_phone || "-"}
              </p>

              {order.customer_email && (
                <p className="text-sm text-gray-600 mt-1">
                  Email: {order.customer_email}
                </p>
              )}
            </div>
          </div>

          {/* SALE DATE */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FiCalendar />
              Sale Date
            </h3>

            <div className="bg-white  p-4 rounded-xl border border-yellow-400 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase">
                Order Date
              </p>

              <p className="font-bold text-gray-800 text-sm mt-1">
                {order.booking_date ||
                  order.created_at ||
                  order.rental_date ||
                  "-"}
              </p>
            </div>
          </div>

          {/* PRODUCTS */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FiShoppingBag />
              Products Sold
            </h3>

            <div className="bg-white rounded-xl border border-yellow-400 shadow-sm overflow-hidden">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 border-b border-gray-50 last:border-0 flex justify-between items-center hover:bg-gray-50/50 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-gray-800">
                        {item.product_name || "-"}
                      </p>

                      <p className="text-xs text-gray-500 mt-0.5 font-medium tracking-tight">
                        Code: {item.product_code || "-"}
                      </p>
                    </div>

                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      Qty: {item.quantity || 1}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-gray-400">
                  No products found.
                </div>
              )}
            </div>
          </div>

          {/* SALE AMOUNT */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FiDollarSign />
              Sale Amount
            </h3>

            <div className="bg-white p-5 rounded-xl border border-yellow-400 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    Total Sale Amount
                  </p>

                  <p className="font-black text-gray-800 text-2xl mt-1">
                    ₹
                    {Number(
                      order.rental_amount || 0
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="bg-green-50 text-green-600 px-3 py-2 rounded-lg text-xs font-bold">
                  {order.status?.replace("_", " ") || "SALE"}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
