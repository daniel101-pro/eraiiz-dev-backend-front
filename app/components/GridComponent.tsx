import React from 'react';

const GridComponent = () => {
  const items = [
    { id: 1, image: '/image1.png', text: 'Plastic Made Products' },
    { id: 2, image: '/image2.png', text: 'Glass Made Products' },
    { id: 3, image: '/image3.png', text: 'Rubber Made Products' },
    { id: 4, image: '/image4.png', text: 'Others' },
  ];

  return (
    <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-md -mt-36">
      {items.map((item) => (
        <div 
          key={item.id} 
          className="relative h-64 bg-cover bg-center text-white flex items-end p-4 rounded-md"
          style={{ backgroundImage: `url(${item.image})` }}
        >
          <div className="bg-black/50 p-2 rounded">
            <p className="text-sm">{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GridComponent;
