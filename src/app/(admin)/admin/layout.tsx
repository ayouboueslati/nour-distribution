'use client';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
 { name: 'Tableau de Bord', href: '/admin/dashboard', icon: '📊' },
  { name: 'Commandes', href: '/admin/orders', icon: '📋' },
  { name: 'Devis', href: '/admin/sales/devis', icon: '📄' },
  { name: 'Factures', href: '/admin/sales/factures', icon: '🧾' },
  { name: 'Avoirs', href: '/admin/sales/avoirs', icon: '💳' },
  { name: 'Clients', href: '/admin/clients', icon: '👥' },
  { name: 'Produits', href: '/admin/products', icon: '📦' },
  { name: 'Fournisseurs', href: '/admin/suppliers', icon: '🏭' },
  { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
];

export default function AdminLayout({
    children,
}:{
    children: React.ReactNode;
}){
    const [sidebarOpen, setSidebarOpen]= useState(false);
    const  pathname = usePathname();
    return (
    <div className="flex h-screen bg-stone-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-stone-200">
            <h1 className="text-xl font-light text-stone-800">Nour Distribution</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="bg-white shadow-sm border-b border-stone-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            >
              <span className="text-xl">☰</span>
            </button>
            <h1 className="text-lg font-light text-stone-800">Nour Distribution</h1>
            <div className="w-8"></div>
          </div>
        </header>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}