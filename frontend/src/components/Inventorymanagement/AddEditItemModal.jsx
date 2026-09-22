import React, { useEffect, useState } from "react";
import { FiUploadCloud, FiX } from "react-icons/fi";
import { getServerUrl } from "../../api/backendApi";

const emptyForm = {
  name: "",
  category_id: "",
  description: "",
  rental_price: "",
};

export default function AddEditItemModal({
  categories = [],
  item,
  saving,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(emptyForm);
  const [stockGroups, setStockGroups] = useState([{ qty: 1 }]);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!item) {
      setForm(emptyForm);
      setStockGroups([{ qty: 1 }]);
      setImagePreview("");
      setImageFile(null);
      return;
    }

    setForm({
      name: item.name || "",
      category_id: item.category_id || "",
      description: item.description || "",
      rental_price: item.rental_price || "",
    });

    setImagePreview(item.image_url ? getServerUrl(item.image_url) : "");
    setImageFile(null);
  }, [item]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleStockGroupChange = (index, field, value) => {
    const newGroups = [...stockGroups];
    newGroups[index][field] = value;
    setStockGroups(newGroups);
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSave(
      {
        ...form,
        category_id: Number(form.category_id),
        rental_price: Number(form.rental_price),
        stock_data: stockGroups,
        total_stock: stockGroups.reduce(
          (acc, curr) => acc + Number(curr.qty),
          0
        ),
        image: imageFile,
      },
      imagePreview,
      !!imageFile
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-2xl rounded-2xl border border-[#00000014] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#00000014] bg-gray-50/50">
          <h2 className="font-bold text-gray-800">
            {item ? "Edit Product" : "Add New Product"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                Product Name
              </label>

              <input
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-yellow-400 outline-none transition-all"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                Category
              </label>

              <select
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-yellow-400 outline-none transition-all appearance-none"
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                Selling Price (₹)
              </label>

              <input
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-yellow-400 outline-none transition-all font-mono"
                name="rental_price"
                type="number"
                min="0"
                step="0.01"
                value={form.rental_price}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            {!item && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                  Stock Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-yellow-400 outline-none transition-all font-mono"
                  value={stockGroups[0].qty}
                  onChange={(e) =>
                    handleStockGroupChange(
                      0,
                      "qty",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
            )}
          </div>

          <label className="block border border-dashed border-gray-200 rounded-2xl p-4 cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FiUploadCloud className="text-gray-400 size-6" />
                )}
              </div>

              <div>
                <p className="font-bold text-gray-700">
                  Display Image
                </p>

                <p className="text-[10px] text-gray-400 uppercase font-black">
                  Click to upload catalog photo
                </p>
              </div>
            </div>
          </label>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
              Short Description
            </label>

            <textarea
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-yellow-400 outline-none transition-all h-20 resize-none"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-5 border-t border-[#00000014] bg-gray-50/30">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="bg-yellow-400 text-black px-8 py-2 rounded-xl font-bold shadow-md shadow-yellow-400/20 hover:bg-[#e5c004] active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
          >
            {saving
              ? "Saving..."
              : item
                ? "Update Product"
                : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
