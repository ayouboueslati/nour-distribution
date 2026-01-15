'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { apiService } from '../../../../../lib/api';
import { notificationService } from '../../../../../lib/notifications';

export default function AvoirDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [avoir, setAvoir] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAvoir();
    }, [resolvedParams.id]);

    const loadAvoir = async () => {
        try {
            setLoading(true);
            const response = await apiService.getAvoirById(resolvedParams.id);
            setAvoir(response);
        } catch (error) {
            console.error('Error loading avoir:', error);
            notificationService.error('Erreur', 'Impossible de charger l\'avoir');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        try {
            const blob = await apiService.downloadPdf(resolvedParams.id, 'avoir');
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `AVOIR_${avoir.document_number}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            notificationService.error('Erreur', 'Impossible de télécharger le PDF');
        }
    };

    const formatAmount = (amount: number) => {
        return `${amount?.toFixed(2) || '0.00'} DT`;
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'en_attente': return 'bg-amber-100 text-amber-800';
            case 'valide': return 'bg-green-100 text-green-800';
            case 'annule': return 'bg-red-100 text-red-800';
            default: return 'bg-stone-100 text-stone-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'en_attente': return 'En attente';
            case 'valide': return 'Validé';
            case 'annule': return 'Annulé';
            default: return status || 'Inconnu';
        }
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

    if (!avoir) {
        return (
            <div className="p-6">
                <Card>
                    <div className="p-12 text-center">
                        <p className="text-stone-400 text-lg">Avoir introuvable</p>
                        <Link href="/admin/sales/avoirs" className="text-amber-600 hover:text-amber-700 mt-4 inline-block">
                            Retour aux avoirs
                        </Link>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <Link href="/admin/sales/avoirs" className="text-stone-900 hover:text-amber-600 font-medium">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-bold text-stone-900">Avoir {avoir.document_number}</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
                        <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(avoir.status)}`}>
                            {getStatusLabel(avoir.status)}
                        </span>
                        <span className="text-stone-700 font-medium text-sm md:text-base">
                            Du {new Date(avoir.issue_date).toLocaleDateString('fr-FR')}
                        </span>
                        {avoir.facture_id && (
                            <Link href={`/admin/sales/factures/${avoir.facture_id}`} className="text-xs md:text-sm text-blue-600 hover:underline flex items-center gap-1">
                                (Voir Facture source)
                            </Link>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 md:gap-3">
                    <Button variant="secondary" onClick={handleDownloadPdf}>
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Items */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-stone-900 mb-4">Articles concernés</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-stone-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-stone-900">Article</th>
                                            <th className="px-4 py-3 text-center text-sm font-medium text-stone-900">Qté</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-stone-900">Prix Unit.</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium text-stone-900">Montant</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-200">
                                        {avoir.items?.map((item: any, i: number) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-stone-900">{item.product_name || 'Article'}</p>
                                                </td>
                                                <td className="px-4 py-3 text-center text-stone-900">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right text-stone-900">{formatAmount(item.unit_price)}</td>
                                                <td className="px-4 py-3 text-right font-medium text-stone-900">{formatAmount(item.total_price)}</td>
                                            </tr>
                                        )) || (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-8 text-center text-stone-500">
                                                        Avoir global (sans détail d'articles)
                                                    </td>
                                                </tr>
                                            )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-stone-900 mb-3">Raison & Notes</h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-stone-500 font-medium tracking-wide uppercase">Raison de l'avoir</p>
                                    <p className="text-stone-900 font-medium">{avoir.reason || 'Retour produit'}</p>
                                </div>
                                {avoir.notes && (
                                    <div>
                                        <p className="text-sm text-stone-500 font-medium tracking-wide uppercase">Notes supplémentaires</p>
                                        <p className="text-stone-700 whitespace-pre-wrap">{avoir.notes}</p>
                                    </div>
                                )}
                            </div>
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
                                        {avoir.client?.company_name || `${avoir.client?.first_name || ''} ${avoir.client?.last_name || ''}` || 'Client Inconnu'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-stone-500 font-medium tracking-wide uppercase">Email</p>
                                    <p className="text-base font-bold text-stone-900">{avoir.client?.email || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-stone-500 font-medium tracking-wide uppercase">Téléphone</p>
                                    <p className="text-base font-bold text-stone-900">{avoir.client?.phone || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-stone-500 font-medium tracking-wide uppercase">Adresse</p>
                                    <p className="text-base font-bold text-stone-900">{avoir.client?.address || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Financial Summary */}
                    <Card>
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-stone-900 mb-4">Recapitulatif Financier</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-stone-600">Sous-total</span>
                                    <span className="font-medium text-stone-900">{formatAmount(avoir.subtotal || (avoir.total_amount / 1.19))}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-stone-600">TVA (19%)</span>
                                    <span className="font-medium text-stone-900">{formatAmount(avoir.tax_amount || (avoir.total_amount - (avoir.total_amount / 1.19)))}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t-2 border-stone-200">
                                    <span className="text-lg font-bold text-stone-900">Total Avoir TTC</span>
                                    <span className="text-lg font-bold text-amber-600">{formatAmount(avoir.total_amount)}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

