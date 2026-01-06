'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import FactureForm from '@/app/components/features/sales/FactureForm';

export default function NewFacturePage() {
    return (
        <div className="p-6 space-y-6 bg-stone-50 min-h-screen">
            {/* Top Navigation */}
            <div className="flex items-center gap-4 max-w-7xl mx-auto">
                <Link
                    href="/admin/sales/factures"
                    className="p-2 bg-white border border-stone-200 rounded-full hover:bg-stone-50 hover:border-amber-500 hover:text-amber-600 transition-all shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Facturation</span>
                    <h2 className="text-xl font-bold text-stone-800">Gestion des Ventes</h2>
                </div>
            </div>

            <FactureForm />
        </div>
    );
}
