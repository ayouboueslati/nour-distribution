'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, CreditCard, Banknote, Download } from 'lucide-react';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { SourceDevisSection } from '../../../../../components/features/devis/SourceDevisSection';
import { PaymentModal } from '../../../../../components/features/payments/PaymentModal';
import { AvoirModal } from '../../../../../components/features/sales/AvoirModal';
import { apiService } from '../../../../../lib/api';
import { notificationService } from '../../../../../lib/notifications';

export default function FactureDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [facture, setFacture] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isAvoirModalOpen, setIsAvoirModalOpen] = useState(false);

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

    const handlePaymentSuccess = () => {
        loadFacture();
    };

    const handleDownloadPdf = async () => {
        try {
            const blob = await apiService.downloadPdf(resolvedParams.id, 'facture');
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `FACTURE_${facture.document_number}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            notificationService.error('Erreur', 'Impossible de télécharger le PDF');
        }
    };

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'payee' || s === 'paid') return 'bg-green-100 text-green-800';
        if (s === 'partiel' || s === 'partially_paid') return 'bg-blue-100 text-blue-800';
        if (s === 'en_attente' || s === 'pending') return 'bg-amber-100 text-amber-800';
        if (s === 'en_retard' || s === 'overdue') return 'bg-red-100 text-red-800';
        return 'bg-stone-100 text-stone-800';
    };

    const getStatusLabel = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'payee' || s === 'paid') return 'Payée';
        if (s === 'partiel' || s === 'partially_paid') return 'Partiellement Payée';
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
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <Link href="/admin/sales/factures" className="text-stone-900 hover:text-amber-600 font-medium">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-bold text-stone-900">Facture {facture.document_number}</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
                        <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(facture.status)}`}>
                            {getStatusLabel(facture.status)}
                        </span>
                        <span className="text-stone-700 font-medium text-sm md:text-base">
                            Du {new Date(facture.issue_date).toLocaleDateString('fr-FR')}
                        </span>
                        {facture.devis_id && (
                            <Link href={`/admin/sales/devis/${facture.devis_id}`} className="text-xs md:text-sm text-blue-600 hover:underline flex items-center gap-1">
                                (Voir Devis lié)
                            </Link>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 md:gap-3">
                    <Button variant="secondary" onClick={handleDownloadPdf} className="flex-1 sm:flex-none">
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger PDF
                    </Button>
                    <Link href={`/admin/sales/factures/${facture.id}/edit`} className="flex-1 sm:flex-none">
                        <Button variant="secondary" className="w-full">
                            Modifier
                        </Button>
                    </Link>
                    {facture.status !== 'payee' && facture.status !== 'paid' && (
                        <Button onClick={() => setIsPaymentModalOpen(true)} variant="primary" className="flex-1 sm:flex-none w-full sm:w-auto">
                            <Banknote className="w-4 h-4 mr-2" />
                            Encaisser / Ajouter Paiement
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        className="flex-1 sm:flex-none bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                        onClick={() => setIsAvoirModalOpen(true)}
                    >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Générer Avoir
                    </Button>
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
                                {facture.payment_terms && (
                                    <div className="pt-2 border-t border-stone-100">
                                        <p className="text-sm text-stone-500 font-medium tracking-wide uppercase">Conditions de Paiement</p>
                                        <p className="text-base font-bold text-blue-600 uppercase">{facture.payment_terms.replace('_', ' ')}</p>
                                    </div>
                                )}
                                {facture.payment_deadline && (
                                    <div>
                                        <p className="text-sm text-stone-500 font-medium tracking-wide uppercase">Échéance</p>
                                        <p className="text-base font-bold text-red-600">{new Date(facture.payment_deadline).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Source Devis Section */}
                    <SourceDevisSection factureId={resolvedParams.id} />

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
                                    <span className="text-lg font-bold text-stone-900">{formatAmount(facture.total_amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-stone-600">Déjà payé</span>
                                    <span className="font-medium text-emerald-600">{formatAmount(facture.paid_amount || 0)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-stone-100">
                                    <span className="font-bold text-stone-900 uppercase text-xs tracking-wider">Reste à payer</span>
                                    <span className="text-xl font-bold text-blue-600">
                                        {formatAmount(facture.remaining_amount !== undefined ? facture.remaining_amount : (facture.total_amount - (facture.paid_amount || 0)))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                factureId={facture.id}
                factureNumber={facture.document_number}
                remainingAmount={facture.remaining_amount !== undefined ? facture.remaining_amount : (facture.total_amount - (facture.paid_amount || 0))}
                onSuccess={handlePaymentSuccess}
            />

            <AvoirModal
                isOpen={isAvoirModalOpen}
                onClose={() => setIsAvoirModalOpen(false)}
                factureId={facture.id}
                factureNumber={facture.document_number}
                factureTotal={facture.total_amount}
                onSuccess={() => {
                    loadFacture();
                    router.push('/admin/sales/avoirs');
                }}
            />
        </div>
    );
}
