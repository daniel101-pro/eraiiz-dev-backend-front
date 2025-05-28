import { getSession } from '../../../../lib/auth'; // Adjust the import path as necessary
import ProductUploadForm from '../../../components/ProductUploadForm';
import DualNavbar from '../../../components/DualNavbar';

// Viewport export for themeColor
export const viewport = {
  themeColor: '#ffffff',
};

// Metadata export
export const metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'Seller Upload - Eraiiz',
  description: 'Upload products as a seller on Eraiiz.',
};

export default async function UploadProductPage() {
  const session = await getSession();
  console.log('Session:', session);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100">
        <DualNavbar />
        <main className="container mx-auto py-8 mt-20">
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Unauthorized</h2>
            <p className="text-red-600 text-center mb-6">Please sign in to access this page.</p>
            <a
              href="/login"
              className="block w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-200 font-semibold text-center"
            >
              Sign In
            </a>
          </div>
        </main>
      </div>
    );
  }

  if (session.role !== 'seller') {
    return (
      <div className="min-h-screen bg-gray-100">
        <DualNavbar />
        <main className="container mx-auto py-8 mt-20">
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
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DualNavbar />
      <main className="container mx-auto py-8 mt-20">
        <ProductUploadForm />
      </main>
    </div>
  );
}