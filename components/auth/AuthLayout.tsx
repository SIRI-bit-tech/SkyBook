'use client';

import Image from 'next/image';
import { Plane } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <Image
          src="/carousel/flight-1.jpg"
          alt="Flight background"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A5F]/80 via-[#2A4A73]/70 to-[#1E3A5F]/80" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Discover Your Next
            <br />
            Destination
          </h1>
          <p className="text-xl text-white/90 leading-relaxed">
            Book flights with ease and confidence. Your
            <br />
            adventure starts here with SkyBook.
          </p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-[#1E3A5F] p-4 rounded-2xl">
              <Plane className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
