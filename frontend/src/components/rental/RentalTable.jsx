import React, { useState, useEffect, useRef } from "react";
import {
  FiRefreshCw,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiMoreVertical,
  FiEye,
} from "react-icons/fi";

export default function RentalTable({
  rentals,
  loading,
  onRefresh,
  onNewRentalClick,
  setToast,
  onDetailClick,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null);

  const dropdownRef = useRef(null);
  const itemsPerPage = 10;

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statusStyle = {
    OVERDUE: "bg-red-100 text-red-500",
    ACTIVE: "bg-green-100 text-green-600",
    PRE_BOOKED: "bg-blue-100 text-blue-600",
    RETURNED: "bg-gray-100 text-gray-500",
    CANCELLED: "bg-red-100 text-red-600",
  };

  // Search Logic
  const filteredRentals = (rentals || []).filter((r) => {
    return (
      r.customer_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      r.order_code
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(
    filteredRentals.length / itemsPerPage
  );

  const indexOfLastItem =
    currentPage * itemsPerPage;

  const indexOfFirstItem =
    indexOfLastItem - itemsPerPage;

  const currentItems = filteredRentals.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber) =>
    setCurrentPage(pageNumber);

  return (
    <div className="bg-white rounded-xl border border-[#00000014] overflow-visible">

      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row justify-between gap-3 p-4 border-b border-[#00000014]">
        <div className="flex items-center gap-3 w-full md:max-w-md">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              placeholder="Search by customer/member, order ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-[#00000014] pl-10 pr-4 py-2 rounded-lg w-full outline-none text-sm focus:border-yellow-400 transition-all"
            />
          </div>

          <button
            onClick={onRefresh}
            className="p-2 hover:bg-gray-100 rounded-lg transition shrink-0"
            title="Refresh"
          >
            <FiRefreshCw
              className={
                loading
                  ? "animate-spin text-black"
                  : "text-gray-400"
              }
            />
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onNewRentalClick}
            className="bg-yellow-400 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#e5c004] transition shadow-md shadow-yellow-400/20 active:scale-95 cursor-pointer"
          >
            + New Sale / Order
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto min-h-[300px]">
        {loading &&
          (!rentals || rentals.length === 0) ? (
          <div className="p-10 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
            <FiRefreshCw className="animate-spin text-black text-xl" />
            Loading sales & orders...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-400 bg-gray-50/50 border-b border-[#00000014]">
              <tr>

                {/* ORDER ID */}
                <th className="text-left p-4 font-bold text-[10px] uppercase tracking-wider">
                  ORDER ID
                </th>

                {/* CUSTOMER */}
                <th className="text-left p-4 font-bold text-[10px] uppercase tracking-wider">
                  CUSTOMER / MEMBER
                </th>

                {/* PRODUCTS */}
                <th className="text-center p-4 font-bold text-[10px] uppercase tracking-wider">
                  PRODUCTS
                </th>

                {/* SALE AMOUNT */}
                <th className="text-right p-4 font-bold text-[10px] uppercase tracking-wider">
                  SALE AMOUNT
                </th>

                {/* STATUS */}
                <th className="text-left p-4 font-bold text-[10px] uppercase tracking-wider">
                  STATUS
                </th>

                {/* ACTION */}
                <th className="text-right p-4 font-bold text-[10px] uppercase tracking-wider pr-6">
                  ACTION
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-[#00000008]">
              {currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-10 text-center text-gray-400 italic"
                  >
                    No sales or orders found
                  </td>
                </tr>
              ) : (
                currentItems.map((r) => {
                  const itemCount = r.items
                    ? r.items.length
                    : 1;

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50/50 transition"
                    >

                      {/* ORDER ID */}
                      <td
                        className="p-4 font-mono text-[11px] text-black font-bold uppercase cursor-pointer hover:underline"
                        onClick={() =>
                          onDetailClick &&
                          onDetailClick(r)
                        }
                      >
                        {r.order_code}
                      </td>

                      {/* CUSTOMER */}
                      <td className="p-4">
                        <p className="font-bold text-gray-800">
                          {r.customer_name}
                        </p>
                      </td>

                      {/* PRODUCTS */}
                      <td className="p-4 text-center">
                        <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                          {itemCount}
                        </span>
                      </td>

                      {/* SALE AMOUNT */}
                      <td className="p-4 text-right">
                        <p className="font-bold text-gray-800">
                          Rs.{" "}
                          {Number(
                            r.rental_amount || 0
                          ).toLocaleString("en-IN")}
                        </p>
                      </td>

                      {/* STATUS */}
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${statusStyle[r.status] ||
                            "bg-gray-100 text-gray-500"
                            }`}
                        >
                          {r.status?.replace("_", " ")}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="p-4 text-right pr-6 relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            setOpenDropdown(
                              openDropdown === r.id
                                ? null
                                : r.id
                            );
                          }}
                          className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-all"
                        >
                          <FiMoreVertical />
                        </button>

                        {openDropdown === r.id && (
                          <div
                            ref={dropdownRef}
                            className="absolute right-8 top-10 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 text-left py-2 overflow-hidden"
                          >

                            {/* VIEW DETAILS */}
                            <button
                              onClick={() => {
                                setOpenDropdown(null);

                                if (onDetailClick) {
                                  onDetailClick(r);
                                }
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black font-medium transition-colors"
                            >
                              <FiEye className="inline mr-2 mb-0.5" />
                              View Details
                            </button>

                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* FOOTER / PAGINATION */}
      <div className="flex justify-between items-center p-4 border-t border-[#00000014] bg-gray-50/30 mt-auto">

        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {filteredRentals.length === 0
            ? "Showing 0 of 0 rentals"
            : `Showing ${indexOfFirstItem + 1
            } to ${Math.min(
              indexOfLastItem,
              filteredRentals.length
            )} of ${filteredRentals.length
            } rentals`}
        </p>

        <div className="flex gap-1">

          <button
            disabled={currentPage === 1}
            onClick={() =>
              paginate(currentPage - 1)
            }
            className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <FiChevronLeft size={16} />
          </button>

          {[...Array(totalPages)].map(
            (_, i) => (
              <button
                key={i + 1}
                onClick={() =>
                  paginate(i + 1)
                }
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1
                    ? "bg-yellow-400 text-black shadow-sm"
                    : "text-gray-400 hover:bg-white border border-transparent hover:border-gray-200"
                  }`}
              >
                {i + 1}
              </button>
            )
          )}

          <button
            disabled={
              currentPage === totalPages ||
              totalPages === 0
            }
            onClick={() =>
              paginate(currentPage + 1)
            }
            className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <FiChevronRight size={16} />
          </button>

        </div>
      </div>
    </div>
  );
}
