'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
        ? 'glass shadow-lg'
        : 'bg-white border-b border-stone-200'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-2xl font-light text-stone-800 tracking-wide group-hover:text-stone-600 transition-colors">
              Nour <span className="font-semibold">Distribution</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium relative group">
              Accueil
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/products" className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium relative group">
              Produits
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/contact" className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium relative group">
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>

          {/* Cart & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Link href="/cart" className="relative p-2 hover:bg-stone-50 rounded-lg transition-all duration-300 group">
              <ShoppingCart className="h-5 w-5 text-stone-700 group-hover:text-amber-600 transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-stone-800 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-medium animate-scale-in-bounce">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              className="md:hidden text-stone-700 hover:text-stone-900 transition-colors p-2 hover:bg-stone-50 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200 animate-slide-down">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-stone-600 hover:text-stone-900 transition-colors py-2 px-4 rounded-lg hover:bg-stone-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                href="/products"
                className="text-stone-600 hover:text-stone-900 transition-colors py-2 px-4 rounded-lg hover:bg-stone-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Produits
              </Link>
              <Link
                href="/contact"
                className="text-stone-600 hover:text-stone-900 transition-colors py-2 px-4 rounded-lg hover:bg-stone-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;