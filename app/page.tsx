'use client';

import Header from '@/components/layout/Header';
import HeroSection from '@/components/hero/HeroSection';
import PopularDestinations from '@/components/shared/PopularDestinations';
import WhyChooseUs from '@/components/shared/WhyChooseUs';
import AirlinesSection from '@/components/shared/AirlinesSection';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <PopularDestinations />
      <WhyChooseUs />
      <AirlinesSection />
      <Footer />
    </div>
  );
}
