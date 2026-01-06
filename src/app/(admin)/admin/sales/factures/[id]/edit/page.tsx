'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import FactureForm from '@/app/components/features/sales/FactureForm';
import { apiService } from '@/app/lib/api';
import { notificationService } from '@/app/lib/notifications';

export default function EditFacturePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [facture, setFacture] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFacture = async () => {
            try {
                setLoading(true);
                const data = await apiService.getFactureById(resolvedParams.id);
                setFacture(data);
            } catch (error) {
                console.error('Error loading facture:', error);
                notificationService.error('Erreur', 'Impossible de charger la facture');
            } finally {
                setLoading(false);
            }
        };
        loadFacture();
    }, [resolvedParams.id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 gap-4">
                <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
                <p className="text-stone-500 font-medium">Chargement de la facture...</p>
            </div>
        );
    }

    if (!facture) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 gap-6 p-6 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 max-w-md">
                    <h2 className="text-2xl font-bold text-stone-800 mb-2">Facture introuvable</h2>
                    <p className="text-stone-500 mb-6">Le document que vous essayez de modifier n'existe pas ou a été supprimé.</p>
                    <Link href="/admin/sales/factures">
                        <button className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition-all">
                            Retour aux factures
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-stone-50 min-h-screen">
            {/* Top Navigation */}
            <div className="flex items-center gap-4 max-w-7xl mx-auto">
                <Link
                    href={`/admin/sales/factures/${resolvedParams.id}`}
                    className="p-2 bg-white border border-stone-200 rounded-full hover:bg-stone-50 hover:border-amber-500 hover:text-amber-600 transition-all shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Modification</span>
                    <h2 className="text-xl font-bold text-stone-800">Modifier Facture {facture.document_number}</h2>
                </div>
            </div>

            <FactureForm initialData={facture} isEdit={true} />
        </div>
    );
}
