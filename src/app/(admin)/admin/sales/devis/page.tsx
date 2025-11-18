'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/Table';

// Mock data for devis
const devisData = [
  { 
    id: 'DEV-001', 
    client: 'Sarah Beauty', 
    type: 'B2B',
    montant: '1,200€',
    statut: 'En attente',
    dateCreation: '2025-01-15',
    dateExpiration: '2025-02-15',
    items: 5,
    clientId: 'CLI-001'
  },
  { 
    id: 'DEV-002', 
    client: 'Institut Afro', 
    type: 'B2B',
    montant: '2,450€',
    statut: 'Accepté',
    dateCreation: '2025-01-10',
    dateExpiration: '2025-02-10',
    items: 8,
    clientId: 'CLI-002'
  },
  { 
    id: 'DEV-003', 
    client: 'Marie Dupont', 
    type: 'B2C',
    montant: '85€',
    statut: 'Refusé',
    dateCreation: '2025-01-08',
    dateExpiration: '2025-02-08',
    items: 2,
    clientId: 'CLI-003'
  },
  { 
    id: 'DEV-004', 
    client: 'Coiffure Élégance', 
    type: 'B2B',
    montant: '1,800€',
    statut: 'Transformé en facture',
    dateCreation: '2025-01-05',
    dateExpiration: '2025-02-05',
    items: 6,
    clientId: 'CLI-004',
    factureId: 'FAC-001'
  },
];

export default function DevisPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredDevis = devisData.filter(devis => 
    devis.client.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter === 'all' || devis.statut === statusFilter)
  );

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'En attente': return 'bg-amber-100 text-amber-800';
      case 'Accepté': return 'bg-green-100 text-green-800';
      case 'Refusé': return 'bg-red-100 text-red-800';
      case 'Transformé en facture': return 'bg-blue-100 text-blue-800';
      case 'Expiré': return 'bg-stone-100 text-stone-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'B2B' ? 'bg-purple-100 text-purple-800' : 'bg-cyan-100 text-cyan-800';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-stone-800">Gestion des Devis</h1>
          <p className="text-stone-600 mt-1">Créez et gérez vos devis pour vos clients B2B et B2C</p>
        </div>
        <Link href="/admin/sales/devis/new">
          <Button variant="primary">
            + Nouveau Devis
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Devis" value={devisData.length.toString()} icon="📊" />
        <StatCard title="En attente" value="1" icon="⏳" variant="warning" />
        <StatCard title="Acceptés" value="1" icon="✅" variant="success" />
        <StatCard title="Transformés" value="1" icon="🧾" variant="info" />
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Rechercher un devis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              options={[
                { value: 'all', label: 'Tous les statuts' },
                { value: 'En attente', label: 'En attente' },
                { value: 'Accepté', label: 'Accepté' },
                { value: 'Refusé', label: 'Refusé' },
                { value: 'Transformé en facture', label: 'Transformé en facture' },
                { value: 'Expiré', label: 'Expiré' }
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <Select
              options={[
                { value: 'all', label: 'B2B et B2C' },
                { value: 'B2B', label: 'Professionnels (B2B)' },
                { value: 'B2C', label: 'Particuliers (B2C)' }
              ]}
              value="all"
              onChange={() => {}}
            />
          </div>
        </div>
      </Card>

      {/* Devis Table */}
      <Card>
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Devis</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Articles</TableHead>
                <TableHead>Création</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevis.map((devis) => (
                <TableRow key={devis.id}>
                  <TableCell className="font-medium">{devis.id}</TableCell>
                  <TableCell>{devis.client}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getTypeColor(devis.type)}`}>
                      {devis.type}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">{devis.montant}</TableCell>
                  <TableCell>{devis.items} article(s)</TableCell>
                  <TableCell>{devis.dateCreation}</TableCell>
                  <TableCell>{devis.dateExpiration}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(devis.statut)}`}>
                      {devis.statut}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-3">
                      <Link 
                        href={`/admin/sales/devis/${devis.id}`}
                        className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                      >
                        Voir
                      </Link>
                      {devis.statut === 'En attente' && (
                        <>
                          <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                            Accepter
                          </button>
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Facturer
                          </button>
                        </>
                      )}
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                        Supprimer
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredDevis.length === 0 && (
            <div className="text-center py-12">
              <div className="text-stone-400 text-lg">Aucun devis trouvé</div>
              <p className="text-stone-500 mt-2">
                {search || statusFilter !== 'all' 
                  ? 'Ajustez vos filtres pour voir plus de résultats' 
                  : 'Commencez par créer votre premier devis'
                }
              </p>
              {(search === '' && statusFilter === 'all') && (
                <Link href="/admin/sales/devis/new" className="inline-block mt-4">
                  <Button variant="primary">
                    + Créer un Devis
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