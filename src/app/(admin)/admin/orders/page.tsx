'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { apiService } from '../../../lib/api';

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    confirmed: 0
  });

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await apiService.getOrders(params);
      setOrders(response.orders || response);

      // Calculate stats
      const allOrders = response.orders || response;
      setStats({
        total: allOrders.length,
        pending: allOrders.filter((o: any) => o.status === 'en_attente').length,
        processing: allOrders.filter((o: any) => o.status === 'en_traitement').length,
        confirmed: allOrders.filter((o: any) => o.status === 'confirme').length
      });
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.client?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    order.client?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    order.client?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    order.order_number?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return 'bg-amber-100 text-amber-800';
      case 'en_traitement': return 'bg-blue-100 text-blue-800';
      case 'confirme': return 'bg-green-100 text-green-800';
      case 'annule': return 'bg-red-100 text-red-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'en_traitement': return 'En traitement';
      case 'confirme': return 'Confirmée';
      case 'annule': return 'Annulée';
      default: return status;
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'b2b' ? 'bg-purple-100 text-purple-800' : 'bg-cyan-100 text-cyan-800';
  };

  const getTypeLabel = (type: string) => {
    return type === 'b2b' ? 'B2B' : 'B2C';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatAmount = (amount: number) => {
    if (!amount) return 'Non défini';
    return `${amount.toFixed(2)} DT`;
  };

  const getClientName = (client: any) => {
    if (!client) return 'Client inconnu';
    if (client.type === 'b2b') {
      return client.company_name || 'Entreprise';
    }
    return `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Client';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-64 bg-stone-200 rounded skeleton mb-2"></div>
            <div className="h-4 w-48 bg-stone-200 rounded skeleton"></div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 p-6 animate-pulse" style={{ animationDelay: `${i * 75}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-stone-200 rounded w-1/2 skeleton"></div>
                <div className="w-10 h-10 bg-stone-200 rounded-lg skeleton"></div>
              </div>
              <div className="h-8 bg-stone-200 rounded w-1/3 skeleton"></div>
            </div>
          ))}</div>

        {/* Filters Skeleton */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-stone-200 rounded skeleton"></div>
            ))}
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="divide-y divide-stone-100">
            {Array.from({ length: 6 }).map((_, i) => (
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
          <h1 className="text-3xl font-light text-stone-800">Gestion des Commandes</h1>
          <p className="text-stone-600 mt-1">
            {filteredOrders.length} commande(s) trouvée(s)
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total" value={stats.total.toString()} icon="📦" />
        <StatCard title="En attente" value={stats.pending.toString()} icon="⏳" variant="warning" />
        <StatCard title="En traitement" value={stats.processing.toString()} icon="⚙️" variant="info" />
        <StatCard title="Confirmées" value={stats.confirmed.toString()} icon="✅" variant="success" />
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
                { value: 'en_attente', label: 'En attente' },
                { value: 'en_traitement', label: 'En traitement' },
                { value: 'confirme', label: 'Confirmée' },
                { value: 'annule', label: 'Annulée' }
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <button
              onClick={loadOrders}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              🔄 Actualiser
            </button>
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
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>{getClientName(order.client)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getTypeColor(order.client?.type)}`}>
                      {getTypeLabel(order.client?.type)}
                    </span>
                  </TableCell>
                  <TableCell>{formatAmount(order.total_amount)}</TableCell>
                  <TableCell>{order.items?.length || 0} article(s)</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(order.submitted_at)}</TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                    >
                      {order.status === 'en_attente' ? 'Traiter' : 'Voir'}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-stone-400 text-lg">Aucune commande trouvée</div>
              <p className="text-stone-500 mt-2">
                {search || statusFilter !== 'all'
                  ? 'Ajustez vos filtres pour voir plus de résultats'
                  : 'Les commandes apparaîtront ici'}
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