'use client';

import { Shield, Headphones, Lock } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Shield className="w-8 h-8 text-[#1E3A5F]" />,
    title: 'Best Price Guarantee',
    description: 'Find the lowest fares on thousands of flights, backed by our price promise.',
  },
  {
    icon: <Headphones className="w-8 h-8 text-[#1E3A5F]" />,
    title: '24/7 Customer Support',
    description: 'Our dedicated support team is here to help you anytime you need us.',
  },
  {
    icon: <Lock className="w-8 h-8 text-[#1E3A5F]" />,
    title: 'Secure Booking',
    description: 'Book with confidence using our secure payment system that protects your data.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-3">
            Why Choose SkyBook?
          </h2>
          <p className="text-lg text-gray-600">
            Your trusted partner in travel
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-[#1E3A5F] mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
