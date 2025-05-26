import { useState, useEffect } from 'react';
import { refreshAccessToken } from '../../utils/auth';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/notifications', {
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
            const retryRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/notifications', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`,
              },
              credentials: 'include',
            });
            if (!retryRes.ok) throw new Error('Failed to fetch notifications');
            const data = await retryRes.json();
            setNotifications(data);
          } catch (refreshErr) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return;
          }
        } else {
          throw new Error('Failed to fetch notifications');
        }
      }

      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ read: true }),
      });

      if (!res.ok) {
        throw new Error('Failed to mark notification as read');
      }

      setNotifications(notifications.map(notif => notif._id === notificationId ? { ...notif, read: true } : notif));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClearAll = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/notifications', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to clear notifications');
      }

      setNotifications([]);
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <div>Loading notifications...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        {notifications.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-red-600 hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-700">No notifications found.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map(notif => (
            <div key={notif._id} className={`border-b pb-4 flex justify-between items-center ${notif.read ? 'opacity-50' : ''}`}>
              <div>
                <p><strong>Message:</strong> {notif.message}</p>
                <p><strong>Date:</strong> {new Date(notif.createdAt).toLocaleDateString()}</p>
              </div>
              {!notif.read && (
                <button
                  onClick={() => handleMarkAsRead(notif._id)}
                  className="text-green-600 hover:underline"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}