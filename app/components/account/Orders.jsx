import { useState, useEffect } from 'react';
import { refreshAccessToken } from '../../utils/auth';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newOrder, setNewOrder] = useState({ product: '', price: '', status: 'Pending' });

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!res.ok) {
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
            if (!retryRes.ok) throw new Error('Failed to fetch orders');
            const data = await retryRes.json();
            setOrders(data);
          } catch (refreshErr) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return;
          }
        } else {
          throw new Error('Failed to fetch orders');
        }
      }

      const data = await res.json();
      setOrders(data);
    } catch (err) {
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
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <div>Loading orders...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h1 className="text-2xl font-semibold mb-8">Orders</h1>

      {/* Add New Order Form */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Order</h2>
        <form onSubmit={handleAddOrder} className="flex gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-700">Product:</label>
            <input
              type="text"
              value={newOrder.product}
              onChange={(e) => setNewOrder({ ...newOrder, product: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Price (NGN):</label>
            <input
              type="number"
              value={newOrder.price}
              onChange={(e) => setNewOrder({ ...newOrder, price: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200"
          >
            Add Order
          </button>
        </form>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <p className="text-gray-700">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="border-b pb-4">
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>Product:</strong> {order.product}</p>
              <p><strong>Price:</strong> {order.price.toLocaleString()} NGN</p>
              <p><strong>Status:</strong> {order.status}</p>
              <div className="mt-2">
                <label className="text-sm text-gray-700">Update Status:</label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="ml-2 p-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}