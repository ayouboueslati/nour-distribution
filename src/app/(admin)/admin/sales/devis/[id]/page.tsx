'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, ArrowLeft, Printer, FileCheck } from 'lucide-react';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { apiService } from '../../../../../lib/api';
import { notificationService } from '../../../../../lib/notifications';

export default function DevisDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [devis, setDevis] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDevis();
    }, [resolvedParams.id]);

    const loadDevis = async () => {
        try {
            setLoading(true);
            const response = await apiService.getDevisById(resolvedParams.id);
            console.log('📄 DEVIS LOADED:', response);
            setDevis(response);
        } catch (error) {
            console.error('Error loading devis:', error);
            notificationService.error('Erreur', 'Impossible de charger le devis');
        } finally {
            setLoading(false);
        }
    };

    const handleConvertToFacture = async () => {
        if (!confirm('Convertir ce devis en facture ?')) return;

        try {
            await apiService.convertDevisToFacture(resolvedParams.id);
            notificationService.success('Succès', 'Devis converti en facture');
            router.push('/admin/sales/factures');
        } catch (error) {
            console.error('Error converting devis:', error);
            notificationService.error('Erreur', 'Échec de la conversion');
        }
    };

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'en_attente' || s === 'pending') return 'bg-amber-100 text-amber-800';
        if (s === 'accepte' || s === 'accepted') return 'bg-green-100 text-green-800';
        if (s === 'refuse' || s === 'rejected') return 'bg-red-100 text-red-800';
        if (s === 'facture' || s === 'invoiced') return 'bg-blue-100 text-blue-800';
        return 'bg-stone-100 text-stone-800';
    };

    const getStatusLabel = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'en_attente' || s === 'pending') return 'En attente';
        if (s === 'accepte' || s === 'accepted') return 'Accepté';
        if (s === 'refuse' || s === 'rejected') return 'Refusé';
        if (s === 'facture' || s === 'invoiced') return 'Facturé';
        return status;
    };

    const formatAmount = (amount: number) => {
        return `${amount?.toFixed(2) || '0.00'} DT`;
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                </div>
            </div>
        );
    }

    if (!devis) {
        return (
            <div className="p-6">
                <Card>
                    <div className="p-12 text-center">
                        <p className="text-stone-400 text-lg">Devis introuvable</p>
                        <Link href="/admin/sales/devis" className="text-amber-600 hover:text-amber-700 mt-4 inline-block">
                            Retour aux devis
                        </Link>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <Link href="/admin/sales/devis" className="text-stone-900 hover:text-amber-600 font-medium">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-3xl font-bold text-stone-900">Devis {devis.devis_number}</h1>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(devis.status)}`}>
                            {getStatusLabel(devis.status)}
                        </span>
                        <span className="text-stone-700 font-medium">
                            {new Date(devis.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </span>
                        {devis.order_id && (
                            <Link href={`/admin/orders/${devis.order_id}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                (Commande liée)
                            </Link>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => window.print()}>
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimer
                    </Button>
                    {devis.status !== 'facture' && devis.status !== 'refuse' && (
                        <Button onClick={handleConvertToFacture} variant="primary">
                            <FileCheck className="w-4 h-4 mr-2" />
                            Convertir en Facture
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Items */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-stone-900 mb-4">Détails du Devis</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-stone-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-stone-900">Description</th>
                                            <th className="px-4 py-3 text-center text-sm font-medium text-stone-900">Qté</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-stone-900">Prix Unit.</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-stone-900">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-200">
                                        {devis.items?.map((item: any, index: number) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-stone-900">{item.product_name || item.description || 'Article'}</p>
                                                </td>
                                                <td className="px-4 py-3 text-center text-stone-900">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right text-stone-900">{formatAmount(item.unit_price)}</td>
                                                <td className="px-4 py-3 text-right font-medium text-stone-900">{formatAmount(item.total_price || (item.quantity * item.unit_price))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-stone-900 mb-3">Notes</h2>
                            <p className="text-stone-700 whitespace-pre-wrap">{devis.notes || "Aucune note particulière."}</p>
                        </div>
                    </Card>
                </div>

                {/* Sidebar: Client & Totals */}
                <div className="space-y-6">
                    {/* Client Info */}
                    <Card>
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-stone-900 mb-4">Client</h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-stone-500 font-medium tracking-wide uppercase">Nom</p>
                                    {/* Using text-stone-900 for high visibility */}
                                    <p className="text-base font-bold text-stone-900">
                                        {devis.client?.company_name || `${devis.client?.first_name || ''} ${devis.client?.last_name || ''}` || 'Client Inconnu'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-stone-500 font-medium tracking-wide uppercase">Email</p>
                                    <p className="text-base font-bold text-stone-900">{devis.client?.email || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-stone-500 font-medium tracking-wide uppercase">Téléphone</p>
                                    <p className="text-base font-bold text-stone-900">{devis.client?.phone || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-stone-500 font-medium tracking-wide uppercase">Adresse</p>
                                    <p className="text-base font-bold text-stone-900">{devis.client?.address || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Totals */}
                    <Card>
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-stone-900 mb-4">Total</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-stone-600">Sous-total</span>
                                    <span className="font-medium text-stone-900">{formatAmount(devis.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-stone-600">TVA (19%)</span>
                                    <span className="font-medium text-stone-900">{formatAmount(devis.tax_amount)}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t-2 border-stone-200">
                                    <span className="text-lg font-bold text-stone-900">Total TTC</span>
                                    <span className="text-lg font-bold text-amber-600">{formatAmount(devis.total_amount)}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
