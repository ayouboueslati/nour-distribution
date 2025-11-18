'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, Button, Select, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Input } from "../../../../components/ui/index";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Types
interface Charge {
    id: string;
    date: string;
    category: string;
    description: string;
    amount: number;
    type: 'fixed' | 'variable';
    recurrence?: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    supplier?: string;
    validated: boolean;
}

const chargeCategories = [
    'Achats Produits',
    'Frais Transport',
    'Carburant (Gaz)',
    'Loyer & Utilities',
    'Salaires & Honoraires',
    'Marketing & Publicité',
    'Maintenance & Réparations',
    'Frais Bancaires',
    'Impôts & Taxes',
    'Assurances',
    'Divers'
];

const suppliers = [
    'Beauty Hair China',
    'Premium Locks Ltd',
    'African Hair Import',
    'Silky Strands Co',
    'Autre'
];


// chart data and component to the charges page
const monthlyChargesData = [
    { month: 'Jan', charges: 26500, manual: 4500 },
    { month: 'Fév', charges: 24200, manual: 3800 },
    { month: 'Mar', charges: 28750, manual: 5200 },
    { month: 'Avr', charges: 25500, manual: 4100 },
    { month: 'Mai', charges: 30200, manual: 4800 },
    { month: 'Juin', charges: 27800, manual: 4300 }
];

// Mock data
const initialCharges: Charge[] = [
    {
        id: 'CHG-001',
        date: '2025-01-15',
        category: 'Carburant (Gaz)',
        description: 'Plein essence - Livraison clients',
        amount: 350,
        type: 'variable',
        recurrence: 'weekly',
        validated: true
    },
    {
        id: 'CHG-002',
        date: '2025-01-10',
        category: 'Achats Produits',
        description: 'Commande cheveux brésilien - Beauty Hair',
        amount: 8500,
        type: 'variable',
        supplier: 'Beauty Hair China',
        validated: true
    },
    {
        id: 'CHG-003',
        date: '2025-01-05',
        category: 'Loyer & Utilities',
        description: 'Loyer entrepôt janvier',
        amount: 1200,
        type: 'fixed',
        recurrence: 'monthly',
        validated: true
    },
    {
        id: 'CHG-004',
        date: '2025-01-20',
        category: 'Marketing & Publicité',
        description: 'Campagne Instagram Ads',
        amount: 500,
        type: 'variable',
        validated: false
    }
];

export default function ChargesPage() {
    const [charges, setCharges] = useState<Charge[]>(initialCharges);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredCharges = charges.filter(charge => {
        const matchesSearch = charge.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || charge.category === categoryFilter;
        const matchesType = typeFilter === 'all' || charge.type === typeFilter;
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'validated' && charge.validated) ||
            (statusFilter === 'pending' && !charge.validated);

        return matchesSearch && matchesCategory && matchesType && matchesStatus;
    });

    const totalCharges = charges.reduce((sum, charge) => sum + charge.amount, 0);
    const validatedCharges = charges.filter(c => c.validated).reduce((sum, c) => sum + c.amount, 0);
    const pendingCharges = charges.filter(c => !c.validated).reduce((sum, c) => sum + c.amount, 0);
    const fixedCharges = charges.filter(c => c.type === 'fixed').reduce((sum, c) => sum + c.amount, 0);

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'Achats Produits': 'bg-red-100 text-red-800',
            'Carburant (Gaz)': 'bg-blue-100 text-blue-800',
            'Loyer & Utilities': 'bg-green-100 text-green-800',
            'Marketing & Publicité': 'bg-purple-100 text-purple-800',
            'Salaires & Honoraires': 'bg-yellow-100 text-yellow-800',
            'Frais Transport': 'bg-indigo-100 text-indigo-800'
        };
        return colors[category] || 'bg-stone-100 text-stone-800';
    };

    const handleValidateCharge = (chargeId: string) => {
        setCharges(prev =>
            prev.map(charge =>
                charge.id === chargeId ? { ...charge, validated: true } : charge
            )
        );
    };

    const handleDeleteCharge = (chargeId: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette charge ?')) {
            setCharges(prev => prev.filter(charge => charge.id !== chargeId));
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-light text-stone-800">Gestion des Charges</h1>
                    <p className="text-stone-600 mt-1">Suivez et catégorisez toutes vos dépenses</p>
                </div>
                <Link href="/admin/analytics/charges/new">
                    <Button variant="primary">
                        + Nouvelle Charge
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Charges Totales"
                    value={`${totalCharges.toLocaleString()}€`}
                    icon="💸"
                    description="Toutes charges confondues"
                />
                <StatCard
                    title="Charges Validées"
                    value={`${validatedCharges.toLocaleString()}€`}
                    icon="✅"
                    description="Charges confirmées"
                    variant="success"
                />
                <StatCard
                    title="En Attente"
                    value={`${pendingCharges.toLocaleString()}€`}
                    icon="⏳"
                    description="Charges à valider"
                    variant="warning"
                />
                <StatCard
                    title="Charges Fixes"
                    value={`${fixedCharges.toLocaleString()}€`}
                    icon="📊"
                    description="Dépenses récurrentes"
                    variant="info"
                />
            </div>

            {/* Smart Suggestions */}
            <Card>
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-stone-800 mb-4">💡 Suggestions Automatiques</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SuggestionCard
                            title="Charges Récurrentes"
                            description="Loyer entrepôt à venir le 1er février"
                            action="Créer"
                            type="fixed"
                        />
                        <SuggestionCard
                            title="Basé sur l'Historique"
                            description="Commande fournisseur habituelle ce mois-ci"
                            action="Pré-remplir"
                            type="supplier"
                        />
                    </div>
                </div>
            </Card>

            {/* Filters */}
            <Card>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <Input
                            placeholder="Rechercher une charge..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Select
                            options={[
                                { value: 'all', label: 'Toutes catégories' },
                                ...chargeCategories.map(cat => ({ value: cat, label: cat }))
                            ]}
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        />
                        <Select
                            options={[
                                { value: 'all', label: 'Tous types' },
                                { value: 'fixed', label: 'Charges fixes' },
                                { value: 'variable', label: 'Charges variables' }
                            ]}
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        />
                        <Select
                            options={[
                                { value: 'all', label: 'Tous statuts' },
                                { value: 'validated', label: 'Validées' },
                                { value: 'pending', label: 'En attente' }
                            ]}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        />
                        <Select
                            options={[
                                { value: 'all', label: 'Tous fournisseurs' },
                                ...suppliers.map(sup => ({ value: sup, label: sup }))
                            ]}
                            value="all"
                            onChange={() => { }}
                        />
                    </div>
                </div>
            </Card>

            {/* Charges Table */}
            <Card>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-stone-800">
                            Liste des Charges ({filteredCharges.length})
                        </h2>
                        <div className="text-sm text-stone-600">
                            Dernière mise à jour: Aujourd'hui
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Catégorie</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Fournisseur</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCharges.map((charge) => (
                                <TableRow key={charge.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-stone-800">{charge.date}</p>
                                            {charge.recurrence && (
                                                <Badge variant="default" size="sm">
                                                    {charge.recurrence === 'monthly' ? 'Mensuel' :
                                                        charge.recurrence === 'weekly' ? 'Hebdo' :
                                                            charge.recurrence === 'yearly' ? 'Annuel' : 'Ponctuel'}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-medium text-stone-800">{charge.description}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="default" size="sm" className={getCategoryColor(charge.category)}>
                                            {charge.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-semibold text-stone-800">{charge.amount.toLocaleString()}€</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={charge.type === 'fixed' ? 'info' : 'warning'}
                                            size="sm"
                                        >
                                            {charge.type === 'fixed' ? 'Fixe' : 'Variable'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {charge.supplier ? (
                                            <p className="text-sm text-stone-600">{charge.supplier}</p>
                                        ) : (
                                            <span className="text-stone-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {charge.validated ? (
                                            <Badge variant="success" size="sm">Validée</Badge>
                                        ) : (
                                            <Badge variant="warning" size="sm">En attente</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            {!charge.validated && (
                                                <button
                                                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                                                    onClick={() => handleValidateCharge(charge.id)}
                                                >
                                                    Valider
                                                </button>
                                            )}
                                            <button
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                onClick={() => console.log('Edit', charge.id)}
                                            >
                                                Modifier
                                            </button>
                                            <button
                                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                onClick={() => handleDeleteCharge(charge.id)}
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredCharges.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-stone-400 text-lg">Aucune charge trouvée</div>
                            <p className="text-stone-500 mt-2">
                                {search || categoryFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all'
                                    ? 'Ajustez vos filtres pour voir plus de résultats'
                                    : 'Commencez par ajouter votre première charge'
                                }
                            </p>
                            {(search === '' && categoryFilter === 'all' && typeFilter === 'all' && statusFilter === 'all') && (
                                <Link href="/admin/analytics/charges/new" className="inline-block mt-4">
                                    <Button variant="primary">
                                        + Ajouter une Charge
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </Card>
            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-stone-800 mb-4">
                        Évolution des Charges Mensuelles
                    </h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyChargesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: '#6b7280' }}
                                    axisLine={{ stroke: '#e5e7eb' }}
                                />
                                <YAxis
                                    tick={{ fill: '#6b7280' }}
                                    axisLine={{ stroke: '#e5e7eb' }}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <Tooltip
                                    formatter={(value: number) => [`${value.toLocaleString()}€`, 'Montant']}
                                />
                                <Bar
                                    dataKey="charges"
                                    fill="#ef4444"
                                    radius={[4, 4, 0, 0]}
                                    name="Charges Totales"
                                />
                                <Bar
                                    dataKey="manual"
                                    fill="#f97316"
                                    radius={[4, 4, 0, 0]}
                                    name="Charges Manuelles"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </Card>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
    description,
    variant = 'default'
}: {
    title: string;
    value: string;
    icon: string;
    description: string;
    variant?: 'default' | 'success' | 'warning' | 'info';
}) {
    const variantStyles = {
        default: 'bg-stone-50 border-stone-200',
        success: 'bg-green-50 border-green-200',
        warning: 'bg-amber-50 border-amber-200',
        info: 'bg-blue-50 border-blue-200'
    };

    return (
        <Card className={`border-2 ${variantStyles[variant]} hover:shadow-md transition-all duration-200`}>
            <div className="flex items-center justify-between p-4">
                <div>
                    <p className="text-sm font-medium text-stone-600">{title}</p>
                    <p className="text-2xl font-semibold text-stone-800 mt-1">{value}</p>
                    <p className="text-xs text-stone-500 mt-1">{description}</p>
                </div>
                <span className="text-2xl">{icon}</span>
            </div>
        </Card>
    );
}

function SuggestionCard({
    title,
    description,
    action,
    type
}: {
    title: string;
    description: string;
    action: string;
    type: 'fixed' | 'supplier';
}) {
    return (
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 flex items-center justify-between">
            <div>
                <p className="font-medium text-stone-800">{title}</p>
                <p className="text-sm text-stone-600 mt-1">{description}</p>
            </div>
            <Button variant="secondary" size="sm">
                {action}
            </Button>
        </div>
    );
}