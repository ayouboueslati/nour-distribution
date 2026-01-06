'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { apiService } from '../../../lib/api';
import { DevisListResponse, DevisListItem } from '../../../../types/devis';

interface DevisTabProps {
    orderId: string;
}

export const DevisTab: React.FC<DevisTabProps> = ({ orderId }) => {
    const [devisData, setDevisData] = useState<DevisListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [includeVersions, setIncludeVersions] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        loadDevisList();
    }, [orderId, includeVersions, currentPage]);

    const loadDevisList = async () => {
        try {
            setLoading(true);
            const response = await apiService.getOrderDevisList(orderId, {
                include_versions: includeVersions,
                skip: currentPage * pageSize,
                limit: pageSize
            });
            setDevisData(response);
        } catch (error) {
            console.error('Error loading devis list:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
        const s = status?.toLowerCase();
        if (s === 'brouillon' || s === 'draft') return 'default';
        if (s === 'en_attente' || s === 'pending') return 'warning';
        if (s === 'accepte' || s === 'accepted') return 'success';
        if (s === 'facture' || s === 'invoiced') return 'info';
        if (s === 'annule' || s === 'cancelled') return 'danger';
        if (s === 'paye' || s === 'paid') return 'success';
        return 'default';
    };

    const getStatusLabel = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'brouillon' || s === 'draft') return 'Brouillon';
        if (s === 'en_attente' || s === 'pending') return 'En attente';
        if (s === 'accepte' || s === 'accepted') return 'Accepté';
        if (s === 'facture' || s === 'invoiced') return 'Converti';
        if (s === 'annule' || s === 'cancelled') return 'Annulé';
        if (s === 'paye' || s === 'paid') return 'Payé';
        return status;
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount) + ' DT';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <Card>
                <div className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-stone-200 rounded w-1/4"></div>
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-stone-100 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    if (!devisData || devisData.devis_list.length === 0) {
        return (
            <Card>
                <div className="p-12 text-center">
                    <FileText className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-stone-900 mb-2">Aucun devis</h3>
                    <p className="text-stone-600">
                        Aucun devis n'a encore été créé pour cette commande.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with badge and version toggle */}
            <Card>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-stone-900">Liste des Devis</h2>
                            <Badge variant="info" size="md">
                                {devisData.total} {devisData.total > 1 ? 'Devis' : 'Devis'}
                            </Badge>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeVersions}
                                onChange={(e) => {
                                    setIncludeVersions(e.target.checked);
                                    setCurrentPage(0); // Reset to first page when toggling
                                }}
                                className="w-4 h-4 text-amber-600 bg-stone-100 border-stone-300 rounded focus:ring-amber-500 focus:ring-2"
                            />
                            <span className="text-sm font-medium text-stone-700">
                                Afficher toutes les versions
                            </span>
                        </label>
                    </div>

                    {/* Devis Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-stone-50 border-b-2 border-stone-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-stone-900">
                                        Numéro de Devis
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-stone-900">
                                        Version
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-stone-900">
                                        Statut
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-stone-900">
                                        Montant
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-stone-900">
                                        Date de création
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-stone-900">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-200">
                                {devisData.devis_list.map((devis: DevisListItem) => (
                                    <tr
                                        key={devis.id}
                                        className="hover:bg-stone-50 transition-colors"
                                    >
                                        <td className="px-4 py-4">
                                            <Link
                                                href={`/admin/sales/devis/${devis.id}`}
                                                className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                {devis.document_number || devis.devis_number}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <Badge variant="default" size="sm">
                                                v{devis.version}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <Badge variant={getStatusColor(devis.status)} size="sm">
                                                {getStatusLabel(devis.status)}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-right font-semibold text-stone-900">
                                            {formatAmount(devis.total_amount)}
                                        </td>
                                        <td className="px-4 py-4 text-center text-sm text-stone-900 font-medium">
                                            {formatDate(devis.created_at)}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <Link href={`/admin/sales/devis/${devis.id}`}>
                                                <Button variant="secondary" size="sm">
                                                    Voir détails
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {devisData.total > pageSize && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-200">
                            <div className="text-sm text-stone-600">
                                Page {currentPage + 1} sur {Math.ceil(devisData.total / pageSize)}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    disabled={!devisData.has_previous}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Précédent
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    disabled={!devisData.has_next}
                                >
                                    Suivant
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};
