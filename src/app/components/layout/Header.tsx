'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <header className="bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-light text-stone-800 tracking-wide">
              Nour <span className="font-semibold">Distribution</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium">
              Accueil
            </Link>
            <Link href="/products" className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium">
              Produits
            </Link>
            <a href="#contact" className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium">
              Contact
            </a>
          </nav>

          {/* Cart & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Link href="/cart" className="relative p-2 hover:bg-stone-50 rounded-lg transition-colors">
              <ShoppingCart className="h-5 w-5 text-stone-700" />
              <span className="absolute -top-1 -right-1 bg-stone-800 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {totalItems}
              </span>
            </Link>

            <button
              className="md:hidden text-stone-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200">
            <nav className="flex flex-col space-y-3">
              <Link href="/" className="text-stone-600 hover:text-stone-900 transition-colors py-2">
                Accueil
              </Link>
              <Link href="/products" className="text-stone-600 hover:text-stone-900 transition-colors py-2">
                Produits
              </Link>
              <a href="#contact" className="text-stone-600 hover:text-stone-900 transition-colors py-2">
                Contact
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;