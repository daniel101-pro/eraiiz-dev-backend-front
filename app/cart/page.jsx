'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import DualNavbar from '../components/DualNavbar';

export default function CartPage() {
    useEffect(() => {
        document.title = 'Cart | Eraiz';
    }, []);

    return (
        <>

            <DualNavbar />

            <a
                href="/"
                className="text-sm text-black hover:text-green-600 bg-green-50 w-[114px] flex px-2 py-1 rounded-lg mt-[120px] md:mx-10 lg:mx-[300px] mx-6 border border-green-200 -mt-1"
            >
                <span className="mr-2 text-green-500">1</span>Cart Review
            </a>
            <div className="min-h-screen bg-white flex flex-col items-center justify-center ">

                {/* Main Content */}
                <div className="max-w-md mx-auto p-6 flex flex-col items-center text-center -mt-60">
                    {/* Illustration */}
                    <div className="mb-6">
                        <Image
                            src="/empty-cart.png"
                            alt="Empty cart illustration"
                            width={200}
                            height={200}
                            className="object-contain"
                        />
                    </div>

                    {/* Message */}
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Oops! Your cart is currently empty</h1>
                    <p className="text-sm text-gray-600 mb-6">
                        It looks like you haven’t added anything just yet. Browse through our collections and find something you love. Once you’re ready, come back here to review and check out your items!
                    </p>

                    {/* Button */}
                    <a
                        href="categories"
                        className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition duration-200">
                        <button >
                            Add items to cart
                        </button>
                    </a>
                </div>
            </div>
        </>
    );
}