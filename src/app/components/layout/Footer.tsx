'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const Footer = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.getElementById('footer');
      if (footer) {
        const rect = footer.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
        setVisible(isVisible);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer
      id="footer"
      className={`bg-white border-t border-stone-200 relative overflow-hidden transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'
        }`}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-50/30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 animate-fade-in-up">
            <span className="text-xl font-light text-stone-800">
              Nour <span className="font-semibold">Distribution</span>
            </span>
            <p className="text-stone-600 mt-4 max-w-sm leading-relaxed">
              Distribution professionnelle de cheveux de tresse africaine pour vos besoins B2B et B2C.
            </p>
          </div>

          <div className="animate-fade-in-up delay-100">
            <h4 className="font-medium text-stone-900 mb-4">Navigation</h4>
            <ul className="space-y-2 text-stone-600 text-sm">
              <li>
                <Link href="/" className="hover:text-amber-600 transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Accueil</span>
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-amber-600 transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Produits</span>
                </Link>
              </li>
              <li>
                <a href="#contact" className="hover:text-amber-600 transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Contact</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="animate-fade-in-up delay-200">
            <h4 className="font-medium text-stone-900 mb-4">Contact</h4>
            <ul className="space-y-2 text-stone-600 text-sm">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Tunis, Tunisie
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                contact@nourdistribution.com
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +216 XX XXX XXX
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-200 pt-8 text-center text-stone-500 text-sm animate-fade-in delay-300">
          <p>&copy; 2024 Nour Distribution. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;