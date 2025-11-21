'use client';

import Image from 'next/image';

const airlines = [
  {
    name: 'Delta',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Delta_logo.svg',
  },
  {
    name: 'Emirates',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/Emirates-Logo.png',
  },
  {
    name: 'United',
    logo: 'https://1000logos.net/wp-content/uploads/2017/06/United-Airlines-Logo.png',
  },
  {
    name: 'British Airways',
    logo: 'https://1000logos.net/wp-content/uploads/2016/10/British-Airways-Logo.png',
  },
  {
    name: 'Qatar Airways',
    logo: 'https://logos-world.net/wp-content/uploads/2020/03/Qatar-Airways-Logo.png',
  },
];

export default function AirlinesSection() {
  return (
    <section className="py-16 px-4 bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-center text-3xl md:text-4xl font-bold text-gray-900 mb-12">
          Fly with the world&apos;s leading airlines
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
          {airlines.map((airline, index) => (
            <div
              key={index}
              className="w-48 h-32 relative grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100"
            >
              <Image
                src={airline.logo}
                alt={airline.name}
                fill
                className="object-contain p-6"
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
