import React, { useEffect, useState } from "react";
import { FiX, FiCheckCircle, FiTag, FiDownload } from "react-icons/fi";
import InvoiceModal from "../common/InvoiceModal";
import { getInventoryItems } from "../../api/inventoryApi";
import { createRental, getUnitByBarcode } from "../../api/rentalApi";
import { validateCoupon } from "../../api/couponApi";

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
  const [payments, setPayments] = useState([{ amount: "", method: "CASH", reference: "" }]);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanning, setScanning] = useState(false);

  const handleBarcodeScan = async (e) => {
    if (e) e.preventDefault();
    if (!barcodeInput.trim()) return;
    setScanning(true);
    try {
      const res = await getUnitByBarcode(barcodeInput.trim());
      const data = res.data;

      if (data.unit.status !== "available") {
        alert("This unit is currently " + data.unit.status);
        setScanning(false);
        return;
      }

      setCart((prevCart) => {
        if (prevCart.find((c) => c.unit?.id === data.unit.id)) {
          alert("This item has already been added.");
          return prevCart;
        }
        setForm((prev) => ({
          ...prev,
          rental_amount: (Number(prev.rental_amount) || 0) + Number(data.product.rental_price),
        }));
        return [...prevCart, { product: data.product, unit: data.unit, quantity: 1 }];
      });

      setBarcodeInput("");
    } catch (err) {
      alert(err.response?.data?.error || "Barcode not found");
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    const loadItems = async () => {
      try {
        const invRes = await getInventoryItems();
        setItems(invRes.data);
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };
    loadItems();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "item_id") {
      const item = items.find((i) => i.id === Number(value));
      setSelectedItem(item);
      setQuantity(1);
    }
  };

  const handleAddProduct = () => {
    if (!form.item_id) {
      alert("Please select a product.");
      return;
    }
    const prod = items.find((i) => i.id === Number(form.item_id));
    if (!prod) return;

    const qty = Math.max(1, parseInt(quantity) || 1);

    // Stock validation
    const existingInCart = cart.find((c) => c.product.id === prod.id && !c.unit);
    const currentCartQty = existingInCart ? existingInCart.quantity : 0;
    const totalRequestedQty = currentCartQty + qty;

    if (
      prod.available_stock !== undefined &&
      prod.available_stock !== null &&
      prod.available_stock < totalRequestedQty
    ) {
      alert(
        `Only ${prod.available_stock} item(s) available in stock. Currently in cart: ${currentCartQty}`
      );
      return;
    }

    const priceDelta = Number(prod.rental_price) * qty;

    if (existingInCart) {
      setCart(
        cart.map((c) =>
          c === existingInCart ? { ...c, quantity: c.quantity + qty } : c
        )
      );
    } else {
      setCart([...cart, { product: prod, quantity: qty }]);
    }

    setForm((prev) => ({
      ...prev,
      rental_amount: (Number(prev.rental_amount) || 0) + priceDelta,
      item_id: "",
    }));
    setSelectedItem(null);
    setQuantity(1);
  };

  const handleRemoveFromCart = (idx) => {
    const itemToRemove = cart[idx];
    const qty = itemToRemove.quantity || 1;
    const priceDeduction = Number(itemToRemove.product.rental_price) * qty;
    setCart(cart.filter((_, i) => i !== idx));
    setForm((prev) => ({
      ...prev,
      rental_amount: Math.max(0, (Number(prev.rental_amount) || 0) - priceDeduction),
    }));
  };

  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setValidatingCoupon(true);
    setCouponError("");
    try {
      const res = await validateCoupon(couponCode, form.rental_amount);
      if (res.data.valid) {
        setCouponData(res.data);
      } else {
        setCouponError(res.data.message);
        setCouponData(null);
      }
    } catch (err) {
      setCouponError("Invalid coupon code");
      setCouponData(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const [successData, setSuccessData] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Please add at least one product to the sale.");
      return;
    }

    setSaving(true);
    try {
      const expandedItems = [];
      cart.forEach((c) => {
        const qty = c.quantity || 1;
        for (let i = 0; i < qty; i++) {
          expandedItems.push({
            product_id: c.product.id,
            unit_id: c.unit ? c.unit.id : undefined,
          });
        }
      });

      const todayStr = new Date().toISOString().split("T")[0];
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        rental_date: todayStr,
        return_date: todayStr,
        rental_amount: Number(form.rental_amount),
        security_deposit: 0,
        items: expandedItems,
        payments: payments.filter((p) => Number(p.amount) > 0),
        coupon_id: couponData?.coupon_id,
      };

      const res = await createRental(payload);

      setSuccessData({
        ...payload,
        id: res.data.order_id,
        customer_name: form.name,
        customer_phone: form.phone,
        item_name: cart[0].product.name + (cart.length > 1 ? ` (+${cart.length - 1} more)` : ""),
        item_code: cart[0].unit?.unit_id || cart[0].product.code,
        discount: couponData?.discount_amount || 0,
      });

      onSave(); // Refresh table
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create order");
    } finally {
      setSaving(false);
    }
  };

  if (successData) {
    return (
      <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-10 text-center space-y-6 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle size={40} className="text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Sale Recorded!</h2>
            <p className="text-gray-400 font-medium mt-1">
              Order #ORD-{successData.id.toString().padStart(4, "0")} has been recorded.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowInvoice(true)}
              className="w-full py-4 bg-yellow-400 text-black rounded-2xl font-black shadow-md shadow-yellow-400/20 hover:bg-[#e5c004] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs cursor-pointer"
            >
              <FiDownload /> Download Invoice
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
            onClose={() => setShowInvoice(false)}
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
        <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100 bg-gray-50/30">
          <div>
            <h2 className="text-xl font-bold text-gray-800">New Product Sale / Order</h2>
            <p className="text-xs text-gray-400 mt-0.5">Record an in-house product sale and track payment</p>
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
                <label className="text-xs font-medium text-gray-500 ml-1">Full Name</label>
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
                <label className="text-xs font-medium text-gray-500 ml-1">Phone Number</label>
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-black uppercase tracking-widest">
                PRODUCT DETAILS
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Scan Barcode here..."
                  className="border border-gray-200 rounded-lg px-3 py-1 text-sm outline-none focus:border-yellow-400 w-48 font-mono"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleBarcodeScan();
                    }
                  }}
                  disabled={scanning}
                />
                <button
                  type="button"
                  onClick={() => handleBarcodeScan()}
                  disabled={scanning || !barcodeInput}
                  className="bg-gray-800 text-white px-3 py-1 rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  {scanning ? "..." : "Scan"}
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-gray-500 ml-1">Select Product</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-yellow-400 outline-none text-sm bg-white"
                    value={form.item_id}
                    onChange={handleChange}
                    name="item_id"
                  >
                    <option value="">Choose a product...</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.code}) - Rs. {item.rental_price}
                        {item.available_stock !== undefined ? ` [Stock: ${item.available_stock}]` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 ml-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-yellow-400 outline-none text-sm bg-white"
                    placeholder="1"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-lg text-xs font-bold hover:bg-[#e5c004] transition shadow-sm cursor-pointer"
                >
                  + Add Product
                </button>
              </div>
            </div>

            {cart.length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="text-xs font-bold text-gray-700">
                  Selected Products ({cart.length})
                </h4>
                {cart.map((cItem, idx) => {
                  const qty = cItem.quantity || 1;
                  const itemTotal = Number(cItem.product.rental_price) * qty;
                  return (
                    <div
                      key={idx}
                      className="p-4 border border-gray-200 rounded-xl bg-white flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {cItem.product.name}{" "}
                          <span className="text-xs font-normal text-gray-500">
                            ({cItem.product.code})
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: <span className="font-semibold text-gray-700">{qty}</span> × Rs.{" "}
                          {cItem.product.rental_price}
                          {cItem.unit && (
                            <span className="ml-2 text-gray-400 font-mono">
                              ({cItem.unit.unit_id})
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">Rs. {itemTotal.toLocaleString()}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(idx)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <FiX />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* OFFERS & COUPONS SECTION */}
          <section className="pt-4 border-t border-gray-50">
            <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4">
              Offers & Coupons
            </h3>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 outline-none text-sm font-mono font-bold"
                  placeholder="ENTER COUPON CODE"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={validatingCoupon || !couponCode}
                className="px-6 py-2 bg-gray-800 text-white rounded-xl font-bold text-sm hover:bg-black transition disabled:opacity-50 cursor-pointer"
              >
                {validatingCoupon ? "..." : "Apply"}
              </button>
            </div>
            {couponError && (
              <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{couponError}</p>
            )}
            {couponData && (
              <p className="text-[10px] text-green-600 font-bold mt-1 ml-1 flex items-center gap-1">
                <FiCheckCircle /> Coupon Applied: ₹{couponData.discount_amount} off
              </p>
            )}
          </section>

          {/* PRICING & PAYMENT SECTION */}
          <section className="pt-4 border-t border-gray-50">
            <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4">
              Pricing
            </h3>
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 ml-1">
                  Sale Amount (Rs.)
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-400 outline-none text-sm font-semibold text-gray-700"
                  name="rental_amount"
                  type="number"
                  value={form.rental_amount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-gray-500 ml-1">Payment Details</label>
                <button
                  type="button"
                  onClick={() =>
                    setPayments([...payments, { amount: "", method: "CASH", reference: "" }])
                  }
                  className="text-[10px] uppercase font-black text-black bg-yellow-400 px-2 py-1 rounded-lg hover:bg-yellow-400/30 cursor-pointer"
                >
                  + Add Payment
                </button>
              </div>
              {payments.map((p, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={p.amount}
                      onChange={(e) => {
                        const newP = [...payments];
                        newP[idx].amount = e.target.value;
                        setPayments(newP);
                      }}
                      placeholder="Amount"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-yellow-400 outline-none text-sm font-semibold"
                    />
                  </div>
                  <div className="flex-1">
                    <select
                      value={p.method}
                      onChange={(e) => {
                        const newP = [...payments];
                        newP[idx].method = e.target.value;
                        setPayments(newP);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-yellow-400 outline-none text-sm bg-white"
                    >
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI / GPay</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                    </select>
                  </div>
                  <div className="flex-[1.5]">
                    <input
                      type="text"
                      value={p.reference}
                      onChange={(e) => {
                        const newP = [...payments];
                        newP[idx].reference = e.target.value;
                        setPayments(newP);
                      }}
                      placeholder="Ref # (Optional)"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-yellow-400 outline-none text-sm"
                    />
                  </div>
                  {payments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setPayments(payments.filter((_, i) => i !== idx))}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors mt-0.5 cursor-pointer"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* SUMMARY SECTION */}
            <div className="mt-6 space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal:</span>
                <span>Rs. {Number(form.rental_amount || 0).toLocaleString()}</span>
              </div>
              {couponData && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Discount:</span>
                  <span>- Rs. {couponData.discount_amount}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                <span className="text-gray-800 font-bold">Total Payable:</span>
                <span className="text-xl font-black text-black">
                  Rs.{" "}
                  {Math.max(
                    0,
                    (Number(form.rental_amount) || 0) - (couponData?.discount_amount || 0)
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Amount Paid:</span>
                <span>Rs. {totalPaid.toLocaleString()}</span>
              </div>
              <div className="pt-1 flex justify-between items-center font-bold text-gray-800">
                <span className="text-sm">Balance Due:</span>
                <span>
                  Rs.{" "}
                  {Math.max(
                    0,
                    (Number(form.rental_amount) || 0) -
                      (couponData?.discount_amount || 0) -
                      totalPaid
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/30 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-white hover:shadow-sm transition-all text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-10 py-2.5 bg-yellow-400 text-black rounded-xl font-bold shadow-md shadow-yellow-400/20 hover:bg-[#e5c004] active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all text-sm cursor-pointer"
          >
            {saving ? "Completing..." : "Complete Sale"}
          </button>
        </div>
      </form>
    </div>
  );
}
