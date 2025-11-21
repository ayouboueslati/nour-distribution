'use client';

import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export default function NotAuthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-stone-800 mb-4">
          Accès Non Autorisé
        </h1>
        
        <p className="text-stone-600 mb-8">
          Vous devez être connecté pour accéder à cette page.
        </p>

        <Link
          href="/admin/login"
          className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-600 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Se connecter
        </Link>
      </div>
    </div>
  );
}