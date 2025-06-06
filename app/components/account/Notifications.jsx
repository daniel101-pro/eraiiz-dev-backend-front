import { useState, useEffect } from 'react';
import { refreshAccessToken } from '../../utils/auth';
import { decodeJwt } from '../../utils/jwtDecode';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ws, setWs] = useState(null);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const url = process.env.NEXT_PUBLIC_API_URL + '/api/notifications';
      console.log('Fetching from URL:', url);
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      console.log('API Response Status:', res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.log('API Error Response:', errorText);
        if (res.status === 401) {
          try {
            const newToken = await refreshAccessToken();
            console.log('Refreshed token:', newToken);
            const retryRes = await fetch(url, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`,
              },
              credentials: 'include',
            });
            if (!retryRes.ok) {
              console.log('Retry Response Status:', retryRes.status);
              throw new Error('Failed to fetch notifications');
            }
            const data = await retryRes.json();
            setNotifications(data);
          } catch (refreshErr) {
            console.error('Refresh token error:', refreshErr.message);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
            window.location.href = '/login';
            return;
          }
        } else {
          throw new Error(`Failed to fetch notifications: ${res.status} - ${errorText}`);
        }
      }

      const data = await res.json();
      console.log('Fetched notifications:', data);
      setNotifications(data);
    } catch (err) {
      console.error('Fetch error:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      // Fallback: Extract userId from accessToken
      const token = localStorage.getItem('accessToken');
      if (token) {
        const decoded = decodeJwt(token);
        if (decoded && decoded.id) {
          userId = decoded.id;
          localStorage.setItem('userId', userId); // Save for future use
        }
      }
    }

    if (!userId) {
      window.location.href = '/login';
      return;
    }

    fetchNotifications();

    const wsUrl = process.env.NEXT_PUBLIC_API_URL.replace('http', 'ws') + `/?userId=${userId}`;
    console.log('Connecting to WebSocket:', wsUrl);
    const websocket = new WebSocket(wsUrl);
    setWs(websocket);

    websocket.onopen = () => {
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setNotifications(prev => [data, ...prev].filter(n => n.userId === userId));
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setTimeout(() => {
        const newWs = new WebSocket(wsUrl);
        setWs(newWs);
      }, 2000);
    };

    const interval = setInterval(fetchNotifications, 30000);

    return () => {
      websocket.close();
      clearInterval(interval);
    };
  }, []);

  if (isLoading) return <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div></div>;
  if (error) return <div className="text-red-600 text-center">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        {notifications.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-red-600 hover:text-red-800 underline"
          >
            Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-700 text-center">No notifications found.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map(notif => (
            <div key={notif._id} className={`border-b pb-4 flex justify-between items-center ${notif.read ? 'opacity-50' : ''}`}>
              <div>
                <p><strong>Type:</strong> {notif.type}</p>
                <p><strong>Message:</strong> {notif.message}</p>
                <p><strong>Date:</strong> {new Date(notif.createdAt).toLocaleString()}</p>
              </div>
              {!notif.read && (
                <button
                  onClick={() => handleMarkAsRead(notif._id)}
                  className="text-green-600 hover:text-green-800 underline"
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