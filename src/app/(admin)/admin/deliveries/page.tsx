'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Input, Select, Button } from '../../../components/ui';
import { apiService } from '../../../lib/api';
import { DeliveryNote } from '../../../../types/delivery';

export default function DeliveriesPage() {
    const [deliveries, setDeliveries] = useState<DeliveryNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadDeliveries();
    }, [statusFilter]);

    const loadDeliveries = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (statusFilter !== 'all') params.status = statusFilter;

            const response = await apiService.getDeliveries(params);
            const list = Array.isArray(response) ? response : (response.deliveries || []);
            setDeliveries(list);
        } catch (err) {
            console.error("Error loading deliveries", err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = deliveries.filter(d =>
    (d.delivery_number?.toLowerCase().includes(search.toLowerCase()) ||
        d.tracking_number?.toLowerCase().includes(search.toLowerCase()) ||
        d.client_name?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-light text-stone-800">Suivi des Livraisons</h1>
            </div>

            <Card>
                <div className="p-6 flex flex-col md:flex-row gap-4">
                    <Input
                        placeholder="Rechercher (N° Bon, Tracking, Client)..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1"
                    />
                    <Select
                        options={[
                            { value: 'all', label: 'Tous les statuts' },
                            { value: 'PENDING', label: 'En Attente' },
                            { value: 'SHIPPED', label: 'Expédié' },
                            { value: 'DELIVERED', label: 'Livré' },
                            { value: 'RETURNED', label: 'Retourné' }
                        ]}
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="w-48"
                    />
                    <Button onClick={loadDeliveries} variant="secondary">Actualiser</Button>
                </div>
            </Card>

            <Card>
                <div className="p-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>N° Bon</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Transporteur</TableHead>
                                <TableHead>Tracking</TableHead>
                                <TableHead className="text-right">Articles</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">Chargement...</TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-stone-500">Aucune livraison trouvée</TableCell>
                                </TableRow>
                            ) : (
                                filtered.map(delivery => (
                                    <TableRow key={delivery.id}>
                                        <TableCell className="font-medium">{delivery.delivery_number || delivery.id.slice(0, 8)}</TableCell>
                                        <TableCell>{new Date(delivery.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>{delivery.client_name || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                delivery.status === 'DELIVERED' ? 'success' :
                                                    delivery.status === 'SHIPPED' ? 'info' :
                                                        delivery.status === 'RETURNED' ? 'danger' : 'warning'
                                            }>
                                                {delivery.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{delivery.carrier || '-'}</TableCell>
                                        <TableCell className="font-mono text-xs">{delivery.tracking_number || '-'}</TableCell>
                                        <TableCell className="text-right">{delivery.items.reduce((s, i) => s + i.quantity, 0)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
