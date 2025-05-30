import { useState } from 'react';
import { refreshAccessToken } from '../../utils/auth';

export default function MyEraiizAccount({ user, setUser }) {
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    phone: user?.phone || '',
    country: user?.country || '',
    state: user?.state || '',
    houseAddress: user?.billingAddress?.houseAddress || '',
    city: user?.billingAddress?.city || '',
    postalAddress: user?.billingAddress?.postalAddress || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      let token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      let res;
      try {
        res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/users/me', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
            phone: formData.phone,
            country: formData.country,
            state: formData.state,
            billingAddress: {
              houseAddress: formData.houseAddress,
              city: formData.city,
              postalAddress: formData.postalAddress,
            },
          }),
        });
      } catch (err) {
        if (err.cause?.status === 401) {
          try {
            token = await refreshAccessToken();
            res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/users/me', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              credentials: 'include',
              body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
                phone: formData.phone,
                country: formData.country,
                state: formData.state,
                billingAddress: {
                  houseAddress: formData.houseAddress,
                  city: formData.city,
                  postalAddress: formData.postalAddress,
                },
              }),
            });
          } catch (refreshErr) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return;
          }
        } else {
          throw err;
        }
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update user data');
      }
      setUser(data);
      setIsEditingAccount(false);
      setIsEditingBilling(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && <div className="text-red-600 text-center mb-4">{error}</div>}
      <h1 className="text-2xl font-semibold mb-8">Account Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Account Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between mb-6">
            <h2 className="text-lg font-semibold">Account Details</h2>
            <button
              onClick={() => setIsEditingAccount(!isEditingAccount)}
              className="text-sm text-green-600 hover:underline"
            >
              {isEditingAccount ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {isEditingAccount ? (
            <form onSubmit={handleSubmit} className="text-sm text-gray-700 space-y-3">
              <div>
                <strong>Full name:</strong>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <strong>Email address:</strong>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <strong>Date of birth:</strong>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <strong>Phone number:</strong>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <strong>Country:</strong>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <strong>State of residence:</strong>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <strong>Role:</strong>
                <p className="mt-1 text-gray-600">{user?.role || 'N/A'}</p>
              </div>
              <button
                type="submit"
                className="mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div className="text-sm text-gray-700 space-y-3">
              <p><strong>Full name:</strong> {user?.name || 'N/A'}</p>
              <p><strong>Email address:</strong> {user?.email || 'N/A'}</p>
              <p><strong>Date of birth:</strong> {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Phone number:</strong> {user?.phone || 'N/A'}</p>
              <p><strong>Country:</strong> {user?.country || 'N/A'}</p>
              <p><strong>State of residence:</strong> {user?.state || 'N/A'}</p>
              <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
            </div>
          )}
        </div>

        {/* Billing Address */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between mb-6">
            <h2 className="text-lg font-semibold">Billing Address</h2>
            <button
              onClick={() => setIsEditingBilling(!isEditingBilling)}
              className="text-sm text-green-600 hover:underline"
            >
              {isEditingBilling ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {isEditingBilling ? (
            <form onSubmit={handleSubmit} className="text-sm text-gray-700 space-y-3">
              <div>
                <strong>House address:</strong>
                <textarea
                  name="houseAddress"
                  value={formData.houseAddress}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>
              <div>
                <strong>City of residence:</strong>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <strong>Postal address:</strong>
                <input
                  type="text"
                  name="postalAddress"
                  value={formData.postalAddress}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                type="submit"
                className="mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div className="text-sm text-gray-700 space-y-3">
              <p><strong>House address:</strong> {user?.billingAddress?.houseAddress || 'N/A'}</p>
              <p><strong>City of residence:</strong> {user?.billingAddress?.city || 'N/A'}</p>
              <p><strong>Postal address:</strong> {user?.billingAddress?.postalAddress || 'N/A'}</p>
            </div>
          )}
        </div>

        {/* Eraiiz Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm border col-span-1 md:col-span-2">
          <h2 className="text-lg font-semibold mb-6">Eraiiz Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <p><strong>Number of purchases:</strong> {user?.eraizStats?.numberOfPurchases || 0}</p>
            <p><strong>Total amount spent:</strong> {user?.eraizStats?.totalAmountSpent.toLocaleString() || 0} NGN</p>
          </div>
        </div>
      </div>
    </>
  );
}