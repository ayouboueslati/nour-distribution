'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { Textarea } from '../../ui/Textarea';
import { apiService } from '../../../lib/api';
import { notificationService } from '../../../lib/notifications';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    factureId: string;
    factureNumber: string;
    remainingAmount: number;
    onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    factureId,
    factureNumber,
    remainingAmount,
    onSuccess
}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: remainingAmount,
        payment_method: '',
        payment_date: new Date().toISOString().split('T')[0],
        reference_number: '',
        notes: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            setFormData({
                amount: remainingAmount,
                payment_method: '',
                payment_date: new Date().toISOString().split('T')[0],
                reference_number: '',
                notes: ''
            });
            setErrors({});
        }
    }, [isOpen, remainingAmount]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value
        }));

        // Clear error when field is modified
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = "Le montant doit être supérieur à 0";
        } else if (formData.amount > remainingAmount) {
            newErrors.amount = `Le montant ne peut pas dépasser le reste à payer (${remainingAmount.toFixed(2)} DT)`;
        }

        if (!formData.payment_method) {
            newErrors.payment_method = "La méthode de paiement est requise";
        }

        if (!formData.payment_date) {
            newErrors.payment_date = "La date de paiement est requise";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);
            await apiService.addPaymentToFacture(factureId, {
                document_id: factureId,
                amount: formData.amount,
                payment_method: formData.payment_method,
                payment_date: new Date(formData.payment_date).toISOString(),
                reference_number: formData.reference_number,
                notes: formData.notes
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error submitting payment:', error);
            // notificationService already called in apiService
        } finally {
            setLoading(false);
        }
    };

    const paymentMethods = [
        { value: 'especes', label: 'Espèces' },
        { value: 'cheque', label: 'Chèque' },
        { value: 'virement', label: 'Virement bancaire' },
        { value: 'carte', label: 'Carte bancaire' },
        { value: 'postal', label: 'Mandat postal' },
        { value: 'mobile', label: 'Paiement mobile' },
        { value: 'autre', label: 'Autre' }
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Encaisser Facture #${factureNumber}`}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Montant (DT)"
                        name="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={handleChange}
                        error={errors.amount}
                        required
                        helpText={`Reste à payer: ${remainingAmount.toFixed(2)} DT`}
                    />

                    <Select
                        label="Méthode de Paiement"
                        name="payment_method"
                        options={paymentMethods}
                        value={formData.payment_method}
                        onChange={handleChange}
                        error={errors.payment_method}
                        required
                        placeholder="Sélectionner une méthode"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Référence"
                        name="reference_number"
                        placeholder="Ex: N° de chèque, ID transaction..."
                        value={formData.reference_number}
                        onChange={handleChange}
                        helpText="Optionnel"
                    />

                    <Input
                        label="Date de Paiement"
                        name="payment_date"
                        type="date"
                        value={formData.payment_date}
                        onChange={handleChange}
                        error={errors.payment_date}
                        required
                    />
                </div>

                <Textarea
                    label="Notes"
                    name="notes"
                    placeholder="Notes additionnelles..."
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
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Enregistrement...' : 'Enregistrer le Paiement'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
