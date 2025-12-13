'use client';

import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { notificationService } from '../../lib/notifications';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Loader2, Truck, CreditCard, Building2, User } from 'lucide-react';

interface CheckoutFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function CheckoutForm({ onSuccess, onCancel }: CheckoutFormProps) {
    const { checkout } = useCart();
    const [loading, setLoading] = useState(false);
    const [isCompany, setIsCompany] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        // B2C
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        address: '',
        delivery_notes: '',
        preferred_contact: 'phone', // phone or email

        // B2B
        company_name: '',
        fiscal_id: '',
        contact_name: '',
        payment_method: 'virement',
        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        // Phone validation (Tunisian format)
        const phoneRegex = /^(?:\+216|00216)?[23456789]\d{7}$/;
        const cleanPhone = formData.phone.replace(/\s/g, '');

        if (!phoneRegex.test(cleanPhone)) {
            notificationService.error(
                'Numéro invalide',
                'Le numéro de téléphone doit contenir 8 chiffres (ex: 98123456)'
            );
            return false;
        }

        if (isCompany) {
            if (!formData.company_name || !formData.fiscal_id || !formData.address) {
                notificationService.error('Erreur', 'Veuillez remplir les champs obligatoires');
                return false;
            }

            // Fiscal ID validation (simple format check)
            if (formData.fiscal_id.length < 7) {
                notificationService.error('Matricule invalide', 'Le format du matricule fiscal est incorrect');
                return false;
            }
        } else {
            if (!formData.first_name || !formData.last_name || !formData.address) {
                notificationService.error('Erreur', 'Veuillez remplir les champs obligatoires');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            // Prepare payload based on schema
            const payload = {
                is_company: isCompany,
                b2c_data: !isCompany ? {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    phone: formData.phone, // Keep original format including spaces if user enters them
                    email: formData.email || null,
                    address: formData.address,
                    delivery_notes: formData.delivery_notes || null,
                    preferred_contact: formData.preferred_contact
                } : null,
                b2b_data: isCompany ? {
                    company_name: formData.company_name,
                    fiscal_id: formData.fiscal_id,
                    contact_name: formData.contact_name || null,
                    phone: formData.phone,
                    email: formData.email || null,
                    address: formData.address,
                    payment_method: formData.payment_method,
                    notes: formData.notes || null
                } : null
            };

            await checkout(payload);
            onSuccess();
        } catch (error: any) {
            console.error('Checkout error:', error);
            notificationService.error(
                'Erreur',
                error.message || 'Une erreur est survenue lors de la commande'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Type Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
                <button
                    type="button"
                    onClick={() => setIsCompany(false)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2
            ${!isCompany ? 'bg-white shadow-sm text-stone-900' : 'text-gray-500 hover:text-stone-700'}`}
                >
                    <User className="w-4 h-4" />
                    Particulier
                </button>
                <button
                    type="button"
                    onClick={() => setIsCompany(true)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2
            ${isCompany ? 'bg-white shadow-sm text-stone-900' : 'text-gray-500 hover:text-stone-700'}`}
                >
                    <Building2 className="w-4 h-4" />
                    Entreprise / Pro
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Common Field: Phone */}
                <div className="md:col-span-2">
                    <Input
                        label="Numéro de téléphone *"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Ex: 98 123 456"
                        required
                        className="w-full"
                        helpText="Format: 8 chiffres"
                    />
                </div>

                {isCompany ? (
                    /* B2B Fields */
                    <>
                        <div className="md:col-span-2">
                            <Input
                                label="Raison Sociale *"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                                placeholder="Nom de l'entreprise"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Input
                                label="Matricule Fiscal *"
                                name="fiscal_id"
                                value={formData.fiscal_id}
                                onChange={handleChange}
                                placeholder="Ex: 1234567/M/A/000"
                                required
                            />
                        </div>
                        <Input
                            label="Nom du contact"
                            name="contact_name"
                            value={formData.contact_name}
                            onChange={handleChange}
                            placeholder="Personne à contacter"
                        />
                        <Input
                            label="Email professionnel"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <div className="md:col-span-2">
                            <Select
                                label="Mode de paiement *"
                                name="payment_method"
                                value={formData.payment_method}
                                onChange={handleChange}
                                options={[
                                    { value: 'virement', label: 'Virement Bancaire' },
                                    { value: 'cheque', label: 'Chèque' },
                                    { value: 'especes', label: 'Espèces à la livraison' },
                                ]}
                            />
                        </div>
                    </>
                ) : (
                    /* B2C Fields */
                    <>
                        <Input
                            label="Prénom *"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Nom *"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                        />
                        <div className="md:col-span-2">
                            <Input
                                label="Email (optionnel)"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Pour recevoir la confirmation"
                            />
                        </div>
                    </>
                )}

                {/* Address (Common) */}
                <div className="md:col-span-2">
                    <Textarea
                        label={isCompany ? "Adresse du siège *" : "Adresse de livraison *"}
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Rue, Ville, Code Postal..."
                        required
                        rows={3}
                    />
                </div>

                {/* Notes (Common) */}
                <div className="md:col-span-2">
                    <Textarea
                        label={isCompany ? "Notes / Demande spécifique" : "Instructions de livraison"}
                        name={isCompany ? "notes" : "delivery_notes"}
                        value={isCompany ? formData.notes : formData.delivery_notes}
                        onChange={handleChange}
                        placeholder="Information complémentaire..."
                        rows={2}
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button
                    variant="secondary"
                    onClick={onCancel}
                    type="button"
                    className="flex-1"
                    disabled={loading}
                >
                    Annuler
                </Button>
                <Button
                    variant="primary"
                    type="submit"
                    className="flex-1 bg-stone-900 hover:bg-stone-800"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Traitement...
                        </>
                    ) : (
                        <>
                            <Truck className="w-4 h-4 mr-2" />
                            Confirmer la commande
                        </>
                    )}
                </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
                En confirmant, vous acceptez nos conditions générales de vente.
                Un email de confirmation vous sera envoyé.
            </p>
        </form>
    );
}
