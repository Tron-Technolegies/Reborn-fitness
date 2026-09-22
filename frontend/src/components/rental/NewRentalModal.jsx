import React, { useEffect, useState } from "react";
import {
  FiX,
  FiCheckCircle,
  FiDownload,
} from "react-icons/fi";
import InvoiceModal from "../common/InvoiceModal";
import { getInventoryItems } from "../../api/inventoryApi";
import { createRental } from "../../api/rentalApi";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  item_id: "",
  rental_amount: "",
};

export default function NewRentalModal({ onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [payments] = useState([
    {
      amount: "",
      method: "CASH",
      reference: "",
    },
  ]);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const [successData, setSuccessData] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const invRes = await getInventoryItems();
        setItems(invRes.data);
      } catch (err) {
        console.error(
          "Failed to load initial data",
          err
        );
      }
    };

    loadItems();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "item_id") {
      const item = items.find(
        (i) => i.id === Number(value)
      );

      setSelectedItem(item);
      setQuantity(1);

      if (!item) {
        setCart([]);

        setForm((prev) => ({
          ...prev,
          item_id: "",
          rental_amount: "",
        }));

        return;
      }

      const price =
        Number(item.rental_price) || 0;

      setCart([
        {
          product: item,
          quantity: 1,
        },
      ]);

      setForm((prev) => ({
        ...prev,
        item_id: value,
        rental_amount: price,
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuantityChange = (e) => {
    const qty = Math.max(
      1,
      parseInt(e.target.value) || 1
    );

    if (!selectedItem) {
      return;
    }

    if (
      selectedItem.available_stock !== undefined &&
      selectedItem.available_stock !== null &&
      selectedItem.available_stock < qty
    ) {
      alert(
        `Only ${selectedItem.available_stock} item(s) available in stock.`
      );
      return;
    }

    const price =
      Number(selectedItem.rental_price) || 0;

    const total = price * qty;

    setQuantity(qty);

    setCart([
      {
        product: selectedItem,
        quantity: qty,
      },
    ]);

    setForm((prev) => ({
      ...prev,
      rental_amount: total,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedItem) {
      alert("Please select a product.");
      return;
    }

    if (quantity < 1) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (
      selectedItem.available_stock !== undefined &&
      selectedItem.available_stock !== null &&
      selectedItem.available_stock < quantity
    ) {
      alert(
        `Only ${selectedItem.available_stock} item(s) available in stock.`
      );
      return;
    }

    setSaving(true);

    try {
      const items = [
        {
          product_id: selectedItem.id,
          quantity: quantity,
        },
      ];

      const todayStr = new Date()
        .toISOString()
        .split("T")[0];

      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        rental_date: todayStr,
        return_date: todayStr,
        rental_amount: Number(
          form.rental_amount || 0
        ),
        security_deposit: 0,
        items: items,
        payments: payments.filter(
          (p) => Number(p.amount) > 0
        ),
      };

      const res = await createRental(payload);

      setSuccessData({
        ...payload,
        id: res.data.order_id,
        customer_name: form.name,
        customer_phone: form.phone,
        item_name: selectedItem.name,
        item_code: selectedItem.code,
        discount: 0,
      });

      onSave();
    } catch (err) {
      alert(
        err.response?.data?.error ||
        "Failed to create order"
      );
    } finally {
      setSaving(false);
    }
  };

  if (successData) {
    return (
      <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-10 text-center space-y-6 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle
              size={40}
              className="text-green-500"
            />
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
              Sale Recorded!
            </h2>

            <p className="text-gray-400 font-medium mt-1">
              Order #ORD-
              {successData.id
                .toString()
                .padStart(4, "0")}{" "}
              has been recorded.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              type="button"
              onClick={() =>
                setShowInvoice(true)
              }
              className="w-full py-4 bg-yellow-400 text-black rounded-2xl font-black shadow-md shadow-yellow-400/20 hover:bg-[#e5c004] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs cursor-pointer"
            >
              <FiDownload />
              Download Invoice
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black hover:bg-gray-100 transition-all uppercase tracking-widest text-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

        {showInvoice && (
          <InvoiceModal
            order={successData}
            type="rental"
            onClose={() =>
              setShowInvoice(false)
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100 bg-gray-50/30">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              New Product Sale / Order
            </h2>

            <p className="text-xs text-gray-400 mt-0.5">
              Record an in-house product sale
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all cursor-pointer"
          >
            <FiX className="text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto">
          {/* CUSTOMER / MEMBER DETAILS SECTION */}
          <section>
            <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4">
              MEMBER DETAILS
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 ml-1">
                  Full Name
                </label>

                <input
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 outline-none transition-all text-sm"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 ml-1">
                  Phone Number
                </label>

                <input
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 outline-none transition-all text-sm"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 00000 00000"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-medium text-gray-500 ml-1">
                  Email (Optional)
                </label>

                <input
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 outline-none transition-all text-sm"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </section>

          {/* PRODUCT DETAILS SECTION */}
          <section className="pt-4 border-t border-gray-50">
            <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4">
              PRODUCT DETAILS
            </h3>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* PRODUCT */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-gray-500 ml-1">
                    Select Product
                  </label>

                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-yellow-400 outline-none text-sm bg-white"
                    value={form.item_id}
                    onChange={handleChange}
                    name="item_id"
                    required
                  >
                    <option value="">
                      Choose a product...
                    </option>

                    {items.map((item) => {
                      const stock = Number(item.available_stock || 0);

                      return (
                        <option
                          key={item.id}
                          value={item.id}
                          disabled={stock <= 0}
                        >
                          {item.name} ({item.code}) - Rs.{" "}
                          {item.rental_price}
                          {" "}
                          [Stock: {stock}]
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* QUANTITY */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 ml-1">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="1"
                    max={
                      selectedItem?.available_stock ||
                      undefined
                    }
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-yellow-400 outline-none text-sm bg-white"
                    placeholder="1"
                    disabled={!selectedItem}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* TOTAL AMOUNT */}
          <section className="pt-4 border-t border-gray-50">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 ml-1">
                Total Amount
              </label>

              <input
                type="text"
                value={`Rs. ${Number(
                  form.rental_amount || 0
                ).toLocaleString()}`}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none text-lg font-black text-gray-800"
              />
            </div>
          </section>
        </div>

        {/* ONLY SALE BUTTON */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/30 flex justify-end">
          <button
            type="submit"
            disabled={
              saving ||
              !selectedItem ||
              quantity < 1
            }
            className="px-10 py-3 bg-yellow-400 text-black rounded-xl font-bold shadow-md shadow-yellow-400/20 hover:bg-[#e5c004] active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all text-sm cursor-pointer"
          >
            {saving
              ? "Completing..."
              : "Complete Sale"}
          </button>
        </div>
      </form>
    </div>
  );
}
