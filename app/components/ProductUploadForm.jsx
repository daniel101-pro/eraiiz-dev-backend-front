'use client';
import React, { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import axios from 'axios';
import Image from 'next/image';
import { toast, Toaster } from 'react-hot-toast';

const ProductUploadForm = () => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    material: '',
    details: [''],
    images: [],
    attributes: [{ type: '', values: [], stock: '' }],
    sizes: {
      S: { available: false, stock: 0 },
      L: { available: false, stock: 0 },
      XL: { available: false, stock: 0 },
      XXL: { available: false, stock: 0 },
      XXXL: { available: false, stock: 0 }
    },
    bonus: {
      enabled: false,
      type: 'percentage', // or 'fixed'
      value: 0
    }
  });
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleDetailChange = (index, value) => {
    const newDetails = [...product.details];
    newDetails[index] = value;
    setProduct((prev) => ({ ...prev, details: newDetails }));
  };

  const addDetail = () => {
    setProduct((prev) => ({
      ...prev,
      details: [...prev.details, ''],
    }));
  };

  const removeDetail = (index) => {
    setProduct((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setProduct((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index) => {
    setProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
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

  const removeAttribute = (index) => {
    setProduct((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const handleAttributeValues = (index, value) => {
    const updatedAttributes = [...product.attributes];
    updatedAttributes[index].values = value.split(',').map((v) => v.trim());
    setProduct((prev) => ({ ...prev, attributes: updatedAttributes }));
  };

  const handleSizeToggle = (size) => {
    setProduct((prev) => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [size]: {
          ...prev.sizes[size],
          available: !prev.sizes[size].available
        }
      }
    }));
  };

  const handleSizeStockChange = (size, value) => {
    setProduct((prev) => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [size]: {
          ...prev.sizes[size],
          stock: parseInt(value) || 0
        }
      }
    }));
  };

  const handleBonusToggle = () => {
    setProduct((prev) => ({
      ...prev,
      bonus: {
        ...prev.bonus,
        enabled: !prev.bonus.enabled
      }
    }));
  };

  const handleBonusChange = (field, value) => {
    setProduct((prev) => ({
      ...prev,
      bonus: {
        ...prev.bonus,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    let token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Please sign in to upload products.');
      setIsSubmitting(false);
      return;
    }

    // Validate required fields
    if (!product.material) {
      toast.error('Material is required');
      setIsSubmitting(false);
      return;
    }

    if (!product.images.length) {
      toast.error('At least one image is required');
      setIsSubmitting(false);
      return;
    }

    // Check if at least one size is available when sizes are used
    const hasAvailableSizes = Object.values(product.sizes).some(size => size.available);
    if (!hasAvailableSizes) {
      toast.error('Please select at least one available size');
      setIsSubmitting(false);
      return;
    }

    // Filter out empty details
    const filteredDetails = product.details.filter(detail => detail.trim() !== '');

    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('price', product.price);
    formData.append('category', product.category);
    formData.append('material', product.material);
    formData.append('details', JSON.stringify(filteredDetails));
    formData.append('attributes', JSON.stringify(product.attributes));
    formData.append('sizes', JSON.stringify(product.sizes));
    formData.append('bonus', JSON.stringify(product.bonus));
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
      toast.success('Product uploaded successfully!');
      setProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        material: '',
        details: [''],
        images: [],
        attributes: [{ type: '', values: [], stock: '' }],
        sizes: {
          S: { available: false, stock: 0 },
          L: { available: false, stock: 0 },
          XL: { available: false, stock: 0 },
          XXL: { available: false, stock: 0 },
          XXXL: { available: false, stock: 0 }
        },
        bonus: {
          enabled: false,
          type: 'percentage', // or 'fixed'
          value: 0
        }
      });
    } catch (err) {
      console.error('Client: Upload Error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to upload product');
    } finally {
      setIsSubmitting(false);
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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#333',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
          },
        }}
      />
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Upload New Product</h2>
        <p className="mt-1 text-sm text-gray-500">
          Create your product listing with all the essential details to attract customers
        </p>
      </div>
      {success && <p className="text-green-600 mb-4">{success}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
              <p className="text-xs text-gray-500 mb-1">
                Choose a clear, catchy name that helps customers find your product
              </p>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
              <p className="text-xs text-gray-500 mb-1">
                Paint a picture with words - describe what makes your product special
              </p>
          <textarea
            name="description"
            value={product.description}
            onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <p className="text-xs text-gray-500 mb-1">
                Set a competitive price that reflects your product's value
              </p>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">₦</span>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleInputChange}
                  className="block w-full pl-7 rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
            step="0.01"
            required
          />
        </div>
            </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
              <p className="text-xs text-gray-500 mb-1">
                Help customers discover your product in the right category
              </p>
          <select
            name="category"
            value={product.category}
            onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          >
                <option value="" className="text-gray-400">Select</option>
            {categories.map((cat) => (
                  <option key={cat} value={cat} className="text-gray-700">
                {cat}
              </option>
            ))}
          </select>
        </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Material</label>
              <p className="text-xs text-gray-500 mb-1">
                Specify the primary material - quality starts with what it's made of
              </p>
              <input
                type="text"
                name="material"
                value={product.material}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Product Details</label>
              <p className="text-xs text-gray-500 mb-1">
                List unique features, care instructions, or any special characteristics
              </p>
              <div className="space-y-2">
                {product.details.map((detail, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={detail}
                      onChange={(e) => handleDetailChange(index, e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter product detail"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeDetail(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Images</label>
              <p className="text-xs text-gray-500 mb-1">
                Show your product's best angles - high-quality images increase sales
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer block text-center"
                >
                  <div className="space-y-2">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="text-sm text-gray-600">
                      <span className="text-green-600 hover:text-green-700">Upload images</span>
                      {' '}or drag and drop
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </label>
              </div>
              {product.images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {product.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="h-24 w-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
            ))}
          </div>
              )}
        </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Product Attributes</label>
              <p className="text-xs text-gray-500 mb-1">
                Define custom attributes like colors, patterns, or variations
              </p>
        <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attributes
                  <button
                    type="button"
                    onClick={addAttribute}
                    className="ml-2 text-green-600 hover:text-green-700 text-sm"
                  >
                    + Add Attribute
                  </button>
                </label>
          {product.attributes.map((attr, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Attribute {index + 1}</h4>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeAttribute(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
              <input
                type="text"
                placeholder="Attribute Type (e.g., Size, Length)"
                value={attr.type}
                onChange={(e) => handleAttributeChange(index, 'type', e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                        placeholder="Values (comma-separated, e.g., S,M,L)"
                onChange={(e) => handleAttributeValues(index, e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <input
                type="number"
                        placeholder="Stock quantity"
                value={attr.stock}
                onChange={(e) => handleAttributeChange(index, 'stock', e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Available Sizes</label>
              <p className="text-xs text-gray-500 mb-2">
                Toggle sizes you offer and set stock levels - grey means unavailable
              </p>
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(product.sizes).map(([size, data]) => (
                  <div key={size} className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`
                        w-full py-3 px-4 text-base font-medium rounded-xl border-2
                        ${data.available
                          ? 'border-green-600 bg-white text-green-600'
                          : 'border-gray-200 bg-gray-50 text-gray-300'
                        }
                        transition-colors duration-200
                      `}
                    >
                      {size}
                    </button>
                    {data.available && (
                      <input
                        type="number"
                        min="0"
                        value={data.stock}
                        onChange={(e) => handleSizeStockChange(size, e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Stock"
                      />
                    )}
            </div>
          ))}
              </div>
            </div>

            {/* Bonus/Discount Section */}
            <div className="border rounded-lg p-4 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Special Offer</label>
                    <p className="text-xs text-gray-500">
                      Attract customers with a special discount or promotional offer
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleBonusToggle}
                    className={`
                      relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                      transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                      ${product.bonus.enabled ? 'bg-green-600' : 'bg-gray-200'}
                    `}
                  >
                    <span
                      className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                        transition duration-200 ease-in-out
                        ${product.bonus.enabled ? 'translate-x-5' : 'translate-x-0'}
                      `}
                    />
                  </button>
                </div>

                {product.bonus.enabled && (
                  <div className="space-y-3 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Discount Type</label>
                      <p className="text-xs text-gray-500 mb-1">
                        Choose between a percentage off or a fixed amount discount
                      </p>
                      <select
                        value={product.bonus.type}
                        onChange={(e) => handleBonusChange('type', e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₦)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {product.bonus.type === 'percentage' ? 'Percentage Off' : 'Amount Off'}
                      </label>
                      <p className="text-xs text-gray-500 mb-1">
                        {product.bonus.type === 'percentage'
                          ? 'Enter a percentage between 1-100%'
                          : 'Enter the amount to subtract from the price'
                        }
                      </p>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max={product.bonus.type === 'percentage' ? "100" : undefined}
                          value={product.bonus.value}
                          onChange={(e) => handleBonusChange('value', parseFloat(e.target.value) || 0)}
                          className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder={product.bonus.type === 'percentage' ? "Enter percentage" : "Enter amount"}
                        />
                        <span className="absolute right-3 top-2 text-gray-500">
                          {product.bonus.type === 'percentage' ? '%' : '₦'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Uploading...' : 'Upload Product'}
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Double-check all details before uploading - happy selling!
          </p>
        </div>
      </form>
    </div>
  );
};

export default ProductUploadForm;