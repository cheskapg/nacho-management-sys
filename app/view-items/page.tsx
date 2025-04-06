
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';

// Types based on your Fastify schema
interface Item {
  id?: number;
  uuid: string;
  sale_uuid: string;
  product_uuid: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

interface ItemFormData {
  sale_uuid: string;
  product_uuid: string;
  quantity: number;
  unit_price?: number;
}

const Items = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<ItemFormData>({
    sale_uuid: '',
    product_uuid: '',
    quantity: 1,
    unit_price: undefined
  });

  // Fetch items
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/getItems');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setItems(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' ? parseInt(value) : 
              name === 'unit_price' ? parseFloat(value) : value
    });
  };

  // Add item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/addItem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      await fetchItems();
      setShowAddForm(false);
      setFormData({
        sale_uuid: '',
        product_uuid: '',
        quantity: 1,
        unit_price: undefined
      });
    } catch (err) {
      setError('Failed to add item');
      console.error(err);
    }
  };

  // Update item
  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    try {
      const response = await fetch(`/api/items/${editingItem.uuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: formData.quantity,
          unit_price: formData.unit_price
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      await fetchItems();
      setEditingItem(null);
      setFormData({
        sale_uuid: '',
        product_uuid: '',
        quantity: 1,
        unit_price: undefined
      });
    } catch (err) {
      setError('Failed to update item');
      console.error(err);
    }
  };

  // Delete item
  const handleDeleteItem = async (uuid: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const response = await fetch(`/api/items/${uuid}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      await fetchItems();
    } catch (err) {
      setError('Failed to delete item');
      console.error(err);
    }
  };

  // Start editing an item
  const startEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      sale_uuid: item.sale_uuid,
      product_uuid: item.product_uuid,
      quantity: item.quantity,
      unit_price: item.unit_price
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Items Dashboard</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => fetchItems()}
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
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Add/Edit Item Form */}
      {(showAddForm || editingItem) && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </h2>
          <form onSubmit={editingItem ? handleUpdateItem : handleAddItem}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!editingItem && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sale UUID
                    </label>
                    <input
                      type="text"
                      name="sale_uuid"
                      value={formData.sale_uuid}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product UUID *
                    </label>
                    <input
                      type="text"
                      name="product_uuid"
                      value={formData.product_uuid}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
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
                  value={formData.unit_price || ''}
                  onChange={handleInputChange}
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
                {editingItem ? 'Update Item' : 'Add Item'}
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
          <p className="text-gray-500">No items available. Add your first item!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.uuid} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900 mb-2 truncate">
                    Item #{item.id}
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
                    <span className="font-medium">Sale UUID:</span> {item.sale_uuid}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Product UUID:</span> {item.product_uuid}
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="block text-xs text-gray-500">Quantity</span>
                    <span className="font-semibold">{item.quantity}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="block text-xs text-gray-500">Unit Price</span>
                    <span className="font-semibold">${item.unit_price}</span>
                  </div>
                </div>
                <div className="mt-3 bg-blue-50 p-3 rounded">
                  <span className="block text-xs text-blue-500">Subtotal</span>
                  <span className="font-semibold text-blue-700">${item.subtotal}</span>
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  {item.created_at && (
                    <p>Created: {new Date(item.created_at).toLocaleDateString()}</p>
                  )}
                  {item.updated_at && (
                    <p>Updated: {new Date(item.updated_at).toLocaleDateString()}</p>
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

