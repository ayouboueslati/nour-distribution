'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, Button, Select, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Input } from "@/app/components/ui/index";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiService } from '@/app/lib/api';
import { Charge, ChargeCategory } from '@/types/analytics';
import { notificationService } from '@/app/lib/notifications';

const chargeCategories: { value: ChargeCategory; label: string }[] = [
    { value: 'rent', label: 'Loyer' },
    { value: 'utilities', label: 'Services (Eau, électricité...)' },
    { value: 'salaries', label: 'Salaires' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'supplies', label: 'Fournitures' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'other', label: 'Autre' }
];

export default function ChargesPage() {
    const [charges, setCharges] = useState<Charge[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [monthlyData, setMonthlyData] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [chargesRes, financialsRes] = await Promise.all([
                apiService.getCharges(),
                apiService.getFinancialAnalytics('year')
            ]);
            setCharges(chargesRes);
            if (financialsRes?.trend) {
                setMonthlyData(financialsRes.trend);
            }
        } catch (error) {
            console.error('Error loading charges:', error);
            notificationService.error('Erreur', 'Erreur lors du chargement des charges');
        } finally {
            setLoading(false);
        }
    };

    const filteredCharges = useMemo(() => {
        return charges.filter(charge => {
            const matchesSearch = charge.description.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || charge.category === categoryFilter;
            const matchesType = typeFilter === 'all' || charge.type === typeFilter;
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'validated' && charge.validated) ||
                (statusFilter === 'pending' && !charge.validated);

            return matchesSearch && matchesCategory && matchesType && matchesStatus;
        });
    }, [charges, search, categoryFilter, typeFilter, statusFilter]);

    const stats = useMemo(() => {
        const total = charges.reduce((sum, charge) => sum + charge.amount, 0);
        const validated = charges.filter(c => c.validated).reduce((sum, c) => sum + c.amount, 0);
        const pending = charges.filter(c => !c.validated).reduce((sum, c) => sum + c.amount, 0);
        const fixed = charges.filter(c => c.type === 'fixed').reduce((sum, c) => sum + c.amount, 0);
        return { total, validated, pending, fixed };
    }, [charges]);

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'rent': 'bg-green-100 text-green-800',
            'utilities': 'bg-blue-100 text-blue-800',
            'salaries': 'bg-yellow-100 text-yellow-800',
            'marketing': 'bg-purple-100 text-purple-800',
            'supplies': 'bg-amber-100 text-amber-800',
            'maintenance': 'bg-indigo-100 text-indigo-800',
            'other': 'bg-stone-100 text-stone-800'
        };
        return colors[category] || 'bg-stone-100 text-stone-800';
    };

    const handleValidateCharge = async (chargeId: string) => {
        try {
            await apiService.updateCharge(chargeId, { validated: true });
            setCharges(prev =>
                prev.map(charge =>
                    charge.id === chargeId ? { ...charge, validated: true } : charge
                )
            );
            notificationService.success('Succès', 'Charge validée avec succès');
        } catch (error) {
            notificationService.error('Erreur', 'Erreur lors de la validation');
        }
    };

    const handleDeleteCharge = async (chargeId: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette charge ?')) {
            try {
                await apiService.deleteCharge(chargeId);
                setCharges(prev => prev.filter(charge => charge.id !== chargeId));
                notificationService.success('Succès', 'Charge supprimée');
            } catch (error) {
                notificationService.error('Erreur', 'Erreur lors de la suppression');
            }
        }
    };

    const formatCurrency = (amount: number) => `${amount?.toLocaleString() || 0} DT`;

    if (loading && charges.length === 0) {
        return (
            <div className="p-6 space-y-6">
                <div className="h-10 w-64 bg-stone-200 animate-pulse rounded" />
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-stone-100 animate-pulse rounded-xl" />)}
                </div>
                <div className="h-96 bg-stone-100 animate-pulse rounded-xl" />
            </div>
        );
    }

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
                    value={formatCurrency(stats.total)}
                    icon="💸"
                    description="Toutes charges confondues"
                />
                <StatCard
                    title="Charges Validées"
                    value={formatCurrency(stats.validated)}
                    icon="✅"
                    description="Charges confirmées"
                    variant="success"
                />
                <StatCard
                    title="En Attente"
                    value={formatCurrency(stats.pending)}
                    icon="⏳"
                    description="Charges à valider"
                    variant="warning"
                />
                <StatCard
                    title="Charges Fixes"
                    value={formatCurrency(stats.fixed)}
                    icon="📊"
                    description="Dépenses récurrentes"
                    variant="info"
                />
            </div>

            {/* Filters */}
            <Card>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                            placeholder="Rechercher une charge..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Select
                            options={[
                                { value: 'all', label: 'Toutes catégories' },
                                ...chargeCategories.map(cat => ({ value: cat.value, label: cat.label }))
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
                            {loading ? 'Mise à jour...' : 'À jour'}
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
                                <TableHead>Statut</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCharges.map((charge) => (
                                <TableRow key={charge.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-stone-800">
                                                {new Date(charge.date).toLocaleDateString('fr-FR')}
                                            </p>
                                            {charge.recurrence && (
                                                <Badge variant="default" size="sm" className="mt-1">
                                                    {charge.recurrence === 'monthly' ? 'Mensuel' :
                                                        charge.recurrence === 'weekly' ? 'Hebdo' :
                                                            charge.recurrence === 'yearly' ? 'Annuel' : 'Ponctuel'}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-stone-800">{charge.description}</p>
                                            {charge.supplier && <p className="text-xs text-stone-500">{charge.supplier}</p>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="default" size="sm" className={getCategoryColor(charge.category)}>
                                            {chargeCategories.find(c => c.value === charge.category)?.label || charge.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-semibold text-stone-800">{formatCurrency(charge.amount)}</p>
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
                                                onClick={() => notificationService.info('Information', 'Fonctionnalité en cours de développement')}
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

                    {filteredCharges.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <div className="text-stone-400 text-lg">Aucune charge trouvée</div>
                            <p className="text-stone-500 mt-2">
                                {search || categoryFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all'
                                    ? 'Ajustez vos filtres pour voir plus de résultats'
                                    : 'Commencez par ajouter votre première charge'
                                }
                            </p>
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
                            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                                    formatter={(value: number) => [formatCurrency(value), 'Montant']}
                                />
                                <Legend />
                                <Bar
                                    dataKey="expenses"
                                    fill="#ef4444"
                                    radius={[4, 4, 0, 0]}
                                    name="Charges Globales"
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
