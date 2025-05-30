import ProductUploadForm from '../../../components/ProductUploadForm';
import DualNavbar from '../../../components/DualNavbar';

// Viewport export for themeColor
export const viewport = {
  themeColor: '#ffffff',
};

// Metadata export
export const metadata = {
  metadataBase: new URL('http://localhost:3001'),
  title: 'Seller Upload - Eraiiz',
  description: 'Upload products as a seller on Eraiiz.',
};

export default function UploadProductPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <DualNavbar />
      <main className="container mx-auto py-8 mt-20">
        <ProductUploadForm />
      </main>
    </div>
  );
}