import { useState, useEffect } from 'react';
import { refreshAccessToken } from '../../utils/auth';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newOrder, setNewOrder] = useState({ product: '', price: '', status: 'Pending' });
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      console.log('Fetching orders with token:', token.substring(0, 20) + '...');
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      console.log('Orders response status:', res.status);
      console.log('Orders response headers:', res.headers);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Orders error response:', errorText);
        
        if (res.status === 401) {
          try {
            const newToken = await refreshAccessToken();
            const retryRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/orders', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`,
              },
              credentials: 'include',
            });
            if (!retryRes.ok) {
              const retryErrorText = await retryRes.text();
              console.error('Retry orders error response:', retryErrorText);
              throw new Error('Failed to fetch orders after token refresh');
            }
            const data = await retryRes.json();
            setOrders(data);
          } catch (refreshErr) {
            console.error('Token refresh error:', refreshErr);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return;
          }
        } else {
          throw new Error(`Failed to fetch orders: ${res.status} ${errorText}`);
        }
      }

      const data = await res.json();
      console.log('Orders data received:', data);
      setOrders(data);
    } catch (err) {
      console.error('Orders fetch error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update order status');
      }

      setOrders(orders.map(order => order._id === orderId ? { ...order, status: newStatus } : order));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(newOrder),
      });

      if (!res.ok) {
        throw new Error('Failed to add order');
      }

      const data = await res.json();
      setOrders([...orders, data]);
      setNewOrder({ product: '', price: '', status: 'Pending' });
      setShowAddForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'Shipped':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
          </svg>
        );
      case 'Delivered':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'Cancelled':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3F8E3F]"></div>
          <span className="ml-3 text-sm text-gray-600">Loading orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Error Loading Orders</h3>
            <p className="text-xs text-red-600">{error}</p>
            <button 
              onClick={fetchOrders}
              className="mt-4 px-4 py-2 bg-[#3F8E3F] text-white text-xs rounded-lg hover:bg-[#357C35] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">Orders</h1>
          <p className="text-xs text-gray-500 mt-1">Manage your order history and track shipments</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center px-3 py-2 bg-[#3F8E3F] text-white text-xs rounded-lg hover:bg-[#357C35] transition-colors"
        >
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {showAddForm ? 'Cancel' : 'Add Order'}
        </button>
      </div>

      {/* Add New Order Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h2 className="text-xs font-semibold text-gray-900 mb-3">Add New Order</h2>
          <form onSubmit={handleAddOrder} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={newOrder.product}
                  onChange={(e) => setNewOrder({ ...newOrder, product: e.target.value })}
                  className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F8E3F] focus:border-transparent"
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Price (NGN)</label>
                <input
                  type="number"
                  value={newOrder.price}
                  onChange={(e) => setNewOrder({ ...newOrder, price: e.target.value })}
                  className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F8E3F] focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Status</label>
                <select
                  value={newOrder.status}
                  onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
                  className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F8E3F] focus:border-transparent"
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-[#3F8E3F] text-white text-xs rounded-lg hover:bg-[#357C35] transition-colors"
              >
                Add Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <h3 className="text-sm font-medium text-gray-900 mb-2">No Orders Yet</h3>
          <p className="text-xs text-gray-500 mb-4">You haven't placed any orders yet.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-[#3F8E3F] text-white text-xs rounded-lg hover:bg-[#357C35] transition-colors"
          >
            Place Your First Order
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">{order.product}</h3>
                  <p className="text-xs text-gray-500">Order ID: {order._id}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    ₦{order.price.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{order.status}</span>
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-xs text-gray-700">Update Status:</label>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#3F8E3F] focus:border-transparent"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Summary */}
      {orders.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-xs font-semibold text-gray-900 mb-3">Order Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-gray-500">Total Orders</p>
              <p className="font-semibold text-gray-900">{orders.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Total Value</p>
              <p className="font-semibold text-gray-900">
                ₦{orders.reduce((sum, order) => sum + order.price, 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Pending</p>
              <p className="font-semibold text-yellow-600">
                {orders.filter(order => order.status === 'Pending').length}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Delivered</p>
              <p className="font-semibold text-green-600">
                {orders.filter(order => order.status === 'Delivered').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}