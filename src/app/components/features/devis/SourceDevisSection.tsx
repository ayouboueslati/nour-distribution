'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, AlertCircle } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { apiService } from '../../../lib/api';

interface SourceDevisSectionProps {
    factureId: string;
}

export const SourceDevisSection: React.FC<SourceDevisSectionProps> = ({ factureId }) => {
    const [sourceDevis, setSourceDevis] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        loadSourceDevis();
    }, [factureId]);

    const loadSourceDevis = async () => {
        try {
            setLoading(true);
            setNotFound(false);
            const response = await apiService.getFactureSourceDevis(factureId);
            setSourceDevis(response);
        } catch (error: any) {
            // Handle 404 - facture was created directly without a devis
            if (error.message?.includes('404') || error.message?.includes('not found')) {
                setNotFound(true);
            } else {
                console.error('Error loading source devis:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount) + ' DT';
    };

    if (loading) {
        return (
            <Card>
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-stone-900 mb-4">Devis Source</h3>
                    <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-stone-200 rounded w-1/3"></div>
                        <div className="h-4 bg-stone-100 rounded w-1/2"></div>
                    </div>
                </div>
            </Card>
        );
    }

    if (notFound || !sourceDevis) {
        return (
            <Card className="border-amber-200 bg-amber-50">
                <div className="p-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-amber-900 mb-1">
                                Créée directement
                            </h3>
                            <p className="text-sm text-amber-800">
                                Cette facture a été créée directement, sans devis source.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border-blue-200">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-stone-900">Devis Source</h3>
                </div>

                <div className="space-y-3">
                    <div>
                        <p className="text-sm text-stone-600 font-medium">Numéro de devis</p>
                        <p className="text-base font-bold text-stone-900">
                            {sourceDevis.document_number || sourceDevis.devis_number}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-sm text-stone-600 font-medium">Version</p>
                            <p className="text-base font-semibold text-stone-900">
                                v{sourceDevis.version}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-stone-600 font-medium">Montant</p>
                            <p className="text-base font-semibold text-amber-600">
                                {formatAmount(sourceDevis.total_amount)}
                            </p>
                        </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-stone-200">
                        <Link href={`/admin/sales/devis/${sourceDevis.id}`}>
                            <Button variant="primary" size="sm" className="w-full">
                                <FileText className="w-4 h-4 mr-2" />
                                Voir le devis source
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </Card>
    );
};
