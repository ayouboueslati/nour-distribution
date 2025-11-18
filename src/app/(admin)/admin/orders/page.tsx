'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';

// Mock data
const orders = [
  { 
    id: 'CMD-001', 
    customer: 'Sarah Beauty', 
    type: 'B2B', 
    amount: '1,200€', 
    status: 'En attente', 
    date: '2025-01-15',
    items: 5
  },
  { 
    id: 'CMD-002', 
    customer: 'Marie Dupont', 
    type: 'B2C', 
    amount: '85€', 
    status: 'Traitée', 
    date: '2025-01-14',
    items: 2
  },
  { 
    id: 'CMD-003', 
    customer: 'Institut Afro', 
    type: 'B2B', 
    amount: '2,150€', 
    status: 'En attente de prix', 
    date: '2025-01-14',
    items: 8
  },
];

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter(order => 
    order.customer.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter === 'all' || order.status === statusFilter)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En attente': return 'bg-amber-100 text-amber-800';
      case 'Traitée': return 'bg-green-100 text-green-800';
      case 'En attente de prix': return 'bg-blue-100 text-blue-800';
      case 'Annulée': return 'bg-red-100 text-red-800';
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
        <h1 className="text-3xl font-light text-stone-800">Gestion des Commandes</h1>
        <div className="text-stone-600">
          {filteredOrders.length} commande(s) trouvée(s)
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Rechercher une commande..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              options={[
                { value: 'all', label: 'Tous les statuts' },
                { value: 'En attente', label: 'En attente' },
                { value: 'En attente de prix', label: 'En attente de prix' },
                { value: 'Traitée', label: 'Traitée' },
                { value: 'Annulée', label: 'Annulée' }
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

      {/* Orders Table */}
      <Card>
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Articles</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getTypeColor(order.type)}`}>
                      {order.type}
                    </span>
                  </TableCell>
                  <TableCell>{order.amount}</TableCell>
                  <TableCell>{order.items} article(s)</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Link 
                      href={`/admin/orders/${order.id}`}
                      className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                    >
                      Traiter
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-stone-400 text-lg">Aucune commande trouvée</div>
              <p className="text-stone-500 mt-2">Ajustez vos filtres pour voir plus de résultats</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}