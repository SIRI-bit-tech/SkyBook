'use client';

import { useState } from 'react';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import Footer from '@/components/layout/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitMessage('Thank you! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);

    setTimeout(() => setSubmitMessage(''), 5000);
  };

  return (
    <>
      <Breadcrumb />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-slate-300">We are here to help. Get in touch with our support team.</p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Get in Touch</h2>
                
                <div className="space-y-6 mb-8">
                  {[
                    {
                      icon: '📧',
                      title: 'Email',
                      description: 'support@skybook.com',
                      link: 'mailto:support@skybook.com',
                    },
                    {
                      icon: '📱',
                      title: 'Phone',
                      description: '+1 (800) SKY-BOOK',
                      link: 'tel:+18005959265',
                    },
                    {
                      icon: '🏢',
                      title: 'Address',
                      description: '123 Sky Avenue, Cloud City, CC 12345',
                      link: '#',
                    },
                    {
                      icon: '⏰',
                      title: 'Hours',
                      description: '24/7 Customer Support',
                      link: '#',
                    },
                  ].map((item, index) => (
                    <a
                      key={index}
                      href={item.link}
                      className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-all duration-200"
                    >
                      <div className="text-2xl">{item.icon}</div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">{item.description}</p>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Social Media */}
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Follow Us</h3>
                  <div className="flex gap-4">
                    {['Facebook', 'Twitter', 'LinkedIn', 'Instagram'].map((social, index) => (
                      <a
                        key={index}
                        href="#"
                        className="w-10 h-10 bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-400 rounded-full flex items-center justify-center hover:bg-sky-200 dark:hover:bg-sky-800 transition-colors"
                        aria-label={social}
                      >
                        {social.charAt(0)}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Send us a Message</h2>
                
                {submitMessage && (
                  <div className="mb-6 p-4 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded-lg">
                    {submitMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                      placeholder="Your message here..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 active:scale-95"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
