'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Input, Select, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from '../../../components/ui';
import { apiService } from '../../../lib/api';
import { Supplier } from '../../../../types';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSuppliers();
      setSuppliers(response.suppliers || []);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des fournisseurs');
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.company_name.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter === 'all' ||
      (statusFilter === 'active' && supplier.is_active) ||
      (statusFilter === 'inactive' && !supplier.is_active)
    ) &&
    (typeFilter === 'all' || supplier.tags?.includes(typeFilter))
  );

  const handleDeleteSupplier = async (supplierId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      try {
        await apiService.deleteSupplier(supplierId);
        await fetchSuppliers();
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la suppression');
      }
    }
  };

  // Statistics
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.is_active).length;
  const preferredSuppliers = suppliers.filter(s => s.is_preferred).length;
  const totalProducts = suppliers.reduce((sum, s) => sum + (s.products_count || 0), 0);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-72 bg-stone-200 rounded skeleton mb-2"></div>
            <div className="h-4 w-56 bg-stone-200 rounded skeleton"></div>
          </div>
          <div className="h-10 w-48 bg-stone-200 rounded-lg skeleton"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 p-6 animate-pulse" style={{ animationDelay: `${i * 75}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-stone-200 rounded w-1/2 skeleton"></div>
                <div className="w-10 h-10 bg-stone-200 rounded-lg skeleton"></div>
              </div>
              <div className="h-8 bg-stone-200 rounded w-1/3 skeleton"></div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-stone-200 rounded skeleton"></div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="divide-y divide-stone-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="grid grid-cols-8 gap-4">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <div key={j} className="h-4 bg-stone-200 rounded skeleton"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-stone-800">Gestion des Fournisseurs</h1>
          <p className="text-stone-600 mt-1">Gérez vos partenaires et chaîne d'approvisionnement</p>
        </div>
        <Link href="/admin/suppliers/new">
          <Button variant="primary">+ Nouveau Fournisseur</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Fournisseurs" value={totalSuppliers.toString()} icon="🏭" />
        <StatCard title="Actifs" value={activeSuppliers.toString()} icon="✅" variant="success" />
        <StatCard title="Préférés" value={preferredSuppliers.toString()} icon="⭐" variant="warning" />
        <StatCard title="Produits Total" value={totalProducts.toString()} icon="📦" variant="info" />
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
                { value: 'active', label: 'Actif' },
                { value: 'inactive', label: 'Inactif' }
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <Select
              options={[
                { value: 'all', label: 'Tous les types' },
                { value: 'fabricant', label: 'Fabricant' },
                { value: 'distributeur', label: 'Distributeur' },
                { value: 'importateur', label: 'Importateur' }
              ]}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
            <Select
              options={[
                { value: 'all', label: 'Tous' },
                { value: 'preferred', label: 'Préférés seulement' }
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
                <TableHead>Adresse</TableHead>
                <TableHead>Produits</TableHead>
                <TableHead>Note</TableHead>
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
                      <p className="font-medium text-stone-800">{supplier.company_name}</p>
                      <p className="text-sm text-stone-500">{supplier.legal_name}</p>
                      {supplier.is_preferred && (
                        <Badge variant="warning" size="sm" className="mt-1">⭐ Préféré</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">{supplier.contact_person}</p>
                      <p className="text-sm text-stone-600">{supplier.email}</p>
                      <p className="text-sm text-stone-600">{supplier.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-stone-600 max-w-[200px] truncate">
                      {supplier.full_address}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-stone-100 rounded-full text-sm font-medium">
                        {supplier.products_count || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold">
                        {((supplier.reliability_rating + supplier.quality_rating + supplier.communication_rating) / 3).toFixed(1)}
                      </span>
                      <span className="text-amber-500">★</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-stone-600">{supplier.lead_time_days} jours</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={supplier.is_active ? 'success' : 'default'}
                      size="sm"
                    >
                      {supplier.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/suppliers/${supplier.id}`}
                        className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                      >
                        Voir
                      </Link>
                      <Link
                        href={`/admin/suppliers/${supplier.id}/edit`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Modifier
                      </Link>
                      <button
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                        onClick={() => handleDeleteSupplier(supplier.id)}
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
                {search || statusFilter !== 'all'
                  ? 'Ajustez vos filtres pour voir plus de résultats'
                  : 'Commencez par ajouter votre premier fournisseur'
                }
              </p>
              {(search === '' && statusFilter === 'all') && (
                <Link href="/admin/suppliers/new" className="inline-block mt-4">
                  <Button variant="primary">+ Ajouter un Fournisseur</Button>
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
  variant = 'default'
}: {
  title: string;
  value: string;
  icon: string;
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
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </Card>
  );
}