'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, Input, Select, Badge } from '../../../../components/ui';
import { apiService } from '../../../../lib/api';
import ProductSearch from '../../../../components/features/ProductSearch';
import { Product } from '../../../../../types';

export default function NewOrderPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedClientId = searchParams?.get('client_id');

    const [clients, setClients] = useState<any[]>([]);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [items, setItems] = useState<{ product: Product; quantity: number }[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load clients on mount
    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const response = await apiService.getClients({ limit: 100 });
            setClients(response.data || response); // Handle potential different response structures

            if (preselectedClientId) {
                const client = (response.data || response).find((c: any) => c.id === preselectedClientId);
                if (client) setSelectedClient(client);
            }
        } catch (err) {
            console.error("Failed to load clients", err);
        }
    };

    const handleClientChange = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        setSelectedClient(client || null);
    };

    const handleAddProduct = (product: Product) => {
        setItems(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) return prev; // Already added
            return [...prev, { product, quantity: 1 }];
        });
    };

    const handleUpdateQuantity = (productId: string, qty: number) => {
        if (qty < 1) return;
        setItems(prev => prev.map(item =>
            item.product.id === productId ? { ...item, quantity: qty } : item
        ));
    };

    const handleRemoveItem = (productId: string) => {
        setItems(prev => prev.filter(i => i.product.id !== productId));
    };

    const handleSubmit = async () => {
        if (!selectedClient || items.length === 0) return;

        try {
            setSubmitting(true);
            setError(null);

            const payload = {
                client_id: selectedClient.id,
                items: items.map(i => ({
                    product_id: i.product.id,
                    quantity: i.quantity
                }))
            };

            const result = await apiService.createOrder(payload);
            router.push(`/admin/orders/${result.id}`);
        } catch (err: any) {
            setError(err.message || "Erreur lors de la création de la commande");
        } finally {
            setSubmitting(false);
        }
    };

    // Financial Checks
    const isB2B = selectedClient?.type === 'b2b';
    const isSuspended = isB2B && selectedClient?.is_suspended;
    const creditLimit = isB2B ? selectedClient?.credit_limit || 0 : 0;
    const currentBalance = isB2B ? selectedClient?.current_balance || 0 : 0;
    const isOverLimit = isB2B && creditLimit > 0 && currentBalance > creditLimit;

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-light text-stone-800">Nouvelle Commande</h1>
                <Button variant="secondary" onClick={() => router.back()}>
                    Annuler
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Col: Client & Settings */}
                <div className="space-y-6">
                    <Card>
                        <div className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Client</h2>
                            <div className="space-y-4">
                                <Select
                                    label="Sélectionner un client"
                                    options={[
                                        { value: '', label: '-- Choisir --' },
                                        ...clients.map(c => ({
                                            value: c.id,
                                            label: c.type === 'b2b' ? c.company_name : `${c.first_name} ${c.last_name}`
                                        }))
                                    ]}
                                    value={selectedClient?.id || ''}
                                    onChange={(e) => handleClientChange(e.target.value)}
                                />

                                {selectedClient && isB2B && (
                                    <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-stone-600">Type</span>
                                            <Badge variant="info">B2B</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-stone-600">Crédit Autorisé</span>
                                            <span className="font-medium">{creditLimit} TND</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-stone-600">Solde Actuel</span>
                                            <span className={`font-medium ${isOverLimit ? 'text-red-600' : ''}`}>
                                                {currentBalance.toFixed(3)} TND
                                            </span>
                                        </div>

                                        {isSuspended && (
                                            <div className="bg-red-100 text-red-700 p-2 rounded text-sm font-bold text-center">
                                                CLIENT SUSPENDU
                                            </div>
                                        )}

                                        {!isSuspended && isOverLimit && (
                                            <div className="bg-amber-100 text-amber-800 p-2 rounded text-sm text-center">
                                                ⚠️ Plafond de crédit dépassé
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Col: Items */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Articles</h2>

                            <div className="mb-6">
                                <ProductSearch
                                    onSelect={handleAddProduct}
                                    placeholder="Rechercher un produit à ajouter..."
                                />
                            </div>

                            {items.length > 0 ? (
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.product.id} className="flex items-center justify-between p-4 border border-stone-100 rounded-lg hover:bg-stone-50">
                                            <div className="flex items-center gap-4">
                                                {item.product.main_image && (
                                                    <img src={item.product.main_image} alt={item.product.name} className="w-12 h-12 object-cover rounded" />
                                                )}
                                                <div>
                                                    <p className="font-medium text-stone-800">{item.product.name}</p>
                                                    <p className="text-sm text-stone-500">SKU: {item.product.sku}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                                                    >
                                                        -
                                                    </Button>
                                                    <span className="w-8 text-center">{item.quantity}</span>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                                                    >
                                                        +
                                                    </Button>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveItem(item.product.id)}
                                                    className="text-red-400 hover:text-red-600"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
                                    Aucun article sélectionné
                                </div>
                            )}

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded">
                                    {error}
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={handleSubmit}
                                    disabled={submitting || items.length === 0 || !selectedClient || (isSuspended)}
                                >
                                    {submitting ? 'Création...' : 'Créer la Commande'}
                                </Button>
                            </div>
                            {isSuspended && (
                                <p className="text-center text-sm text-red-500 mt-2">
                                    Impossible de créer une commande pour un client suspendu.
                                </p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
