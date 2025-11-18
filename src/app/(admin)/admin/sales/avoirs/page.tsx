// frontend/src/app/(admin)/admin/sales/avoirs/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/Table';

// Mock data for avoirs
const avoirsData = [
  { 
    id: 'AVO-001', 
    client: 'Sarah Beauty', 
    factureId: 'FAC-001',
    montant: '120€',
    raison: 'Retour produit',
    statut: 'Utilisé',
    dateCreation: '2025-01-25',
    dateExpiration: '2025-07-25'
  },
  { 
    id: 'AVO-002', 
    client: 'Institut Afro', 
    factureId: 'FAC-002',
    montant: '245€',
    raison: 'Erreur de prix',
    statut: 'Disponible',
    dateCreation: '2025-01-20',
    dateExpiration: '2025-07-20'
  },
  { 
    id: 'AVO-003', 
    client: 'Coiffure Élégance', 
    factureId: 'FAC-003',
    montant: '90€',
    raison: 'Remise commerciale',
    statut: 'Expiré',
    dateCreation: '2024-12-15',
    dateExpiration: '2024-06-15'
  },
];

export default function AvoirsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredAvoirs = avoirsData.filter(avoir => 
    avoir.client.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter === 'all' || avoir.statut === statusFilter)
  );

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Disponible': return 'bg-green-100 text-green-800';
      case 'Utilisé': return 'bg-blue-100 text-blue-800';
      case 'Expiré': return 'bg-red-100 text-red-800';
      case 'Annulé': return 'bg-stone-100 text-stone-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  const totalAvoirs = avoirsData.reduce((sum, a) => 
    sum + parseFloat(a.montant.replace('€', '')), 0
  );
  const avoirsDisponibles = avoirsData
    .filter(a => a.statut === 'Disponible')
    .reduce((sum, a) => sum + parseFloat(a.montant.replace('€', '')), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-stone-800">Gestion des Avoirs</h1>
          <p className="text-stone-600 mt-1">Créez et gérez les avoirs et notes de crédit</p>
        </div>
        <Link href="/admin/sales/avoirs/new">
          <Button variant="primary">
            + Nouvel Avoir
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Avoirs" value={avoirsData.length.toString()} icon="💳" />
        <StatCard title="Montant Total" value={`${totalAvoirs}€`} icon="💰" />
        <StatCard title="Disponibles" value={`${avoirsDisponibles}€`} icon="✅" variant="success" />
        <StatCard title="Expirés" value="1" icon="⏰" variant="danger" />
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Rechercher un avoir..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              options={[
                { value: 'all', label: 'Tous les statuts' },
                { value: 'Disponible', label: 'Disponible' },
                { value: 'Utilisé', label: 'Utilisé' },
                { value: 'Expiré', label: 'Expiré' },
                { value: 'Annulé', label: 'Annulé' }
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <Select
              options={[
                { value: 'all', label: 'Toutes les raisons' },
                { value: 'Retour produit', label: 'Retour produit' },
                { value: 'Erreur de prix', label: 'Erreur de prix' },
                { value: 'Remise commerciale', label: 'Remise commerciale' },
                { value: 'Annulation', label: 'Annulation commande' }
              ]}
              value="all"
              onChange={() => {}}
            />
          </div>
        </div>
      </Card>

      {/* Avoirs Table */}
      <Card>
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Avoir</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Facture Liée</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead>Création</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAvoirs.map((avoir) => (
                <TableRow key={avoir.id}>
                  <TableCell className="font-medium">{avoir.id}</TableCell>
                  <TableCell>{avoir.client}</TableCell>
                  <TableCell>
                    <Link 
                      href={`/admin/sales/factures/${avoir.factureId}`}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      {avoir.factureId}
                    </Link>
                  </TableCell>
                  <TableCell className="font-semibold">{avoir.montant}</TableCell>
                  <TableCell>{avoir.raison}</TableCell>
                  <TableCell>{avoir.dateCreation}</TableCell>
                  <TableCell className={
                    avoir.statut === 'Expiré' ? 'text-red-600 font-medium' : ''
                  }>
                    {avoir.dateExpiration}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(avoir.statut)}`}>
                      {avoir.statut}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-3">
                      <Link 
                        href={`/admin/sales/avoirs/${avoir.id}`}
                        className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                      >
                        Voir
                      </Link>
                      {avoir.statut === 'Disponible' && (
                        <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                          Utiliser
                        </button>
                      )}
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        PDF
                      </button>
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                        Annuler
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredAvoirs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-stone-400 text-lg">Aucun avoir trouvé</div>
              <p className="text-stone-500 mt-2">
                {search || statusFilter !== 'all' 
                  ? 'Ajustez vos filtres pour voir plus de résultats' 
                  : 'Créez votre premier avoir pour un retour ou une régularisation'
                }
              </p>
              {(search === '' && statusFilter === 'all') && (
                <Link href="/admin/sales/avoirs/new" className="inline-block mt-4">
                  <Button variant="primary">
                    + Créer un Avoir
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
  variant = 'default' 
}: { 
  title: string; 
  value: string; 
  icon: string; 
  variant?: 'default' | 'success' | 'danger';
}) {
  const variantStyles = {
    default: 'bg-stone-50 border-stone-200',
    success: 'bg-green-50 border-green-200',
    danger: 'bg-red-50 border-red-200'
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