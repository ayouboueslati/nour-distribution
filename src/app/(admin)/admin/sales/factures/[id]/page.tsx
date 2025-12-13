'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, CreditCard, Banknote, Download } from 'lucide-react';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { apiService } from '../../../../../lib/api';
import { notificationService } from '../../../../../lib/notifications';

export default function FactureDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [facture, setFacture] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFacture();
    }, [resolvedParams.id]);

    const loadFacture = async () => {
        try {
            setLoading(true);
            const response = await apiService.getFactureById(resolvedParams.id);
            console.log('🧾 FACTURE LOADED:', response);
            setFacture(response);
        } catch (error) {
            console.error('Error loading facture:', error);
            notificationService.error('Erreur', 'Impossible de charger la facture');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async () => {
        if (!confirm('Marquer cette facture comme payée ?')) return;

        try {
            // Assuming a generic full payment for simplicity or update status directly
            await apiService.updateFacture(resolvedParams.id, { status: 'payee' });
            notificationService.success('Succès', 'Facture marquée comme payée');
            loadFacture();
        } catch (error) {
            console.error('Error updating facture:', error);
            notificationService.error('Erreur', 'Échec de la mise à jour');
        }
    };

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'payee' || s === 'paid') return 'bg-green-100 text-green-800';
        if (s === 'en_attente' || s === 'pending') return 'bg-amber-100 text-amber-800';
        if (s === 'en_retard' || s === 'overdue') return 'bg-red-100 text-red-800';
        return 'bg-stone-100 text-stone-800';
    };

    const getStatusLabel = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'payee' || s === 'paid') return 'Payée';
        if (s === 'en_attente' || s === 'pending') return 'En attente';
        if (s === 'en_retard' || s === 'overdue') return 'En retard';
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

    if (!facture) {
        return (
            <div className="p-6">
                <Card>
                    <div className="p-12 text-center">
                        <p className="text-stone-400 text-lg">Facture introuvable</p>
                        <Link href="/admin/sales/factures" className="text-amber-600 hover:text-amber-700 mt-4 inline-block">
                            Retour aux factures
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
                        <Link href="/admin/sales/factures" className="text-stone-900 hover:text-amber-600 font-medium">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-3xl font-bold text-stone-900">Facture {facture.document_number}</h1>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(facture.status)}`}>
                            {getStatusLabel(facture.status)}
                        </span>
                        <span className="text-stone-700 font-medium">
                            Du {new Date(facture.issue_date).toLocaleDateString('fr-FR')}
                        </span>
                        {facture.devis_id && (
                            <Link href={`/admin/sales/devis/${facture.devis_id}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                (Voir Devis lié)
                            </Link>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => window.print()}>
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimer
                    </Button>
                    {(facture.status === 'en_attente' || facture.status === 'pending' || facture.status === 'en_retard') && (
                        <Button onClick={handleMarkAsPaid} variant="primary">
                            <Banknote className="w-4 h-4 mr-2" />
                            Marquer comme Payée
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Items */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-stone-900 mb-4">Détails de la Facture</h2>
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
                                        {facture.items?.map((item: any, index: number) => (
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
                            <h2 className="text-lg font-semibold text-stone-900 mb-3">Notes & Conditions</h2>
                            <p className="text-stone-700 whitespace-pre-wrap">{facture.notes || "Paiement à réception."}</p>
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
                                    <p className="text-base font-bold text-stone-900">
                                        {facture.client?.company_name || `${facture.client?.first_name || ''} ${facture.client?.last_name || ''}` || 'Client Inconnu'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-stone-500 font-medium tracking-wide uppercase">Email</p>
                                    <p className="text-base font-bold text-stone-900">{facture.client?.email || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-stone-500 font-medium tracking-wide uppercase">Téléphone</p>
                                    <p className="text-base font-bold text-stone-900">{facture.client?.phone || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-stone-500 font-medium tracking-wide uppercase">Adresse</p>
                                    <p className="text-base font-bold text-stone-900">{facture.client?.address || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Totals */}
                    <Card>
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-stone-900 mb-4">Total à Payer</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-stone-600">Sous-total</span>
                                    <span className="font-medium text-stone-900">{formatAmount(facture.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-stone-600">TVA (19%)</span>
                                    <span className="font-medium text-stone-900">{formatAmount(facture.tax_amount)}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t-2 border-stone-200">
                                    <span className="text-lg font-bold text-stone-900">Total TTC</span>
                                    <span className="text-lg font-bold text-blue-600">{formatAmount(facture.total_amount)}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
