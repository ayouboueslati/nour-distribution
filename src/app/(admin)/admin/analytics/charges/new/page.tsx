'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, Input, Select, Textarea } from "@/app/components/ui/index";
import { apiService } from '@/app/lib/api';
import { ChargeCategory, ChargeInput } from '@/types/analytics';
import { notificationService } from '@/app/lib/notifications';
import { ArrowLeft, Save, Info } from 'lucide-react';

const chargeCategories: { value: ChargeCategory; label: string }[] = [
    { value: 'rent', label: 'Loyer' },
    { value: 'utilities', label: 'Services (Eau, électricité...)' },
    { value: 'salaries', label: 'Salaires' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'supplies', label: 'Fournitures' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'other', label: 'Autre' }
];

const recurrenceOptions = [
    { value: 'ponctuel', label: 'Ponctuel (Une seule fois)' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuel' },
    { value: 'yearly', label: 'Annuel' }
];

export default function NewChargePage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<ChargeInput>({
        description: '',
        amount: 0,
        category: 'rent',
        date: new Date().toISOString().split('T')[0],
        type: 'variable',
        recurrence: 'ponctuel',
        supplier: '',
        receipt_number: '',
        notes: '',
        validated: true
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.description) newErrors.description = 'La description est obligage';
        if (formData.amount <= 0) newErrors.amount = 'Le montant doit être supérieur à 0';
        if (!formData.date) newErrors.date = 'La date est obligatoire';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setSubmitting(true);
            await apiService.createCharge(formData);
            notificationService.success('Succès', 'La charge a été enregistrée avec succès');
            router.push('/admin/analytics/charges');
        } catch (error) {
            console.error('Error creating charge:', error);
            notificationService.error('Erreur', 'Impossible d\'enregistrer la charge');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/admin/analytics/charges">
                        <button className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-stone-600" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-light text-stone-800">Nouvelle Charge</h1>
                        <p className="text-stone-600 mt-1">Enregistrez une dépense ponctuelle ou récurrente</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <Card className="md:col-span-2">
                        <div className="p-6 space-y-4">
                            <h2 className="text-lg font-semibold text-stone-800 border-b pb-2 mb-4">Informations Générales</h2>

                            <Input
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="ex: Loyer Entrepôt Décembre"
                                required
                                error={errors.description}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Montant (DT)"
                                    name="amount"
                                    type="number"
                                    step="0.001"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                    error={errors.amount}
                                    placeholder="0.000"
                                />
                                <Input
                                    label="Date"
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                    error={errors.date}
                                />
                            </div>

                            <Textarea
                                label="Notes additionnelles"
                                name="notes"
                                value={formData.notes || ''}
                                onChange={handleChange}
                                placeholder="Détails du paiement, etc."
                                rows={3}
                            />
                        </div>
                    </Card>

                    {/* Categorization */}
                    <div className="space-y-6">
                        <Card>
                            <div className="p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-stone-800 border-b pb-2">Catégorie & Type</h3>

                                <Select
                                    label="Catégorie"
                                    name="category"
                                    options={chargeCategories}
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                />

                                <Select
                                    label="Type de charge"
                                    name="type"
                                    options={[
                                        { value: 'variable', label: 'Variable' },
                                        { value: 'fixed', label: 'Fixe' }
                                    ]}
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                />

                                <Select
                                    label="Récurrence"
                                    name="recurrence"
                                    options={recurrenceOptions}
                                    value={formData.recurrence || 'ponctuel'}
                                    onChange={handleChange}
                                />
                            </div>
                        </Card>

                        <Card>
                            <div className="p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-stone-800 border-b pb-2">Détails Supplémentaires</h3>

                                <Input
                                    label="Fournisseur / Bénéficiaire"
                                    name="supplier"
                                    value={formData.supplier || ''}
                                    onChange={handleChange}
                                    placeholder="ex: STEG, Propriétaire..."
                                />

                                <Input
                                    label="N° de Reçu / Facture"
                                    name="receipt_number"
                                    value={formData.receipt_number || ''}
                                    onChange={handleChange}
                                    placeholder="ex: REC-2023-001"
                                />
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between border-t pt-6">
                    <div className="flex items-center text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100 italic">
                        <Info className="w-4 h-4 mr-2" />
                        Toutes les charges sont enregistrées en Dinar Tunisien (DT).
                    </div>
                    <div className="flex space-x-3">
                        <Link href="/admin/analytics/charges">
                            <Button variant="secondary" type="button" disabled={submitting}>
                                Annuler
                            </Button>
                        </Link>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={submitting}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            {submitting ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enregistrement...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <Save className="w-5 h-5 mr-2" />
                                    Enregistrer la Charge
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
