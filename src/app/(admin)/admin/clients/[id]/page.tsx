'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Badge } from '../../../../components/ui';
import { apiService } from '../../../../lib/api';
import { Client, B2BClient, B2CClient } from '../../../../../types/client';

export default function ClientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const idParam = params?.id;
    const clientId = Array.isArray(idParam) ? idParam[0] : idParam as string;

    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (clientId) {
            loadClient();
        }
    }, [clientId]);

    const loadClient = async () => {
        try {
            setLoading(true);
            const data = await apiService.getClient(clientId);
            setClient(data);
        } catch (err: any) {
            console.error(err);
            setError("Impossible de charger le client");
        } finally {
            setLoading(false);
        }
    };

    const isB2B = (c: Client): c is B2BClient => c.type === 'b2b';

    if (loading) return <div className="p-6">Chargement...</div>;
    if (error || !client) return (
        <div className="p-6">
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error || "Client introuvable"}</div>
            <Button variant="secondary" className="mt-4" onClick={() => router.push('/admin/clients')}>
                Retour à la liste
            </Button>
        </div>
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-light text-stone-800">
                            {isB2B(client) ? client.entreprise : `${client.prenom} ${client.nom}`}
                        </h1>
                        <Badge variant={client.type === 'b2b' ? 'info' : 'success'}>
                            {client.type === 'b2b' ? 'B2B' : 'B2C'}
                        </Badge>
                        {isB2B(client) && client.is_suspended && (
                            <Badge variant="danger">SUSPENDU</Badge>
                        )}
                    </div>
                    <p className="text-stone-500">
                        ID: {client.id} • {isB2B(client) ? client.contact : client.email}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/admin/orders/new?client_id=${client.id}`}>
                        <Button variant="primary">
                            + Nouvelle Commande
                        </Button>
                    </Link>
                    <Link href={`/admin/clients/${client.id}/edit`}>
                        <Button variant="secondary">
                            Modifier
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Main Info */}
                <div className="lg:col-span-2 space-y-6">

                    {/* General Info Card */}
                    <Card>
                        <div className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Informations Générales</h2>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                                <div>
                                    <dt className="text-sm text-stone-500">Statut</dt>
                                    <dd className="font-medium text-stone-800">{client.statut}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-stone-500">Valeur Client</dt>
                                    <dd className="font-medium text-stone-800">{client.valeur}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-stone-500">Téléphone</dt>
                                    <dd className="text-stone-800">{client.telephone}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-stone-500">Email</dt>
                                    <dd className="text-stone-800">{client.email || '-'}</dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-sm text-stone-500">Adresse</dt>
                                    <dd className="text-stone-800">{client.adresse}</dd>
                                </div>

                                {isB2B(client) && (
                                    <>
                                        <div>
                                            <dt className="text-sm text-stone-500">Matricule Fiscal</dt>
                                            <dd className="text-stone-800">{client.matricule}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm text-stone-500">Type Business</dt>
                                            <dd className="text-stone-800">{client.typeBusiness || '-'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm text-stone-500">Condition de Paiement</dt>
                                            <dd className="text-stone-800">{client.conditionsPaiement || '-'}</dd>
                                        </div>
                                    </>
                                )}
                            </dl>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Financials & Metrics */}
                <div className="space-y-6">

                    {/* Financial Card (B2B Only) */}
                    {isB2B(client) && (
                        <Card className="bg-gradient-to-br from-stone-50 to-stone-100 border-stone-200">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold mb-4 text-stone-800">Situation Financière</h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-stone-500">Solde Actuel</p>
                                        <p className={`text-3xl font-bold ${(client.current_balance || 0) > (client.credit_limit || 0) ? 'text-red-600' : 'text-stone-800'}`}>
                                            {client.current_balance?.toFixed(3) || '0.000'} <span className="text-sm font-normal text-stone-500">TND</span>
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-stone-200">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm text-stone-600">Plafond de Crédit</span>
                                            <span className="font-semibold text-stone-800">{client.credit_limit || 0} TND</span>
                                        </div>
                                        {/* Progress Bar */}
                                        {client.credit_limit && client.credit_limit > 0 && (
                                            <div className="w-full bg-stone-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${(client.current_balance || 0) > client.credit_limit
                                                        ? 'bg-red-500'
                                                        : (client.current_balance || 0) > client.credit_limit * 0.8
                                                            ? 'bg-amber-500'
                                                            : 'bg-green-500'
                                                        }`}
                                                    style={{ width: `${Math.min(((client.current_balance || 0) / client.credit_limit) * 100, 100)}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {client.is_suspended ? (
                                        <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm font-medium text-center">
                                            ⚠️ Compte Suspendu - Crédit Bloqué
                                        </div>
                                    ) : (
                                        <div className="bg-green-100 text-green-700 p-3 rounded-md text-sm font-medium text-center">
                                            ✅ Compte Actif
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Stats Card */}
                    <Card>
                        <div className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Statistiques</h2>
                            <ul className="space-y-4">
                                <li className="flex justify-between">
                                    <span className="text-stone-600">Total Commandes</span>
                                    <span className="font-medium">{client.totalCommandes}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-stone-600">Total Dépensé</span>
                                    <span className="font-medium">{client.totalDepense}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-stone-600">Devis en cours</span>
                                    <span className="font-medium text-amber-600">{client.devisEnCours}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-stone-600">Dernier Achat</span>
                                    <span className="font-medium">{client.dernierAchat || '-'}</span>
                                </li>
                            </ul>
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
}
