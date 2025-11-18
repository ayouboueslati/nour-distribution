// frontend/src/app/(admin)/admin/sales/factures/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/Table';

// Mock data for factures
const facturesData = [
  { 
    id: 'FAC-001', 
    client: 'Sarah Beauty', 
    type: 'B2B',
    montant: '1,200€',
    statut: 'Payée',
    dateEmission: '2025-01-20',
    dateEcheance: '2025-02-20',
    devisId: 'DEV-001',
    modePaiement: 'Virement'
  },
  { 
    id: 'FAC-002', 
    client: 'Institut Afro', 
    type: 'B2B',
    montant: '2,450€',
    statut: 'En retard',
    dateEmission: '2025-01-15',
    dateEcheance: '2025-01-30',
    devisId: 'DEV-002',
    modePaiement: 'Chèque'
  },
  { 
    id: 'FAC-003', 
    client: 'Coiffure Élégance', 
    type: 'B2B',
    montant: '1,800€',
    statut: 'En attente',
    dateEmission: '2025-01-18',
    dateEcheance: '2025-02-18',
    devisId: 'DEV-004',
    modePaiement: 'Virement'
  },
  { 
    id: 'FAC-004', 
    client: 'Marie Dupont', 
    type: 'B2C',
    montant: '85€',
    statut: 'Partiellement payée',
    dateEmission: '2025-01-12',
    dateEcheance: '2025-02-12',
    devisId: null,
    modePaiement: 'Espèces'
  },
];

export default function FacturesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredFactures = facturesData.filter(facture => 
    facture.client.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter === 'all' || facture.statut === statusFilter)
  );

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'Payée': return 'bg-green-100 text-green-800';
      case 'En attente': return 'bg-amber-100 text-amber-800';
      case 'En retard': return 'bg-red-100 text-red-800';
      case 'Partiellement payée': return 'bg-blue-100 text-blue-800';
      case 'Annulée': return 'bg-stone-100 text-stone-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'B2B' ? 'bg-purple-100 text-purple-800' : 'bg-cyan-100 text-cyan-800';
  };

  const totalChiffreAffaires = facturesData
    .filter(f => f.statut === 'Payée')
    .reduce((sum, f) => sum + parseFloat(f.montant.replace('€', '').replace(',', '')), 0);

  const totalEnAttente = facturesData
    .filter(f => f.statut === 'En attente')
    .reduce((sum, f) => sum + parseFloat(f.montant.replace('€', '').replace(',', '')), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-stone-800">Gestion des Factures</h1>
          <p className="text-stone-600 mt-1">Suivez et gérez vos factures et paiements</p>
        </div>
        <Link href="/admin/sales/factures/new">
          <Button variant="primary">
            + Nouvelle Facture
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Factures" value={facturesData.length.toString()} icon="🧾" />
        <StatCard title="Chiffre d'affaires" value={`${totalChiffreAffaires}€`} icon="💰" variant="success" />
        <StatCard title="En attente" value={`${totalEnAttente}€`} icon="⏳" variant="warning" />
        <StatCard title="En retard" value="1" icon="⚠️" variant="danger" />
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Rechercher une facture..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              options={[
                { value: 'all', label: 'Tous les statuts' },
                { value: 'Payée', label: 'Payée' },
                { value: 'En attente', label: 'En attente' },
                { value: 'En retard', label: 'En retard' },
                { value: 'Partiellement payée', label: 'Partiellement payée' },
                { value: 'Annulée', label: 'Annulée' }
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <Select
              options={[
                { value: 'all', label: 'Tous les modes' },
                { value: 'Virement', label: 'Virement' },
                { value: 'Chèque', label: 'Chèque' },
                { value: 'Espèces', label: 'Espèces' },
                { value: 'Carte', label: 'Carte bancaire' }
              ]}
              value="all"
              onChange={() => {}}
            />
          </div>
        </div>
      </Card>

      {/* Factures Table */}
      <Card>
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Facture</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Devis</TableHead>
                <TableHead>Émission</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Paiement</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFactures.map((facture) => (
                <TableRow key={facture.id}>
                  <TableCell className="font-medium">{facture.id}</TableCell>
                  <TableCell>{facture.client}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getTypeColor(facture.type)}`}>
                      {facture.type}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">{facture.montant}</TableCell>
                  <TableCell>
                    {facture.devisId ? (
                      <Link 
                        href={`/admin/sales/devis/${facture.devisId}`}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        {facture.devisId}
                      </Link>
                    ) : (
                      <span className="text-stone-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>{facture.dateEmission}</TableCell>
                  <TableCell className={
                    facture.statut === 'En retard' ? 'text-red-600 font-medium' : ''
                  }>
                    {facture.dateEcheance}
                  </TableCell>
                  <TableCell>{facture.modePaiement}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(facture.statut)}`}>
                      {facture.statut}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-3">
                      <Link 
                        href={`/admin/sales/factures/${facture.id}`}
                        className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                      >
                        Voir
                      </Link>
                      <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                        PDF
                      </button>
                      {facture.statut !== 'Payée' && (
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Payer
                        </button>
                      )}
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                        Avoir
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredFactures.length === 0 && (
            <div className="text-center py-12">
              <div className="text-stone-400 text-lg">Aucune facture trouvée</div>
              <p className="text-stone-500 mt-2">
                {search || statusFilter !== 'all' 
                  ? 'Ajustez vos filtres pour voir plus de résultats' 
                  : 'Créez votre première facture à partir d\'un devis ou d\'une commande'
                }
              </p>
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
  variant?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const variantStyles = {
    default: 'bg-stone-50 border-stone-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-amber-50 border-amber-200',
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