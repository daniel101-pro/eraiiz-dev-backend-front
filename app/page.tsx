import React from "react";
import Image from "next/image";
import GridComponent from "./components/GridComponent";
import PlasticMadeProducts from "./components/PlasticMadeProducts";
import Opposite from "./components/Opposite";
import Opposite2 from "./components/Opposite2";
import Footer from "./components/Footer";
import CallToAction from "./components/CallToAction";

const page = () => {
  return (
    <>
      <div
        className="h-screen bg-no-repeat bg-top bg-contain"
        style={{ backgroundImage: "url('/Hero.png')" }}
      >
        <div className="flex justify-center">
          <Image
            src="/oneone.png"
            width={300}
            height={2}
            alt="oneone"
            className="mt-20 sm:mt-32"
          />
        </div>
        <div className="h-full w-full flex flex-col justify-center text-center -mt-20 sm:-mt-[250px] px-4 sm:px-6">
          <h1 className="text-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium mt-2 sm:mt-4 md:mt-6 leading-snug md:leading-relaxed text-center">
            Erase Waste By Shopping Quality Recycled{" "}
            <br className="hidden md:block" />
            Products From Eraiiz.
          </h1>

          <p className="text-black text-center font-light mt-2 sm:mt-4">
            Shop sustainably with Eraiiz and discover how waste can be transformed to wealth{" "}
            <br className="hidden sm:block" />
            while keeping the planet safe.
          </p>

          <div className="flex flex-row gap-4 justify-center mt-4 sm:mt-6">
            <button className="bg-[#008C00] text-white py-2 px-6 rounded-lg">
              Shop Now
            </button>
            <button className="bg-[#F8F8F8] text-black py-2 px-6 rounded-lg border border-[#D1D1D1]">
              Shop Now
            </button>
          </div>
        </div>

        <GridComponent />
        <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left Side: Heading */}
          <div>
            <h2 className="text-[45px] font-medium text-gray-900 leading-snug mt-10">
              Connecting Consumers with Sustainable Brands to Reduce{" "}
              <span className="text-[#008C00]">Carbon</span> Footprint
            </h2>
          </div>

          {/* Right Side: Paragraph + Button */}
          <div className="mt-16 md:mt-80">
            <p className="text-gray-700 mb-6">
              With a small team of passionate individuals, Eraiiz is focused on
              redefining climate action to include earthwise shopping models.
              Our mission is to bridge the gap between sustainable brands and
              global consumers thereby reducing the level of carbon footprint in
              the whole supply chain.
            </p>

            <button className="px-6 py-2 bg-[#008C00] text-white rounded-md hover:bg-black hover:text-white">
              Start Shopping
            </button>
          </div>
        </div>
        <div className="w-full flex flex-col items-center mt-20 mb-20">
          {/* Heading */}
          <h1 className="text-3xl font-medium text-center mb-6 text-black">
            Why Eraiiz?
          </h1>

          {/* Grid Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[950px] p-5">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-[250px]">
              <h2 className="font-light text-xl mb-10 text-black">
                Access to a network of top-picked sustainable choices
              </h2>
              <p className="text-gray-500">
                We pre-vet all products available on Eraiiz to ensure that they are sustainably sourced and made.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-[250px]">
              <h2 className="font-light text-black text-xl mb-10">
                Easy navigation process
              </h2>
              <p className="text-gray-500">
                Our platform is organized with you in mind, hence, you don&apos;t have to go through any hassle, from product sorting to checking out, we&apos;ve got you covered.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-[250px]">
              <h2 className="font-light text-black text-xl mb-10">
                Data-driven approach
              </h2>
              <p className="text-gray-500">
                We leverage data that are meticulously researched and work with experts to connect you with the best sustainable brand you need.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-[250px] flex flex-col justify-between">
              <p className="text-gray-500 mt-10">
                Sign Up &amp; Take your first step with Eraiiz to erase waste
              </p>
              <button className="bg-[#008C00] text-white font-semibold py-2 px-4 rounded-lg mt-4">
                Create your account
              </button>
            </div>
          </div>
          <Opposite />
          <PlasticMadeProducts />
          <Opposite2 />
          <CallToAction />
          <Footer />
        </div>
      </div>
    </>
  );
};

export default page;
