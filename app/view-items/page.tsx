"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";

// Types based on your Fastify schema
interface Item {
  id?: number;
  uuid: string;
  sale_uuid: string;
  product_name: string;
  product_uuid: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
interface Product {
  uuid: string;
  name: string;
  price: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

interface ItemFormData {
  sale_uuid: string;
  product_uuid: string;
  quantity: number;
  unit_price?: number;
  customer_uuid: string;
}

const Items = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [customerUuid, setCustomerUuid] = useState("1");
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<ItemFormData>({
    sale_uuid: "",
    product_uuid: "",
    quantity: 1,
    unit_price: undefined,
    customer_uuid: "",
  });
  const [deletedItemId, setDeletedItemId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Fetch items
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/getItems");
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      if (data.length === 0) {
        setItems([]);
        setError("No items found");
        await fetch;
      } else {
        console.log(data.items, "data items", data);
        setItems(data);
        setError(null);
      }
    } catch (err) {
      setError("Failed to fetch items");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const refresh = async (): Promise<void> => {
    fetchItems();
    fetchSales();
    fetchCustomers();
    fetchProducts();
  };
  useEffect(() => {
    refresh();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "quantity"
          ? parseInt(value)
          : name === "unit_price"
          ? parseFloat(value)
          : value,
    });
  };

  // Add item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/addItem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      await fetchItems();
      setShowAddForm(false);
      setFormData({
        sale_uuid: "",
        product_uuid: "",
        quantity: 1,
        unit_price: undefined,
        customer_uuid: "",
      });
    } catch (err) {
      setError("Failed to add item");
      console.error(err);
    }
  };

  // Update item
  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const response = await fetch(`/api/items/${editingItem.uuid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: formData.quantity,
          unit_price: formData.unit_price,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      setEditingItem(null);
      setFormData({
        sale_uuid: "",
        product_uuid: "",
        quantity: 1,
        unit_price: undefined,
        customer_uuid: "",
      });
    } catch (err) {
      setError("Failed to update item");
      console.error(err);
    }
  };
  const [productList, setProductList] = useState([]);
  const [salesList, setSalesList] = useState([]);
  const [customersList, setCustomersList] = useState([]);

  const fetchSales = async () => {
    try {
      const response = await fetch("/api/sales/allSales"); // Assuming you renamed the route
      const data = await response.json();
      console.log(data);
      setSalesList(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers/allCustomers"); // Assuming you renamed the route
      const data = await response.json();
      console.log(data);
      setCustomersList(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products/allProducts"); // Assuming you renamed the route
      const data = await response.json();
      setProductList(data);
      setFormData((prev) => ({
        ...prev,
        product_uuid: data[0]?.uuid || "",
        unit_price: data[0]?.price, // Set default product UUID if available
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleProductChange = (e: any) => {
    const selectedProduct = productList.find(
      (product: any) => product.uuid === e.target.value
    ) as Product | undefined;

    setFormData({
      ...formData,
      product_uuid: selectedProduct?.uuid ?? "",
      unit_price: selectedProduct?.price ?? 0,
    });
    console.log(selectedProduct, "selectedProduct");
    console.log(selectedProduct?.price);
  };

  const handleSalesChange = (e: any) => {
    setFormData({ ...formData, sale_uuid: e.target.value });
  };
  const handleCustomerChange = (e: any) => {
    setFormData({ ...formData, customer_uuid: e.target.value });
  };
  // Delete item
  const handleDeleteItem = async (uuid: string) => {
    const confirmed = confirm("Are you sure you want to delete this item?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/items/${uuid}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete");
      }

      await fetchItems(); // Refresh list
    } catch (err) {
      console.error(err);
      setError("Failed to delete item");
    }
  };

  // Start editing an item
  const startEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      sale_uuid: item.sale_uuid,
      product_uuid: item.product_uuid,
      quantity: item.quantity,
      unit_price: item.unit_price,
      customer_uuid: customerUuid,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-green-600 text-white px-4 py-2 rounded shadow z-50 animate-fade-in-out">
          {toastMessage}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">View all items</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              refresh();
            }}
            className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors"
          >
            <RefreshCw size={18} /> Refresh
          </button>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingItem(null);
            }}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus size={18} /> Add Item
          </button>
        </div>
      </div>

      {error && (
        <div
          className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-6"
          role="alert"
        >
          <p>{error}</p>
        </div>
      )}

      {/* Add/Edit Item Form */}
      {(showAddForm || editingItem) && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingItem ? "Edit Item" : "Add New Item"}
          </h2>
          <form onSubmit={editingItem ? handleUpdateItem : handleAddItem}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!editingItem && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer
                    </label>
                    <select
                      name="sale_uuid"
                      value={formData.customer_uuid}
                      onChange={handleCustomerChange}
                      required
                      className="w-full  px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option disabled value="null">
                        Select Customer
                      </option>
                      {/* <option value="">New Customer</option> */}

                      {customersList.map((customer: any) => (
                        <option key={customer.uuid} value={customer.uuid}>
                          {customer.name} - {customer.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sale UUID
                    </label>
                    <select
                      name="sale_uuid"
                      value={formData.sale_uuid}
                      onChange={handleSalesChange}
                      required
                      className="w-full  px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option disabled value="null">
                        Select sale
                      </option>
                      <option value="">New sale</option>

                      {salesList.map((sales: any) => (
                        <option key={sales.uuid} value={sales.uuid}>
                          {sales.date} - Total Amount: {sales.total_amount}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product *
                    </label>
                    <select
                      name="product_uuid"
                      value={formData.product_uuid}
                      onChange={handleProductChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select a product</option>
                      {productList.map((product: any) => (
                        <option key={product.uuid} value={product.uuid}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Price
                </label>
                <input
                  type="number"
                  name="unit_price"
                  placeholder="Unit Price"
                  value={formData.unit_price || ""}
                  onChange={handleInputChange}
                  disabled={true}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingItem ? "Update Item" : "Add Item"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items Grid */}
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            No items available. Add your first item!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <div
              key={item.uuid}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900 mb-2 truncate">
                    Item #{index + 1} - {item.product_name}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.uuid)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">UUID:</span> {item.uuid}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Sale UUID:</span>{" "}
                    {item.sale_uuid}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Product UUID:</span>{" "}
                    {item.product_uuid}
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="block text-xs text-gray-500">
                      Quantity
                    </span>
                    <span className="font-semibold">{item.quantity}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="block text-xs text-gray-500">
                      Unit Price
                    </span>
                    <span className="font-semibold">${item.unit_price}</span>
                  </div>
                </div>
                <div className="mt-3 bg-blue-50 p-3 rounded">
                  <span className="block text-xs text-blue-500">Subtotal</span>
                  <span className="font-semibold text-blue-700">
                    ${item.subtotal}
                  </span>
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  {item.created_at && (
                    <p>
                      Created: {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  )}
                  {item.updated_at && (
                    <p>
                      Updated: {new Date(item.updated_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Items;
