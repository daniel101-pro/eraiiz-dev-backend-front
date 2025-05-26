import { useState } from 'react';
import { refreshAccessToken } from '../../utils/auth';

export default function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // State for delete confirmation modal

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (settings.newPassword && settings.newPassword !== settings.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const payload = {
        emailNotifications: settings.emailNotifications,
      };
      if (settings.newPassword) {
        payload.password = settings.newPassword;
      }

      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 401) {
          try {
            const newToken = await refreshAccessToken();
            const retryRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/users/me', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`,
              },
              credentials: 'include',
              body: JSON.stringify(payload),
            });
            if (!retryRes.ok) throw new Error('Failed to update settings');
          } catch (refreshErr) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return;
          }
        } else {
          throw new Error('Failed to update settings');
        }
      }

      setSettings({ ...settings, newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const requestUrl = process.env.NEXT_PUBLIC_API_URL + '/api/auth/delete-account'; // Updated to match backend
      console.log('Full Request URL:', requestUrl);

      // Get email from localStorage (stored during login)
      const storedUser = localStorage.getItem('user');
      const email = storedUser ? JSON.parse(storedUser).email : null;
      if (!email) {
        throw new Error('Unable to determine user email for deletion. Please log in again.');
      }

      const res = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const responseText = await res.text();
      console.log('Delete Account Response:', responseText);
      console.log('Status:', res.status);

      if (!res.ok) {
        if (res.status === 401) {
          try {
            const newToken = await refreshAccessToken();
            const retryRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/auth/delete-account', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`,
              },
              credentials: 'include',
              body: JSON.stringify({ email }),
            });
            const retryText = await retryRes.text();
            console.log('Retry Response:', retryText);
            console.log('Retry Status:', retryRes.status);
            if (!retryRes.ok) throw new Error('Failed to delete account');
          } catch (refreshErr) {
            console.log('Refresh Error:', refreshErr.message);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return;
          }
        } else {
          throw new Error(`Failed to delete account: ${responseText || 'Unknown error'}`);
        }
      }

      // Clear all user data and redirect to login
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      window.location.href = '/login';
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false); // Close modal on completion
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h1 className="text-2xl font-semibold mb-8">Settings</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            Receive Email Notifications
          </label>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-4">Change Password</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700">New Password:</label>
              <input
                type="password"
                name="newPassword"
                value={settings.newPassword}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Confirm Password:</label>
              <input
                type="password"
                name="confirmPassword"
                value={settings.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
      <div className="mt-6">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200"
          disabled={isLoading}
        >
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Confirm Account Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone, and all your data will be permanently removed.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-200"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}