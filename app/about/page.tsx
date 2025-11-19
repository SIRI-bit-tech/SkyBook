import Breadcrumb from '@/components/navigation/Breadcrumb';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'About SkyBook - Your Trusted Flight Booking Partner',
  description: 'Learn about SkyBook, the platform for booking flights with confidence and real-time flight tracking.',
};

export default function AboutPage() {
  return (
    <>
      <Breadcrumb />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About SkyBook</h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              We are revolutionizing how people book flights with real-time data, secure payments, and innovative tracking.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Our Mission</h2>
                <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                  At SkyBook, our mission is to make flight booking simple, transparent, and trustworthy. We believe everyone deserves access to affordable flights with complete peace of mind.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  By combining real-time flight data, advanced search technology, and secure payment processing, we empower travelers to find and book the perfect flight every time.
                </p>
              </div>
              <div className="bg-sky-100 dark:bg-sky-900/30 rounded-lg p-8 border-2 border-sky-500">
                <svg className="w-16 h-16 text-sky-600 dark:text-sky-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L4 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-8-5z" />
                </svg>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Trust & Safety</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-2">Secured payments, verified airlines, and real-time tracking for complete transparency.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-slate-100 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Transparency',
                  description: 'No hidden fees. Real prices from day one. Complete information about flights, airlines, and availability.',
                  icon: '🔍',
                },
                {
                  title: 'Innovation',
                  description: 'Cutting-edge technology for real-time flight tracking, smart search, and seamless bookings.',
                  icon: '⚡',
                },
                {
                  title: 'Customer First',
                  description: '24/7 support, easy cancellations, and responsive service to every inquiry and concern.',
                  icon: '❤️',
                },
              ].map((value, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-md">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{value.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">By The Numbers</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { number: '500K+', label: 'Happy Travelers' },
                { number: '50+', label: 'Airlines Worldwide' },
                { number: '1000+', label: 'Destinations' },
                { number: '99.9%', label: 'Uptime' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-sky-600 dark:text-sky-400 mb-2">{stat.number}</div>
                  <p className="text-slate-600 dark:text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Book Your Next Flight?</h2>
            <p className="text-xl text-slate-300 mb-8">Join thousands of satisfied travelers booking flights with confidence.</p>
            <Link href="/flights/search">
              <button className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 active:scale-95">
                Search Flights Now
              </button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
