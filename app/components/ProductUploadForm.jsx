'use client';
import React, { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import axios from 'axios';

const ProductUploadForm = () => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    images: [],
    attributes: [{ type: '', values: [], stock: '' }],
  });
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Updated categories list
  const categories = [
    'Plastic Made Products',
    'Rubber Made Products',
    'Glass Made Products',
    'Wood Made Products',
    'Palm Frond Made Products',
    'General Recycled Items',
  ];

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
        { refreshToken },
        { timeout: 30000 }
      );
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      console.log('Client: Token Refreshed:', data.accessToken);
      return data.accessToken;
    } catch (err) {
      console.error('Client: Refresh Error:', err.response?.data || err.message);
      return null;
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      let token = localStorage.getItem('accessToken');
      console.log('Client: Initial Token:', token);
      if (!token) {
        setError('Please sign in to access this page.');
        setIsLoading(false);
        return;
      }
      try {
        let res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/session`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000,
        });
        console.log('Client: Session Response:', res.status, res.data);
        if (res.status === 401) {
          token = await refreshToken();
          if (!token) throw new Error('Unable to refresh token');
          res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/session`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 30000,
          });
        }
        setSession(res.data);
      } catch (err) {
        console.error('Client: Session Error:', err.response?.data || err.message);
        setError('Please sign in to access this page.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSession();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setProduct((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const handleAttributeChange = (index, field, value) => {
    const updatedAttributes = [...product.attributes];
    updatedAttributes[index][field] = value;
    setProduct((prev) => ({ ...prev, attributes: updatedAttributes }));
  };

  const addAttribute = () => {
    setProduct((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { type: '', values: [], stock: '' }],
    }));
  };

  const handleAttributeValues = (index, value) => {
    const updatedAttributes = [...product.attributes];
    updatedAttributes[index].values = value.split(',').map((v) => v.trim());
    setProduct((prev) => ({ ...prev, attributes: updatedAttributes }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    let token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Please sign in to upload products.');
      return;
    }

    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('price', product.price);
    formData.append('category', product.category);
    formData.append('attributes', JSON.stringify(product.attributes));
    product.images.forEach((image) => formData.append('images', image));

    try {
      let response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/upload`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000,
        }
      );
      console.log('Client: Upload Response:', response.status, response.data);
      if (response.status === 401) {
        token = await refreshToken();
        if (!token) throw new Error('Unable to refresh token');
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products/upload`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 30000,
          }
        );
      }
      setSuccess('Product uploaded successfully!');
      setProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        images: [],
        attributes: [{ type: '', values: [], stock: '' }],
      });
    } catch (err) {
      console.error('Client: Upload Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to upload product');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <LoadingSpinner size={40} color="#16a34a" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Unauthorized</h2>
        <p className="text-red-600 text-center mb-6">{error || 'Please sign in to access this page.'}</p>
        <a
          href="/login"
          className="block w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-200 font-semibold text-center"
        >
          Sign In
        </a>
      </div>
    );
  }

  if (session.role !== 'seller') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Unauthorized</h2>
        <p className="text-red-600 text-center mb-6">Only sellers can access this page.</p>
        <a
          href="/login"
          className="block w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-200 font-semibold text-center"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Upload Product</h2>
      <p className="text-green-600 mb-4">Welcome, {session.email}!</p>
      {success && <p className="text-green-600 mb-4">{success}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter product name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Describe your product"
            rows="4"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Price ($)</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter price"
            step="0.01"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={product.category}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-green-500 focus:border-green-500"
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {product.images.map((img, index) => (
              <img
                key={index}
                src={URL.createObjectURL(img)}
                alt="Preview"
                className="h-20 w-20 object-cover rounded-md"
              />
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Attributes (e.g., Size, Dimensions)</label>
          {product.attributes.map((attr, index) => (
            <div key={index} className="mt-2 flex flex-col gap-2 border p-4 rounded-md">
              <input
                type="text"
                placeholder="Attribute Type (e.g., Size, Length)"
                value={attr.type}
                onChange={(e) => handleAttributeChange(index, 'type', e.target.value)}
                className="block w-full rounded-md border border-gray-300 p-2 focus:ring-green-500 focus:border-green-500"
                required
              />
              <input
                type="text"
                placeholder="Values (comma-separated, e.g., S,M,L or 12in,24in)"
                onChange={(e) => handleAttributeValues(index, e.target.value)}
                className="block w-full rounded-md border border-gray-300 p-2 focus:ring-green-500 focus:border-green-500"
                required
              />
              <input
                type="number"
                placeholder="Stock for this attribute"
                value={attr.stock}
                onChange={(e) => handleAttributeChange(index, 'stock', e.target.value)}
                className="block w-full rounded-md border border-gray-300 p-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addAttribute}
            className="mt-2 text-sm text-green-600 hover:text-green-800"
          >
            + Add Another Attribute
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Upload Product
        </button>
      </form>
    </div>
  );
};

export default ProductUploadForm;