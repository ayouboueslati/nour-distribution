'use client';

import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { PaymentTerms } from '@/types';

interface ConversionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (paymentTerms: PaymentTerms) => void;
    isSubmitting: boolean;
}

export const ConversionModal: React.FC<ConversionModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isSubmitting
}) => {
    const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('immediate');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(paymentTerms);
    };

    const paymentTermsOptions = [
        { value: 'immediate', label: 'Paiement Immédiat' },
        { value: 'net30', label: 'Net 30 jours' },
        { value: 'net60', label: 'Net 60 jours' },
        { value: 'on_delivery', label: 'À la livraison' }
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Convertir en Facture"
            size="sm"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-stone-600 text-sm">
                    Veuillez sélectionner les conditions de paiement pour la nouvelle facture.
                </p>

                <Select
                    label="Conditions de Paiement"
                    options={paymentTermsOptions}
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)}
                    required
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Conversion...' : 'Confirmer la Conversion'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
