'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { Textarea } from '../../ui/Textarea';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../ui/Table';
import { apiService } from '../../../lib/api';
import { notificationService } from '../../../lib/notifications';
import { AvoirReason, AvoirItem } from '@/types';

interface AvoirModalProps {
    isOpen: boolean;
    onClose: () => void;
    factureId: string;
    factureNumber: string;
    factureTotal: number;
    onSuccess: () => void;
}

interface FactureItem {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    discount_percent: number;
    tax_percent: number;
    total: number;
}

export const AvoirModal: React.FC<AvoirModalProps> = ({
    isOpen,
    onClose,
    factureId,
    factureNumber,
    factureTotal,
    onSuccess
}) => {
    const [loading, setLoading] = useState(false);
    const [fetchingItems, setFetchingItems] = useState(false);
    const [factureItems, setFactureItems] = useState<FactureItem[]>([]);

    // Selection state: product_id -> return quantity (0 means not selected)
    const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

    const [formData, setFormData] = useState({
        avoir_reason: 'return' as AvoirReason,
        issue_date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen && factureId) {
            fetchFactureItems();
            setFormData(prev => ({
                ...prev,
                avoir_reason: 'return',
                issue_date: new Date().toISOString().split('T')[0],
                notes: ''
            }));
            setSelectedItems({});
            setErrors({});
        }
    }, [isOpen, factureId]);

    const fetchFactureItems = async () => {
        setFetchingItems(true);
        try {
            const facture = await apiService.getFactureById(factureId);
            if (facture && facture.items) {
                setFactureItems(facture.items.map((item: any) => ({
                    product_id: item.product_id,
                    product_name: item.product?.name || 'Produit inconnu',
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    discount_percent: item.discount_percent || 0,
                    tax_percent: item.tax_percent || 19, // Default to 19 if missing
                    total: item.total
                })));
            }
        } catch (error) {
            console.error("Error fetching facture items:", error);
            notificationService.error("Erreur", "Impossible de charger les articles de la facture.");
        } finally {
            setFetchingItems(false);
        }
    };

    const handleItemToggle = (productId: string, checked: boolean) => {
        setSelectedItems(prev => {
            if (!checked) {
                const newState = { ...prev };
                delete newState[productId];
                return newState;
            }
            // If checking, set quantity to 1 or max available if 0? default to 1
            const item = factureItems.find(i => i.product_id === productId);
            return {
                ...prev,
                [productId]: item ? item.quantity : 1 // Default to full quantity on select? Or 0? Let's default to full for convenience
            };
        });
    };

    const handleQuantityChange = (productId: string, quantity: number) => {
        const item = factureItems.find(i => i.product_id === productId);
        if (!item) return;

        // Clamp quantity between 1 and invoice quantity
        const newQuantity = Math.min(Math.max(1, quantity), item.quantity);

        setSelectedItems(prev => ({
            ...prev,
            [productId]: newQuantity
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Calculate estimated total based on selection (simple calculation, backend will recalculate)
    const calculateTotal = () => {
        let total = 0;
        Object.entries(selectedItems).forEach(([productId, quantity]) => {
            const item = factureItems.find(i => i.product_id === productId);
            if (item) {
                const subtotal = item.unit_price * quantity;
                const discount = subtotal * (item.discount_percent / 100);
                const tax = (subtotal - discount) * (item.tax_percent / 100);
                total += (subtotal - discount + tax);
            }
        });
        return total;
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        const selectedCount = Object.keys(selectedItems).length;

        if (selectedCount === 0) {
            newErrors.items = "Veuillez sélectionner au moins un article à retourner";
        }

        if (!formData.avoir_reason) {
            newErrors.avoir_reason = "La raison de l'avoir est requise";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);

            // Construct items payload
            const itemsPayload: AvoirItem[] = Object.entries(selectedItems).map(([productId, quantity]) => {
                const originalItem = factureItems.find(i => i.product_id === productId);
                if (!originalItem) throw new Error(`Item not found for product ${productId}`);

                return {
                    product_id: productId,
                    quantity: quantity,
                    unit_price: originalItem.unit_price,
                    discount_percent: originalItem.discount_percent,
                    tax_percent: originalItem.tax_percent
                };
            });

            await apiService.createAvoirFromFacture(factureId, {
                items: itemsPayload,
                avoir_reason: formData.avoir_reason,
                issue_date: new Date(formData.issue_date).toISOString(),
                notes: formData.notes
            });

            notificationService.success('Avoir créé', 'L\'avoir a été généré avec succès.');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating avoir:', error);
        } finally {
            setLoading(false);
        }
    };

    const reasonOptions = [
        { value: 'return', label: 'Retour produit' },
        { value: 'damaged', label: 'Produit endommagé' },
        { value: 'error', label: 'Erreur de facturation' },
        { value: 'cancellation', label: 'Annulation' },
        { value: 'other', label: 'Autre' }
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Générer un Avoir pour Facture #${factureNumber}`}
            size="xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Items Selection Section */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-stone-700">Sélection des articles</h4>

                    {errors.items && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                            {errors.items}
                        </div>
                    )}

                    {fetchingItems ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                        </div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden border-stone-200">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">&nbsp;</TableHead>
                                        <TableHead>Produit</TableHead>
                                        <TableHead className="text-right">Prix Unit.</TableHead>
                                        <TableHead className="text-center">Qté Fact.</TableHead>
                                        <TableHead className="text-center">Qté Retour</TableHead>
                                        <TableHead className="text-right">Total Est.</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {factureItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-stone-500 py-8">
                                                Aucun article trouvé dans cette facture
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        factureItems.map(item => {
                                            const isSelected = !!selectedItems[item.product_id];
                                            const quantity = selectedItems[item.product_id] || 0;
                                            // Calculate estimated line total for display
                                            const subtotal = item.unit_price * quantity;
                                            const tax = (subtotal * (1 - item.discount_percent / 100)) * (item.tax_percent / 100);
                                            const lineTotal = subtotal * (1 - item.discount_percent / 100) + tax;

                                            return (
                                                <TableRow key={item.product_id} className={isSelected ? 'bg-amber-50/30' : ''}>
                                                    <TableCell>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) => handleItemToggle(item.product_id, e.target.checked)}
                                                            className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`font-medium ${isSelected ? 'text-stone-900' : 'text-stone-600'}`}>
                                                            {item.product_name}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono text-xs">
                                                        {item.unit_price.toFixed(2)} DT
                                                    </TableCell>
                                                    <TableCell className="text-center text-stone-500">
                                                        {item.quantity}
                                                    </TableCell>
                                                    <TableCell>
                                                        {isSelected && (
                                                            <div className="flex justify-center">
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    max={item.quantity}
                                                                    value={quantity}
                                                                    onChange={(e) => handleQuantityChange(item.product_id, parseInt(e.target.value))}
                                                                    className="w-16 h-8 text-center border rounded border-stone-300 text-sm focus:ring-amber-500 focus:border-amber-500"
                                                                />
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {isSelected ? (
                                                            <span>{lineTotal.toFixed(2)} DT</span>
                                                        ) : (
                                                            <span className="text-stone-300">-</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <div className="flex justify-between items-center bg-stone-50 p-4 rounded-lg border border-stone-200 mt-2">
                        <span className="font-medium text-stone-700">Total estimé de l'avoir:</span>
                        <span className="text-xl font-bold text-amber-600">
                            {calculateTotal().toFixed(3)} DT
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-stone-100 pt-4">
                    <Select
                        label="Raison de l'Avoir"
                        name="avoir_reason"
                        options={reasonOptions}
                        value={formData.avoir_reason}
                        onChange={handleChange}
                        error={errors.avoir_reason}
                        required
                    />
                    <Input
                        label="Date d'émission"
                        name="issue_date"
                        type="date"
                        value={formData.issue_date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <Textarea
                    label="Notes / Détails"
                    name="notes"
                    placeholder="Précisez la raison du retour ou de l'erreur..."
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="primary"
                        className="bg-amber-600 hover:bg-amber-700"
                        type="submit"
                        disabled={loading || Object.keys(selectedItems).length === 0}
                    >
                        {loading ? 'Génération...' : `Générer l'Avoir (${calculateTotal().toFixed(2)} DT)`}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
