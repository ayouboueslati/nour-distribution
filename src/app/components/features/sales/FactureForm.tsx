'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Save, X, Plus, Trash2, Search, Building, User, Calendar,
    ChevronDown, Info, CreditCard, Receipt
} from 'lucide-react';
import { Card, Button, Input, Select, Textarea, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/components/ui';
import ProductSearch from '@/app/components/features/ProductSearch';
import { apiService } from '@/app/lib/api';
import { notificationService } from '@/app/lib/notifications';

interface FactureItem {
    product_id?: string;
    reference: string;
    description: string;
    quantity: number;
    unit_price: number;
    tax_percent: number;
    total_per_line: number;
}

interface FactureFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export default function FactureForm({ initialData, isEdit = false }: FactureFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [searchingClients, setSearchingClients] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        document_number: initialData?.document_number || 'FCT-2025/0001',
        issue_date: initialData?.issue_date ? new Date(initialData.issue_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        due_date: initialData?.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        client_id: initialData?.client_id || '',
        company_name: 'Nour Distribution',
        notes: initialData?.notes || '',
        tax_type: 'global' as 'global' | 'line',
        global_tax_percent: 19,
        discount_amount: initialData?.discount_amount || 0,
        timbre_fiscal: initialData?.timbre_fiscal || 1.000,
        payment_method: initialData?.payment_method || 'espéces',
        payment_terms: initialData?.payment_terms || 'immediate',
        valid_until: initialData?.valid_until ? new Date(initialData.valid_until).toISOString().split('T')[0] : '',
    });

    const [items, setItems] = useState<FactureItem[]>(
        initialData?.items?.map((item: any) => ({
            reference: item.reference || '',
            description: item.description || item.product_name || '',
            quantity: item.quantity || 1,
            unit_price: item.unit_price || 0,
            tax_percent: item.tax_percent || 19,
            total_per_line: item.total_price || (item.quantity * item.unit_price)
        })) || [{ product_id: '', reference: '', description: '', quantity: 1, unit_price: 0, tax_percent: 19, total_per_line: 0 }]
    );

    // Load clients for selection
    useEffect(() => {
        const fetchClients = async () => {
            try {
                setSearchingClients(true);
                const res = await apiService.getClients({ limit: 50 });
                setClients(res.clients || res || []);
            } catch (error) {
                console.error('Error fetching clients:', error);
            } finally {
                setSearchingClients(false);
            }
        };
        fetchClients();
    }, []);

    // Totals Calculation
    const totals = useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        const taxAmount = formData.tax_type === 'global'
            ? (subtotal * formData.global_tax_percent / 100)
            : items.reduce((sum, item) => sum + (item.quantity * item.unit_price * item.tax_percent / 100), 0);

        return {
            subtotal,
            taxAmount,
            total: subtotal + taxAmount + formData.timbre_fiscal - formData.discount_amount
        };
    }, [items, formData.global_tax_percent, formData.tax_type, formData.discount_amount, formData.timbre_fiscal]);

    const handleAddItem = () => {
        setItems([...items, { product_id: '', reference: '', description: '', quantity: 1, unit_price: 0, tax_percent: 19, total_per_line: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleItemChange = (index: number, field: keyof FactureItem, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };

        if (field === 'quantity' || field === 'unit_price') {
            item.total_per_line = item.quantity * item.unit_price;
        }

        newItems[index] = item;
        setItems(newItems);
    };

    const handleProductSelect = (index: number, product: any) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            product_id: product.id,
            reference: product.sku,
            description: product.name,
            unit_price: product.retail_price || 0,
            total_per_line: 1 * (product.retail_price || 0)
        };
        setItems(newItems);
    };

    const handleSubmit = async () => {
        if (!formData.client_id) {
            notificationService.error('Erreur', 'Veuillez sélectionner un client');
            return;
        }

        try {
            setLoading(true);

            // Filter out items without a valid product_id
            const validItems = items.filter(item => item.product_id && item.product_id.length > 0);

            if (validItems.length === 0) {
                notificationService.error('Erreur', 'Veuillez ajouter au moins un produit valide.');
                setLoading(false);
                return;
            }

            const payload = {
                ...formData,
                type: 'facture',
                client_id: formData.client_id || undefined, // Ensure valid UUID or undefined
                items: validItems.map(item => ({
                    product_id: item.product_id,
                    quantity: Number(item.quantity),
                    unit_price: Number(item.unit_price),
                    discount_percent: 0,
                    tax_percent: Number(item.tax_percent)
                })),
                subtotal: Number(totals.subtotal),
                tax_amount: Number(totals.taxAmount),
                total_amount: Number(totals.total),
                timbre_fiscal: Number(formData.timbre_fiscal),
                payment_method: formData.payment_method,
                payment_terms: formData.payment_terms,
                valid_until: formData.valid_until || undefined,
            };

            if (isEdit) {
                await apiService.updateFacture(initialData.id, payload);
            } else {
                await apiService.createFacture(payload);
            }

            router.push('/admin/sales/factures');
        } catch (error) {
            console.error('Error saving facture:', error);
            notificationService.error('Erreur', 'Impossible d\'enregistrer la facture');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header Info */}
            <div className="text-center space-y-2 py-4">
                <h1 className="text-3xl font-bold text-stone-900 flex items-center justify-center gap-2 uppercase tracking-tight">
                    {isEdit ? 'Modifier' : 'Nouvelle'} Facture N° {formData.document_number}
                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs font-bold">NOUVEAU!</span>
                </h1>
                <p className="text-stone-500 text-sm italic">
                    Les changements ne seront appliqués au document qu'après avoir cliqué sur "sauvegarder".
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Section - 2/3 Width */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Top Row: Company & Client */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="min-h-[350px]">
                            <div className="p-6 space-y-6">
                                <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                                    <div className="w-2 h-6 bg-amber-500 rounded-full"></div>
                                    <h2 className="font-bold text-stone-800 uppercase tracking-wider text-sm">Votre Société</h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="group">
                                        <p className="text-xs font-semibold text-stone-500 mb-1 uppercase tracking-widest">Logo</p>
                                        <div className="w-full h-16 border-2 border-dashed border-stone-200 rounded-lg flex items-center justify-center bg-stone-50 hover:border-amber-400 group-hover:bg-white transition-all cursor-pointer">
                                            <p className="text-xs text-stone-400 flex items-center gap-2">
                                                Pas de logo <span className="text-amber-600 font-bold underline">Charger un logo</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="group">
                                        <p className="text-xs font-semibold text-stone-500 mb-1 uppercase tracking-widest">Tampon & Signature</p>
                                        <div className="w-full h-16 border-2 border-dashed border-stone-200 rounded-lg flex items-center justify-center bg-stone-50 hover:border-amber-400 group-hover:bg-white transition-all cursor-pointer">
                                            <p className="text-xs text-stone-400 flex items-center gap-2">
                                                Pas de tampon <span className="text-amber-600 font-bold underline">Charger un tampon</span>
                                            </p>
                                        </div>
                                    </div>

                                    <Input
                                        label="Nom de la société"
                                        value={formData.company_name}
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                    />

                                    <div className="flex gap-2">
                                        <Button variant="secondary" size="sm" className="w-full text-[10px] uppercase font-bold tracking-tighter">Ajouter des champs</Button>
                                        <Button variant="secondary" size="sm" className="w-full text-[10px] uppercase font-bold tracking-tighter">Chercher des sociétés</Button>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="min-h-[350px]">
                            <div className="p-6 space-y-6">
                                <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                                    <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                                    <h2 className="font-bold text-stone-800 uppercase tracking-wider text-sm">Le Client</h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Nom de la société / Client</p>
                                        <select
                                            className="w-full border border-stone-300 rounded-lg p-2.5 bg-white text-stone-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                                            value={formData.client_id}
                                            onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                        >
                                            <option value="">Sélectionner un client...</option>
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>
                                                    {client.company_name || `${client.first_name} ${client.last_name}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        <Button variant="secondary" size="sm" className="text-[10px] uppercase font-bold tracking-tighter">Ajouter des champs</Button>
                                        <Button variant="secondary" size="sm" className="text-[10px] uppercase font-bold tracking-tighter">Chercher des clients</Button>
                                    </div>

                                    <div className="pt-4 border-t border-stone-50">
                                        <div className="flex items-center gap-2 border-b border-stone-100 pb-3 mb-4">
                                            <div className="w-2 h-6 bg-stone-300 rounded-full"></div>
                                            <h2 className="font-bold text-stone-400 uppercase tracking-wider text-sm">Autres Informations</h2>
                                        </div>

                                        <div className="space-y-3">
                                            <Input
                                                label="Numéro"
                                                value={formData.document_number}
                                                onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                                            />
                                            <Input
                                                type="date"
                                                label="Date"
                                                value={formData.issue_date}
                                                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                                            />
                                            <Input
                                                type="date"
                                                label="Date d'échéance"
                                                value={formData.due_date}
                                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                            />
                                            <Input
                                                type="date"
                                                label="Validité (si Devis)"
                                                value={formData.valid_until}
                                                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                            />
                                            <Button variant="secondary" size="sm" className="w-full text-[10px] uppercase font-bold tracking-tighter">Ajouter des champs</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Line Items Table */}
                    <Card className="overflow-visible">
                        <div className="bg-blue-50/50 p-4 border-b border-stone-100 flex justify-between items-center">
                            <h3 className="font-bold text-stone-700 uppercase p-2 tracking-widest text-sm">Détails des Articles</h3>
                            <Button variant="secondary" size="sm" onClick={handleAddItem}>
                                <Plus className="w-4 h-4 mr-1" /> Ajouter une ligne
                            </Button>
                        </div>
                        <div className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-24 text-[10px] uppercase font-bold">Référence</TableHead>
                                        <TableHead className="text-[10px] uppercase font-bold">Description</TableHead>
                                        <TableHead className="w-24 text-[10px] uppercase font-bold text-center">Quantité</TableHead>
                                        <TableHead className="w-32 text-[10px] uppercase font-bold text-right">Montant</TableHead>
                                        {formData.tax_type === 'line' && (
                                            <TableHead className="w-24 text-[10px] uppercase font-bold text-center">TVA %</TableHead>
                                        )}
                                        <TableHead className="w-32 text-[10px] uppercase font-bold text-right">Total TTC</TableHead>
                                        <TableHead className="w-10">   </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item, index) => (
                                        <TableRow key={index} className="hover:bg-amber-50/20 transition-colors">
                                            <TableCell className="w-[300px]">
                                                {item.product_id ? (
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-bold text-sm text-stone-800">{item.description}</span>
                                                            <button
                                                                onClick={() => handleItemChange(index, 'product_id', '')}
                                                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                                                            >
                                                                Changer
                                                            </button>
                                                        </div>
                                                        <span className="text-xs text-stone-500">Réf: {item.reference}</span>
                                                    </div>
                                                ) : (
                                                    <ProductSearch
                                                        onSelect={(product) => handleProductSelect(index, product)}
                                                        placeholder="Chercher un produit..."
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <input
                                                    className="w-full bg-transparent border-none focus:ring-0 text-sm p-1 font-medium text-stone-600"
                                                    placeholder="Description personnalisée..."
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <input
                                                    type="number"
                                                    className="w-full bg-transparent border-none focus:ring-0 text-sm p-1 text-center font-bold text-stone-800"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <input
                                                    type="number"
                                                    className="w-full bg-transparent border-none focus:ring-0 text-sm p-1 text-right font-bold text-stone-800"
                                                    value={item.unit_price}
                                                    onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                />
                                            </TableCell>
                                            {formData.tax_type === 'line' && (
                                                <TableCell>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-transparent border-none focus:ring-0 text-sm p-1 text-center font-medium text-stone-500"
                                                        value={item.tax_percent}
                                                        onChange={(e) => handleItemChange(index, 'tax_percent', parseFloat(e.target.value) || 0)}
                                                    />
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                <p className="text-right text-sm font-bold text-stone-900">
                                                    {(item.quantity * item.unit_price).toLocaleString()} <span className="text-[10px] opacity-70">DT</span>
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <button
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="text-stone-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-6">
                            <Textarea
                                label="Notes & Conditions"
                                placeholder="Ajoutez des notes ou des conditions de paiement ici..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={4}
                            />
                        </div>
                    </Card>
                </div>

                {/* Right Section - Sidebar (1/3 Width) */}
                <div className="space-y-6">
                    <Card className="bg-stone-50 border-stone-200">
                        <div className="p-6 space-y-4">
                            <Button
                                className="w-full py-6 text-lg font-bold shadow-xl hover:scale-[1.02] active:scale-95 transition-all bg-blue-700 hover:bg-blue-800"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Enregistrement...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Save className="w-5 h-5" /> Sauvegarder
                                    </span>
                                )}
                            </Button>

                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="secondary" onClick={() => router.back()} className="text-xs font-bold uppercase py-4">Annuler</Button>
                                <Button variant="secondary" className="text-xs font-bold uppercase py-4">Aperçu PDF</Button>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                                <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
                                <h2 className="font-bold text-stone-800 uppercase tracking-wider text-sm">Taxes</h2>
                            </div>

                            <div className="bg-stone-50 p-1 rounded-xl flex gap-1 mb-4">
                                <button
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.tax_type === 'line' ? 'bg-white shadow-sm text-blue-600' : 'text-stone-400 hover:text-stone-600'}`}
                                    onClick={() => setFormData({ ...formData, tax_type: 'line' })}
                                >
                                    Taxes Par Ligne
                                </button>
                                <button
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.tax_type === 'global' ? 'bg-white shadow-sm text-blue-600' : 'text-stone-400 hover:text-stone-600'}`}
                                    onClick={() => setFormData({ ...formData, tax_type: 'global' })}
                                >
                                    Taxes Globales
                                </button>
                            </div>

                            {formData.tax_type === 'global' && (
                                <div className="space-y-4">
                                    <Select
                                        label="Appliquer TVA, Timbre..."
                                        options={[
                                            { value: '19', label: 'TVA 19%' },
                                            { value: '13', label: 'TVA 13%' },
                                            { value: '7', label: 'TVA 7%' },
                                            { value: '0', label: 'Exonéré' }
                                        ]}
                                        value={formData.global_tax_percent.toString()}
                                        onChange={(e) => setFormData({ ...formData, global_tax_percent: parseFloat(e.target.value) })}
                                    />
                                    <Button variant="secondary" className="w-full text-xs font-bold uppercase py-3 border-2 border-stone-100 hover:border-blue-200 hover:bg-white transition-all text-blue-600">
                                        Appliquer les taxes
                                    </Button>
                                </div>
                            )}

                            <div className="pt-4 border-t border-stone-100">
                                <Select
                                    label="Mode de Paiement"
                                    options={[
                                        { value: 'espéces', label: 'Espéces' },
                                        { value: 'virement', label: 'Virement' },
                                        { value: 'chèque', label: 'Chèque' },
                                        { value: 'carte', label: 'Carte Bancaire' }
                                    ]}
                                    value={formData.payment_method}
                                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 border-t border-stone-100">
                                <Select
                                    label="Conditions de Paiement"
                                    options={[
                                        { value: 'immediate', label: 'Paiement Immédiat' },
                                        { value: 'net30', label: 'Net 30 jours' },
                                        { value: 'net60', label: 'Net 60 jours' },
                                        { value: 'on_delivery', label: 'À la livraison' }
                                    ]}
                                    value={formData.payment_terms}
                                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-white to-stone-50">
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                                <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                                <h2 className="font-bold text-stone-800 uppercase tracking-wider text-sm">Totaux</h2>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-stone-100 shadow-sm">
                                    <span className="text-stone-500 text-sm font-medium uppercase tracking-tighter">Sous-Total</span>
                                    <span className="text-lg font-bold text-stone-800">{totals.subtotal.toLocaleString()} <span className="text-xs opacity-50">DT</span></span>
                                </div>

                                <div className="flex justify-between items-center p-3">
                                    <span className="text-stone-500 text-sm font-medium uppercase tracking-tighter">Remise (DT)</span>
                                    <input
                                        type="number"
                                        className="w-24 text-right bg-transparent border-none focus:ring-0 text-lg font-bold text-red-500"
                                        value={formData.discount_amount}
                                        onChange={(e) => setFormData({ ...formData, discount_amount: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-stone-100 shadow-sm">
                                    <span className="text-stone-500 text-sm font-medium uppercase tracking-tighter">Taxes ({formData.tax_type === 'global' ? `${formData.global_tax_percent}%` : 'Lignes'})</span>
                                    <span className="text-lg font-bold text-stone-800">{totals.taxAmount.toLocaleString()} <span className="text-xs opacity-50">DT</span></span>
                                </div>

                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-stone-100 shadow-sm">
                                    <span className="text-stone-500 text-sm font-medium uppercase tracking-tighter">Timbre Fiscal</span>
                                    <span className="text-lg font-bold text-stone-800">{formData.timbre_fiscal.toFixed(3)} <span className="text-xs opacity-50">DT</span></span>
                                </div>

                                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border-2 border-blue-100 mt-6 shadow-md shadow-blue-500/10">
                                    <span className="text-blue-900 font-black uppercase tracking-widest text-sm">Total TTC</span>
                                    <span className="text-2xl font-black text-blue-700">{totals.total.toLocaleString()} <span className="text-sm">DT</span></span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
