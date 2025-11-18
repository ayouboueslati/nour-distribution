// frontend/src/app/(admin)/admin/suppliers/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '@/app/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';

// Mock data for suppliers
const suppliersData = [
    {
        id: 'FOUR-001',
        nom: 'Beauty Hair China',
        telephone: '+86 138 0013 8000',
        email: 'contact@beautyhair.cn',
        adresse: '123 Hair Street, Guangzhou, China',
        type: 'Fabricant',
        specialite: 'Cheveux Brésilien',
        statut: 'Actif',
        note: 4.5,
        commandesEnCours: 2,
        delaiMoyen: '15 jours',
        dateAjout: '2024-06-15',
        derniereCommande: '2025-01-10'
    },
    {
        id: 'FOUR-002',
        nom: 'Premium Locks Ltd',
        telephone: '+44 20 7946 0958',
        email: 'sales@premiumlocks.co.uk',
        adresse: '45 Wig Lane, London, UK',
        type: 'Distributeur',
        specialite: 'Perruques Lace Front',
        statut: 'Actif',
        note: 4.2,
        commandesEnCours: 1,
        delaiMoyen: '10 jours',
        dateAjout: '2024-08-22',
        derniereCommande: '2025-01-12'
    },
    {
        id: 'FOUR-003',
        nom: 'African Hair Import',
        telephone: '+233 24 123 4567',
        email: '',
        adresse: 'Accra, Ghana',
        type: 'Importateur',
        specialite: 'Cheveux Naturels Africains',
        statut: 'Inactif',
        note: 3.8,
        commandesEnCours: 0,
        delaiMoyen: '25 jours',
        dateAjout: '2024-03-10',
        derniereCommande: '2024-11-05'
    },
    {
        id: 'FOUR-004',
        nom: 'Silky Strands Co',
        telephone: '+1 555 012 3456',
        email: 'orders@silkystrands.com',
        adresse: '789 Beauty Ave, Los Angeles, USA',
        type: 'Fabricant',
        specialite: 'Mèches Malaisie',
        statut: 'Actif',
        note: 4.7,
        commandesEnCours: 3,
        delaiMoyen: '12 jours',
        dateAjout: '2024-09-30',
        derniereCommande: '2025-01-14'
    },
];

export default function SuppliersPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const filteredSuppliers = suppliersData.filter(supplier =>
        supplier.nom.toLowerCase().includes(search.toLowerCase()) &&
        (statusFilter === 'all' || supplier.statut === statusFilter) &&
        (typeFilter === 'all' || supplier.type === typeFilter)
    );

    const getStatusColor = (statut: string) => {
        return statut === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Fabricant': return 'bg-blue-100 text-blue-800';
            case 'Distributeur': return 'bg-purple-100 text-purple-800';
            case 'Importateur': return 'bg-amber-100 text-amber-800';
            default: return 'bg-stone-100 text-stone-800';
        }
    };

    const getNoteColor = (note: number) => {
        if (note >= 4.5) return 'text-green-600';
        if (note >= 4.0) return 'text-amber-600';
        return 'text-red-600';
    };

    // Statistics
    const totalSuppliers = suppliersData.length;
    const activeSuppliers = suppliersData.filter(s => s.statut === 'Actif').length;
    const topRatedSuppliers = suppliersData.filter(s => s.note >= 4.5).length;
    const pendingOrders = suppliersData.reduce((sum, s) => sum + s.commandesEnCours, 0);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-light text-stone-800">Gestion des Fournisseurs</h1>
                    <p className="text-stone-600 mt-1">Gérez vos partenaires et chaîne d'approvisionnement</p>
                </div>
                <Link href="/admin/suppliers/new">
                    <Button variant="primary">
                        + Nouveau Fournisseur
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total Fournisseurs"
                    value={totalSuppliers.toString()}
                    icon="🏭"
                    description="Partenaires actifs et inactifs"
                />
                <StatCard
                    title="Actifs"
                    value={activeSuppliers.toString()}
                    icon="✅"
                    description="Fournisseurs en activité"
                    variant="success"
                />
                <StatCard
                    title="Bien Notés"
                    value={topRatedSuppliers.toString()}
                    icon="⭐"
                    description="Note ≥ 4.5/5"
                    variant="warning"
                />
                <StatCard
                    title="Commandes en Cours"
                    value={pendingOrders.toString()}
                    icon="📦"
                    description="Avec les fournisseurs"
                    variant="info"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickActionCard
                    title="📋 Passer une Commande"
                    description="Créer un bon de commande"
                    action="Créer"
                    onClick={() => console.log('Create purchase order')}
                    color="bg-amber-500"
                />
                <QuickActionCard
                    title="📊 Performance"
                    description="Analyser les fournisseurs"
                    action="Voir"
                    onClick={() => console.log('View performance')}
                    color="bg-blue-500"
                />
                <QuickActionCard
                    title="💬 Contact Rapide"
                    description="Envoyer un message groupé"
                    action="Contacter"
                    onClick={() => console.log('Quick contact')}
                    color="bg-green-500"
                />
            </div>

            {/* Filters */}
            <Card>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                            placeholder="Rechercher un fournisseur..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Select
                            options={[
                                { value: 'all', label: 'Tous les statuts' },
                                { value: 'Actif', label: 'Actif' },
                                { value: 'Inactif', label: 'Inactif' }
                            ]}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        />
                        <Select
                            options={[
                                { value: 'all', label: 'Tous les types' },
                                { value: 'Fabricant', label: 'Fabricant' },
                                { value: 'Distributeur', label: 'Distributeur' },
                                { value: 'Importateur', label: 'Importateur' }
                            ]}
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        />
                        <Select
                            options={[
                                { value: 'all', label: 'Toutes spécialités' },
                                { value: 'Cheveux Brésilien', label: 'Brésilien' },
                                { value: 'Mèches Malaisie', label: 'Malaisie' },
                                { value: 'Perruques Lace Front', label: 'Perruques' },
                                { value: 'Cheveux Naturels Africains', label: 'Naturels Africains' }
                            ]}
                            value="all"
                            onChange={() => { }}
                        />
                    </div>
                </div>
            </Card>

            {/* Suppliers Table */}
            <Card>
                <div className="p-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fournisseur</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Spécialité</TableHead>
                                <TableHead>Note</TableHead>
                                <TableHead>Commandes</TableHead>
                                <TableHead>Délai</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSuppliers.map((supplier) => (
                                <TableRow key={supplier.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-stone-800">{supplier.nom}</p>
                                            <p className="text-sm text-stone-500">Ajouté le {supplier.dateAjout}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">{supplier.telephone}</p>
                                            {supplier.email && (
                                                <p className="text-sm text-stone-600">{supplier.email}</p>
                                            )}
                                            {supplier.adresse && (
                                                <p className="text-xs text-stone-500 truncate max-w-[200px]">
                                                    {supplier.adresse}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getTypeVariant(supplier.type)} size="sm">
                                            {supplier.type}
                                        </Badge>
                                        
                                    </TableCell>
                                    <TableCell>{supplier.specialite}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-1">
                                            <span className={`font-semibold ${getNoteColor(supplier.note)}`}>
                                                {supplier.note}
                                            </span>
                                            <span className="text-amber-500">★</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-center">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${supplier.commandesEnCours > 0
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-stone-100 text-stone-800'
                                                }`}>
                                                {supplier.commandesEnCours}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-stone-600">{supplier.delaiMoyen}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(supplier.statut)}`}>
                                            {supplier.statut}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Link
                                                href={`/admin/suppliers/${supplier.id}`}
                                                className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                                            >
                                                Voir
                                            </Link>
                                            <button
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                onClick={() => console.log('Contact', supplier.id)}
                                            >
                                                Contacter
                                            </button>
                                            <button
                                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                onClick={() => console.log('Delete', supplier.id)}
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredSuppliers.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-stone-400 text-lg">Aucun fournisseur trouvé</div>
                            <p className="text-stone-500 mt-2">
                                {search || statusFilter !== 'all' || typeFilter !== 'all'
                                    ? 'Ajustez vos filtres pour voir plus de résultats'
                                    : 'Commencez par ajouter votre premier fournisseur'
                                }
                            </p>
                            {(search === '' && statusFilter === 'all' && typeFilter === 'all') && (
                                <Link href="/admin/suppliers/new" className="inline-block mt-4">
                                    <Button variant="primary">
                                        + Ajouter un Fournisseur
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}
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

const getTypeVariant = (type: string) => {
  switch (type) {
    case 'Fabricant': return 'info';
    case 'Distributeur': return 'default';
    case 'Importateur': return 'warning';
    default: return 'default';
  }
};

function QuickActionCard({
    title,
    description,
    action,
    onClick,
    color
}: {
    title: string;
    description: string;
    action: string;
    onClick: () => void;
    color: string;
}) {
    return (
        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div
                className="p-4 flex items-center justify-between"
                onClick={onClick}
            >
                <div>
                    <p className="font-medium text-stone-800">{title}</p>
                    <p className="text-sm text-stone-600 mt-1">{description}</p>
                </div>
                <div className={`${color} text-white p-2 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                    {action}
                </div>
            </div>
        </Card>
    );
}