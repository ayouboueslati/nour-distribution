'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Input, Card, Textarea, Select } from '../../../../../components/ui';
import { apiService } from '../../../../../lib/api';

export default function EditSupplierPage() {
    const router = useRouter();
    const params = useParams();
    // Ensure we get the ID correctly whether it's an array or string
    const idParam = params?.id;
    const supplierId = Array.isArray(idParam) ? idParam[0] : idParam as string;

    // Logic for editing mode
    const isEditing = true;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        company_name: '',
        legal_name: '',
        contact_person: '',
        email: '',
        phone: '',
        whatsapp: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        fiscal_id: '',
        business_registration: '',
        vat_number: '',
        payment_terms: '30 jours',
        preferred_payment_method: 'Virement',
        shipping_terms: 'FOB',
        lead_time_days: 30,
        reliability_rating: 5,
        quality_rating: 5,
        communication_rating: 5,
        is_active: true,
        is_preferred: false,
        notes: '',
        tags: [] as string[]
    });

    useEffect(() => {
        if (supplierId) {
            fetchSupplier();
        }
    }, [supplierId]);

    const fetchSupplier = async () => {
        try {
            const supplier = await apiService.getSupplier(supplierId);
            setFormData({
                company_name: supplier.company_name || '',
                legal_name: supplier.legal_name || '',
                contact_person: supplier.contact_person || '',
                email: supplier.email || '',
                phone: supplier.phone || '',
                whatsapp: supplier.whatsapp || '',
                address_line1: supplier.address_line1 || '',
                address_line2: supplier.address_line2 || '',
                city: supplier.city || '',
                state: supplier.state || '',
                postal_code: supplier.postal_code || '',
                country: supplier.country || '',
                fiscal_id: supplier.fiscal_id || '',
                business_registration: supplier.business_registration || '',
                vat_number: supplier.vat_number || '',
                payment_terms: supplier.payment_terms || '30 jours',
                preferred_payment_method: supplier.preferred_payment_method || 'Virement',
                shipping_terms: supplier.shipping_terms || 'FOB',
                lead_time_days: supplier.lead_time_days || 30,
                reliability_rating: supplier.reliability_rating || 5,
                quality_rating: supplier.quality_rating || 5,
                communication_rating: supplier.communication_rating || 5,
                is_active: supplier.is_active !== undefined ? supplier.is_active : true,
                is_preferred: supplier.is_preferred || false,
                notes: supplier.notes || '',
                tags: supplier.tags || []
            });
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement du fournisseur');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await apiService.updateSupplier(supplierId, formData);
            router.push('/admin/suppliers');
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la modification du fournisseur');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!supplierId) return null;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-light text-stone-800">
                        Modifier le Fournisseur
                    </h1>
                    <p className="text-stone-600 mt-1">
                        Modifiez les informations du fournisseur
                    </p>
                </div>
                <Button variant="secondary" onClick={() => router.back()}>
                    ← Retour
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Basic Information */}
                    <div className="space-y-6">
                        <Card>
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-stone-800 mb-4">Informations de Base</h2>
                                <div className="space-y-4">
                                    <Input
                                        label="Nom de l'entreprise *"
                                        value={formData.company_name}
                                        onChange={(e) => handleChange('company_name', e.target.value)}
                                        placeholder="Ex: Beauty Hair China"
                                        required
                                    />

                                    <Input
                                        label="Nom légal"
                                        value={formData.legal_name}
                                        onChange={(e) => handleChange('legal_name', e.target.value)}
                                        placeholder="Nom officiel de l'entreprise"
                                    />

                                    <Input
                                        label="Personne à contacter *"
                                        value={formData.contact_person}
                                        onChange={(e) => handleChange('contact_person', e.target.value)}
                                        placeholder="Nom du contact principal"
                                        required
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            placeholder="contact@entreprise.com"
                                        />

                                        <Input
                                            label="Téléphone *"
                                            value={formData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            placeholder="+33 1 23 45 67 89"
                                            required
                                        />
                                    </div>

                                    <Input
                                        label="WhatsApp"
                                        value={formData.whatsapp}
                                        onChange={(e) => handleChange('whatsapp', e.target.value)}
                                        placeholder="+33 6 12 34 56 78"
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-stone-800 mb-4">Adresse</h2>
                                <div className="space-y-4">
                                    <Input
                                        label="Adresse ligne 1"
                                        value={formData.address_line1}
                                        onChange={(e) => handleChange('address_line1', e.target.value)}
                                        placeholder="Rue et numéro"
                                    />

                                    <Input
                                        label="Adresse ligne 2"
                                        value={formData.address_line2}
                                        onChange={(e) => handleChange('address_line2', e.target.value)}
                                        placeholder="Complément d'adresse"
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Ville"
                                            value={formData.city}
                                            onChange={(e) => handleChange('city', e.target.value)}
                                            placeholder="Ville"
                                        />

                                        <Input
                                            label="Code postal"
                                            value={formData.postal_code}
                                            onChange={(e) => handleChange('postal_code', e.target.value)}
                                            placeholder="Code postal"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Région/État"
                                            value={formData.state}
                                            onChange={(e) => handleChange('state', e.target.value)}
                                            placeholder="Région ou état"
                                        />

                                        <Input
                                            label="Pays"
                                            value={formData.country}
                                            onChange={(e) => handleChange('country', e.target.value)}
                                            placeholder="Pays"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Business Details */}
                    <div className="space-y-6">
                        <Card>
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-stone-800 mb-4">Informations Commerciales</h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="ID Fiscal"
                                            value={formData.fiscal_id}
                                            onChange={(e) => handleChange('fiscal_id', e.target.value)}
                                            placeholder="Numéro fiscal"
                                        />

                                        <Input
                                            label="Numéro TVA"
                                            value={formData.vat_number}
                                            onChange={(e) => handleChange('vat_number', e.target.value)}
                                            placeholder="TVA intracommunautaire"
                                        />
                                    </div>

                                    <Select
                                        label="Conditions de paiement"
                                        options={[
                                            { value: 'Comptant', label: 'Comptant' },
                                            { value: '30 jours', label: '30 jours' },
                                            { value: '45 jours', label: '45 jours' },
                                            { value: '60 jours', label: '60 jours' }
                                        ]}
                                        value={formData.payment_terms}
                                        onChange={(e) => handleChange('payment_terms', e.target.value)}
                                    />

                                    <Select
                                        label="Méthode de paiement préférée"
                                        options={[
                                            { value: 'Virement', label: 'Virement bancaire' },
                                            { value: 'Chèque', label: 'Chèque' },
                                            { value: 'Carte', label: 'Carte bancaire' },
                                            { value: 'Espèces', label: 'Espèces' }
                                        ]}
                                        value={formData.preferred_payment_method}
                                        onChange={(e) => handleChange('preferred_payment_method', e.target.value)}
                                    />

                                    <Input
                                        label="Délai de livraison (jours)"
                                        type="number"
                                        value={formData.lead_time_days}
                                        onChange={(e) => handleChange('lead_time_days', parseInt(e.target.value))}
                                        min="1"
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-stone-800 mb-4">Évaluations</h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">
                                                Fiabilité
                                            </label>
                                            <Select
                                                options={[
                                                    { value: '1', label: '1 ★' },
                                                    { value: '2', label: '2 ★★' },
                                                    { value: '3', label: '3 ★★★' },
                                                    { value: '4', label: '4 ★★★★' },
                                                    { value: '5', label: '5 ★★★★★' }
                                                ]}
                                                value={formData.reliability_rating.toString()}
                                                onChange={(e) => handleChange('reliability_rating', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">
                                                Qualité
                                            </label>
                                            <Select
                                                options={[
                                                    { value: '1', label: '1 ★' },
                                                    { value: '2', label: '2 ★★' },
                                                    { value: '3', label: '3 ★★★' },
                                                    { value: '4', label: '4 ★★★★' },
                                                    { value: '5', label: '5 ★★★★★' }
                                                ]}
                                                value={formData.quality_rating.toString()}
                                                onChange={(e) => handleChange('quality_rating', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">
                                                Communication
                                            </label>
                                            <Select
                                                options={[
                                                    { value: '1', label: '1 ★' },
                                                    { value: '2', label: '2 ★★' },
                                                    { value: '3', label: '3 ★★★' },
                                                    { value: '4', label: '4 ★★★★' },
                                                    { value: '5', label: '5 ★★★★★' }
                                                ]}
                                                value={formData.communication_rating.toString()}
                                                onChange={(e) => handleChange('communication_rating', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-stone-800 mb-4">Paramètres</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={(e) => handleChange('is_active', e.target.checked)}
                                                className="rounded border-stone-300"
                                            />
                                            <span className="ml-2 text-sm text-stone-600">Fournisseur actif</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_preferred}
                                                onChange={(e) => handleChange('is_preferred', e.target.checked)}
                                                className="rounded border-stone-300"
                                            />
                                            <span className="ml-2 text-sm text-stone-600">Fournisseur préféré</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-stone-800 mb-4">Notes Internes</h2>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e: any) => handleChange('notes', e.target.value)}
                                    placeholder="Notes sur la relation, qualité des produits, etc."
                                    rows={4}
                                />
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-stone-200">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading || !formData.company_name.trim() || !formData.contact_person.trim()}
                    >
                        {loading ? 'Enregistrement...' : 'Modifier le Fournisseur'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
