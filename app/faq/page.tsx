'use client';

import { useState } from 'react';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import Footer from '@/components/layout/Footer';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I book a flight on SkyBook?',
      answer: 'Simply enter your departure city, destination, and travel dates. Browse available flights from major airlines, select your preferred option, choose seats, enter passenger details, and complete payment. You will receive a digital ticket with QR code immediately.',
    },
    {
      question: 'Can I change or cancel my booking?',
      answer: 'Yes, you can manage your booking from your account. Cancellation policies vary by airline and ticket type. Some bookings allow free cancellations up to 24 hours before departure, while others may have fees.',
    },
    {
      question: 'How do I track my flight?',
      answer: 'Visit our Flight Tracking page and enter your flight number. You will see real-time updates including current location, altitude, speed, estimated arrival time, and any delays.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and digital wallets through Stripe. All payments are secure and encrypted.',
    },
    {
      question: 'How do I get my digital ticket?',
      answer: 'After successful payment, you will receive your e-ticket immediately with a unique QR code. You can download it from your account or access it through the confirmation email.',
    },
    {
      question: 'Can I book multiple passengers at once?',
      answer: 'Yes, you can add up to 9 passengers per booking. Enter details for each passenger including name, date of birth, and contact information.',
    },
    {
      question: 'What if my flight is delayed or cancelled?',
      answer: 'You will receive real-time notifications of any changes. You can view alternative flights and book rebooking options directly through your account.',
    },
    {
      question: 'Is baggage included in my ticket?',
      answer: 'Baggage allowance depends on your selected airline and ticket type. You can select additional baggage during booking. Check your confirmation for included allowances.',
    },
    {
      question: 'How can I contact customer support?',
      answer: 'We offer 24/7 support via email (support@skybook.com), phone (+1 800 SKY-BOOK), and live chat on our website. Visit our Contact page for more details.',
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Yes, we use industry-standard encryption and security protocols. Your data is protected and never shared with third parties without consent.',
    },
  ];

  return (
    <>
      <Breadcrumb />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
            <p className="text-xl text-slate-300">Find answers to common questions about booking flights with SkyBook.</p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg pr-6">{faq.question}</h3>
                    <svg
                      className={`w-5 h-5 text-sky-500 flex-shrink-0 transition-transform duration-300 ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>

                  {openIndex === index && (
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="mt-16 bg-sky-100 dark:bg-sky-900 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Didn't find what you are looking for?</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-6">Our support team is here to help 24/7.</p>
              <a href="/contact" className="inline-block bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 active:scale-95">
                Contact Support
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
