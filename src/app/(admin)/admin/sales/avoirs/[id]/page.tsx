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

    const formatAmount = (amount: number) => {
        return `${amount?.toFixed(2) || '0.00'} DT`;
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

    if (loading) {
        return <div className="p-6 text-center">Chargement de l'avoir...</div>;
    }

    if (!avoir) {
        return <div className="p-6 text-center">Avoir introuvable</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Link href="/admin/sales/avoirs" className="text-stone-900 hover:text-amber-600">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold">Avoir {avoir.document_number}</h1>
                </div>
                <Button variant="secondary" onClick={handleDownloadPdf}>
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger PDF
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Articles concernés</h2>
                            <table className="w-full">
                                <thead className="bg-stone-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Article</th>
                                        <th className="px-4 py-2 text-center">Qté</th>
                                        <th className="px-4 py-2 text-right">Montant</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {avoir.video_items?.map((item: any, i: number) => (
                                        <tr key={i} className="border-t border-stone-100">
                                            <td className="px-4 py-3">{item.product_name || 'Article'}</td>
                                            <td className="px-4 py-3 text-center">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right">{formatAmount(item.total_price)}</td>
                                        </tr>
                                    )) || (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-8 text-center text-stone-500">
                                                    Avoir global (sans détail d'articles)
                                                </td>
                                            </tr>
                                        )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-stone-500 uppercase">Facture d'origine</p>
                                <Link href={`/admin/sales/factures/${avoir.facture_id}`} className="text-blue-600 font-medium hover:underline">
                                    Voir la facture source
                                </Link>
                            </div>
                            <div>
                                <p className="text-sm text-stone-500 uppercase">Montant Avoir</p>
                                <p className="text-2xl font-bold text-stone-900">{formatAmount(avoir.total_amount)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-stone-500 uppercase">Raison</p>
                                <p className="font-medium">{avoir.reason}</p>
                            </div>
                            <div>
                                <p className="text-sm text-stone-500 uppercase">Date</p>
                                <p className="font-medium">{new Date(avoir.issue_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
