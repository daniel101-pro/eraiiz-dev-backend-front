'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function UploadedProducts({ onTokenError }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null); // State for delete modal

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          onTokenError();
          return;
        }
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/seller`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          timeout: 30000,
        });
        setProducts(res.data);
      } catch (err) {
        if (err.response?.status === 401 || err.message.includes('Invalid or expired token')) {
          onTokenError();
        } else if (err.response?.status === 404) {
          setError('No products found. Start uploading products to see them here!');
        } else {
          setError(err.message || 'Failed to fetch products');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [onTokenError]);

  const handleDelete = async (productId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p._id !== productId));
      setDeleteProduct(null); // Close modal after deletion
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
      setDeleteProduct(null); // Close modal on error
    }
  };

  const handleEdit = (product) => {
    setEditingProduct({ ...product });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${editingProduct._id}`, {
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        category: editingProduct.category,
        status: editingProduct.status,
      }, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setProducts(products.map((p) => p._id === editingProduct._id ? res.data : p));
      setEditingProduct(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
    }
  };

  const handleChange = (e) => {
    setEditingProduct({ ...editingProduct, [e.target.name]: e.target.value });
  };

  if (loading) return <p className="text-gray-600">Loading products...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Uploaded Products</h2>
      {products.length === 0 ? (
        <p className="text-gray-600">No products uploaded. Start uploading to see them here!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((product) => (
            <div key={product._id} className="border border-gray-200 rounded-lg p-4 relative">
              <img
                src={product.images[0] || 'https://via.placeholder.com/200'}
                alt={product.name}
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="mt-2 text-sm font-semibold text-gray-800">{product.name}</h3>
              <p className="text-green-600 font-bold">₦{product.price.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Category: {product.category}</p>
              <p className="text-xs text-gray-500">Status: {product.status}</p>
              <p className="text-xs text-gray-500">Last Updated: {new Date(product.updatedAt).toLocaleDateString()}</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteProduct(product)}
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Product</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editingProduct.name || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={editingProduct.description || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  name="price"
                  value={editingProduct.price || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  value={editingProduct.category || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mt-1"
                >
                  <option value="Plastic Made Products">Plastic Made Products</option>
                  <option value="Rubber Made Products">Rubber Made Products</option>
                  <option value="Glass Made Products">Glass Made Products</option>
                  <option value="Wood Made Products">Wood Made Products</option>
                  <option value="Palm Frond Made Products">Palm Frond Made Products</option>
                  <option value="General Recycled Items">General Recycled Items</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={editingProduct.status || 'active'}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mt-1"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the product "<strong>{deleteProduct.name}</strong>"? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDelete(deleteProduct._id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteProduct(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}