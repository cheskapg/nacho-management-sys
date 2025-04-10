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

// Define validation error types
interface ValidationErrors {
  customer_uuid?: string;
  // sale_uuid?: string;
  product_uuid?: string;
  quantity?: string;
  unit_price?: string;
  general?: string;
}

interface ItemFormData {
  sale_uuid: string;
  product_uuid: string;
  quantity: number;
  unit_price?: number;
  customer_uuid?: string;
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
      if (!(err instanceof Error) || err.message !== "Validation failed") {
        setValidationErrors({
          ...validationErrors,
          general: "Failed to add item. Please try again.",
        });
      }
      setError("Failed to fetch items");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const refresh = async (): Promise<void> => {
    fetchItems();
    fetchCustomerSales();
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
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors({
        ...validationErrors,
        [name]: undefined,
      });
    }
  };

  // Add item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    // First validate the form
    const errors = validateForm();
    setValidationErrors(errors);

    // If there are errors, show them and stop submission
    if (Object.keys(errors).length > 0) {
      setShowValidationErrors(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/addItem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        setIsSubmitting(false);

        throw new Error(`Error: ${response.status}`);
      }
      setIsSubmitting(false);

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
    // Only validate relevant fields for update
    const errors: ValidationErrors = {};

    if (!formData.quantity || formData.quantity < 1) {
      errors.quantity = "Quantity must be at least 1";
    } else if (!Number.isInteger(Number(formData.quantity))) {
      errors.quantity = "Quantity must be a whole number";
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setShowValidationErrors(true);
      return;
    }
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
      setValidationErrors({
        general: "Failed to update item. Please try again.",
      });
      setError("Failed to update item");
      console.error(err);
    }
  };
  const [productList, setProductList] = useState([]);
  const [customerSalesList, setCustomerSalesList] = useState<any[]>([]);
  const [salesList, setSalesList] = useState([]);

  const [customersList, setCustomersList] = useState([]);

  const fetchCustomerSales = async () => {
    try {
      const response = await fetch(`/api/sales/allSales`);
      const data = await response.json();
      setSalesList(data); // Store all sales in state
      filterSalesByCustomerUuid(data, customerUuid);
    } catch (error) {
      console.error("Error fetching sales:", error);
    }
  };

  // Filter sales based on customer UUID
  const filterSalesByCustomerUuid = (sales: any[], customerUuid: string) => {
    const filteredSales = sales.filter(
      (sale) => sale.customer_uuid === customerUuid
    );
    setCustomerSalesList(filteredSales);
  };
  // const fetchCustomers = async () => {
  //   try {
  //     const response = await fetch("/api/customers/allCustomers"); // Assuming you renamed the route
  //     const data = await response.json();
  //     console.log(data);
  //     setFormData((prev) => ({
  //       ...prev,
  //       customer_uuid: data[0]?.uuid || "",
  //     }));
  //     setCustomersList(data);

  //     if (data.length > 0) {
  //       const firstCustomerUuid = data[0]?.uuid;
  //       setCustomerUuid(firstCustomerUuid); // Set first customer UUID
  //       setFormData((prev) => ({
  //         ...prev,
  //         customer_uuid: firstCustomerUuid, // Set customer UUID in form
  //       }));
  //       filterSalesByCustomerUuid(salesList, firstCustomerUuid); // Filter sales based on the first customer
  //     }
  //   } catch (error) {
  //     console.error("Error fetching products:", error);
  //   }
  // };
  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers/allCustomers");
      const data = await response.json();
      setCustomersList(data);

      if (data.length > 0) {
        // Set the first customer's UUID as the default value
        // const firstCustomerUuid = data[0].uuid;
        // setFormData((prev) => ({
        //   ...prev,
        //   customer_uuid: firstCustomerUuid, // Set the first customer's UUID
        // }));
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  // Add validation errors state
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to validate the form
  const validateForm = () => {
    const errors: ValidationErrors = {};

    // Validate customer selection - only needed for new items
    if (!editingItem && !formData.customer_uuid) {
      errors.customer_uuid = "Please select a customer";
    }

    // Validate sale selection - only needed for new items
    if (!editingItem && !formData.sale_uuid) {
      // Note: We can skip this error if creating a new sale is allowed
      // if (formData.sale_uuid !== "") {
      //   errors.sale_uuid = "Please select a sale or create a new one";
      // }
    }

    // Validate product selection
    if (!formData.product_uuid) {
      errors.product_uuid = "Please select a product";
    }

    // Validate quantity
    if (!formData.quantity || formData.quantity < 1) {
      errors.quantity = "Quantity must be at least 1";
    } else if (!Number.isInteger(Number(formData.quantity))) {
      errors.quantity = "Quantity must be a whole number";
    }

    // Unit price validation would go here if it wasn't disabled

    return errors;
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
    if (validationErrors.product_uuid) {
      setValidationErrors({
        ...validationErrors,
        product_uuid: undefined,
      });
    }
    console.log(selectedProduct, "selectedProduct");
    console.log(selectedProduct?.price);
  };

  console.log(formData.sale_uuid, "formData.sale_uuid");
  const handleSalesChange = (e: any) => {
    setFormData({ ...formData, sale_uuid: e.target.value });
    // Clear error
    // if (validationErrors.sale_uuid) {
    //   setValidationErrors({
    //     ...validationErrors,
    //     sale_uuid: undefined,
    //   });
    // }
  };
  // Filter sales by customer UUID when customer changes
  const handleCustomerChange = (e: any) => {
    const newCustomerUuid = e.target.value;
    setFormData((prev) => ({ ...prev, customer_uuid: newCustomerUuid }));
    filterSalesByCustomerUuid(salesList, newCustomerUuid); // Filter sales based on the first customer

    // Clear related validation errors
    if (validationErrors.customer_uuid) {
      setValidationErrors({
        ...validationErrors,
        customer_uuid: undefined,
      });
    }
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
          
          {/* General error message */}
          {validationErrors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {validationErrors.general}
            </div>
          )}
          
          <form onSubmit={editingItem ? handleUpdateItem : handleAddItem}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!editingItem && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer *
                    </label>
                    <select
                      name="customer_uuid"
                      value={formData.customer_uuid}
                      onChange={handleCustomerChange}
                      required
                      className={`w-full px-3 py-2 border rounded-md ${
                        validationErrors.customer_uuid && showValidationErrors
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Customer</option>
                      {customersList.map((customer: any) => (
                        <option key={customer.uuid} value={customer.uuid}>
                          {customer.name} - {customer.email}
                        </option>
                      ))}
                    </select>
                    {validationErrors.customer_uuid && showValidationErrors && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.customer_uuid}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sale *
                    </label>
                    <select
                      name="sale_uuid"
                      value={formData.sale_uuid}
                      onChange={handleSalesChange}
                      // required
                      className={`w-full px-3 py-2 border rounded-md `}
                      // ${
                      //   validationErrors.sale_uuid && showValidationErrors
                      //     ? "border-red-500 bg-red-50"
                      //     : "border-gray-300"
                      // }
                      disabled={!formData.customer_uuid}
                    >
                      <option value="">New sale</option>
                      {customerSalesList.map((sales: any) => (
                        <option key={sales.uuid} value={sales.uuid}>
                          {sales.date} - Total Amount: {sales.total_amount}
                        </option>
                      ))}
                    </select>
                    {/* {validationErrors.sale_uuid && showValidationErrors && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.sale_uuid}</p>
                    )} */}
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
                      className={`w-full px-3 py-2 border rounded-md ${
                        validationErrors.product_uuid && showValidationErrors
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select a product</option>
                      {productList.map((product: any) => (
                        <option key={product.uuid} value={product.uuid}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    {validationErrors.product_uuid && showValidationErrors && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.product_uuid}</p>
                    )}
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
                  className={`w-full px-3 py-2 border rounded-md ${
                    validationErrors.quantity && showValidationErrors
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {validationErrors.quantity && showValidationErrors && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.quantity}</p>
                )}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                  setValidationErrors({});
                  setShowValidationErrors(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editingItem ? "Updating..." : "Adding..."}
                  </span>
                ) : (
                  editingItem ? "Update Item" : "Add Item"
                )}
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
