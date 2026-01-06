'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Input, Modal, Badge, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../ui';
import { apiService } from '../../../lib/api';
import { DeliveryNote, DeliveryItem } from '../../../../types/delivery';

interface DeliveriesTabProps {
    orderId: string;
    orderItems: any[]; // Items from the order to be selected for delivery
}

export function DeliveriesTab({ orderId, orderItems }: DeliveriesTabProps) {
    const [deliveries, setDeliveries] = useState<DeliveryNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Creation Form State
    const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});
    const [formState, setFormState] = useState({
        tracking_number: '',
        carrier: '',
        notes: ''
    });

    useEffect(() => {
        loadDeliveries();
    }, [orderId]);

    const loadDeliveries = async () => {
        try {
            setLoading(true);
            const response = await apiService.getDeliveriesByOrder(orderId);
            // API might return { deliveries: [...] } or [...]
            const list = Array.isArray(response) ? response : (response.deliveries || []);
            setDeliveries(list);
        } catch (err) {
            console.error("Failed to load deliveries", err);
        } finally {
            setLoading(false);
        }
    };

    const handleInitialItemSelection = () => {
        // Pre-fill with remaining quantities?
        // For now, just empty or 0.
        // Better: Initialize with 0.
        const initial: { [key: string]: number } = {};
        orderItems.forEach(item => {
            initial[item.product_id] = 0;
        });
        setSelectedItems(initial);
    };

    const handleOpenModal = () => {
        handleInitialItemSelection();
        setShowModal(true);
    };

    const handleCreateDelivery = async () => {
        // Filter items with quantity > 0
        const itemsToDeliver = Object.entries(selectedItems)
            .filter(([_, qty]) => qty > 0)
            .map(([productId, qty]) => ({
                product_id: productId,
                quantity: qty
            }));

        if (itemsToDeliver.length === 0) {
            alert('Veuillez sélectionner au moins un article à livrer.');
            return;
        }

        try {
            await apiService.createDelivery({
                order_id: orderId,
                items: itemsToDeliver,
                tracking_number: formState.tracking_number,
                carrier: formState.carrier,
                notes: formState.notes
            });
            setShowModal(false);
            loadDeliveries();
            // Reset form
            setFormState({ tracking_number: '', carrier: '', notes: '' });
        } catch (err: any) {
            alert(err.message || "Erreur lors de la création de la livraison");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-stone-800">Bons de Livraison</h2>
                <Button onClick={handleOpenModal} variant="primary">
                    + Créer un Bon de Livraison
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-8">Chargement...</div>
            ) : deliveries.length === 0 ? (
                <Card className="p-8 text-center text-stone-500 bg-stone-50 border-dashed">
                    Aucun bon de livraison pour cette commande.
                </Card>
            ) : (
                <div className="space-y-4">
                    {deliveries.map(delivery => (
                        <Card key={delivery.id} className="overflow-hidden">
                            <div className="bg-stone-50 p-4 border-b border-stone-200 flex justify-between items-center">
                                <div>
                                    <span className="font-bold text-stone-900">{delivery.delivery_number}</span>
                                    <span className="mx-2 text-stone-400">•</span>
                                    <span className="text-sm text-stone-600">
                                        {new Date(delivery.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <Badge variant={
                                    delivery.status === 'DELIVERED' ? 'success' :
                                        delivery.status === 'SHIPPED' ? 'info' :
                                            delivery.status === 'RETURNED' ? 'danger' : 'warning'
                                }>
                                    {delivery.status}
                                </Badge>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-stone-500 uppercase font-semibold">Transporteur</p>
                                        <p>{delivery.carrier || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-stone-500 uppercase font-semibold">Tracking</p>
                                        <p className="font-mono">{delivery.tracking_number || '-'}</p>
                                    </div>
                                </div>

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Produit</TableHead>
                                            <TableHead className="text-right">Qté Livrée</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {delivery.items.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.product_name}</TableCell>
                                                <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Creation Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Nouveau Bon de Livraison"
                size="lg"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Transporteur"
                            value={formState.carrier}
                            onChange={e => setFormState({ ...formState, carrier: e.target.value })}
                        />
                        <Input
                            label="Numéro de Suivi"
                            value={formState.tracking_number}
                            onChange={e => setFormState({ ...formState, tracking_number: e.target.value })}
                        />
                    </div>

                    <div>
                        <h3 className="font-medium mb-2">Sélectionner les articles à expédier</h3>
                        <div className="border border-stone-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produit</TableHead>
                                        <TableHead className="text-center">Qté Commande</TableHead>
                                        <TableHead className="text-right">A Livrer</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orderItems.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.product_name}</TableCell>
                                            <TableCell className="text-center">{item.quantity}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max={item.quantity}
                                                    value={selectedItems[item.product_id] || 0}
                                                    onChange={e => setSelectedItems({
                                                        ...selectedItems,
                                                        [item.product_id]: Math.min(parseInt(e.target.value) || 0, item.quantity)
                                                    })}
                                                    className="w-20 ml-auto text-right"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <Input
                        label="Notes (Interne)"
                        value={formState.notes}
                        onChange={e => setFormState({ ...formState, notes: e.target.value })}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
                        <Button variant="primary" onClick={handleCreateDelivery}>Créer Bon de Livraison</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
