'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/Table';
import { apiService } from '../../../../lib/api';

export default function FacturesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [facturesList, setFacturesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    revenue: 0
  });

  useEffect(() => {
    loadFactures();
  }, [statusFilter]);

  const loadFactures = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await apiService.getFactures(params);
      const facturesData = response.documents || response;
      setFacturesList(facturesData);

      // Calculate stats
      const revenue = facturesData
        .filter((f: any) => f.status === 'payee' || f.status === 'paid')
        .reduce((sum: number, f: any) => sum + (f.total_amount || 0), 0);

      setStats({
        total: facturesData.length,
        paid: facturesData.filter((f: any) => f.status === 'payee' || f.status === 'paid').length,
        pending: facturesData.filter((f: any) => f.status === 'en_attente' || f.status === 'pending').length,
        overdue: facturesData.filter((f: any) => f.status === 'en_retard' || f.status === 'overdue').length,
        revenue
      });
    } catch (error) {
      console.error('Error loading factures:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFactures = facturesList.filter(facture =>
    facture.client?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    facture.client?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    facture.client?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    facture.document_number?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'payee' || s === 'paid') return 'bg-green-100 text-green-800';
    if (s === 'en_attente' || s === 'pending') return 'bg-amber-100 text-amber-800';
    if (s === 'en_retard' || s === 'overdue') return 'bg-red-100 text-red-800';
    if (s === 'partiellement_payee') return 'bg-blue-100 text-blue-800';
    return 'bg-stone-100 text-stone-800';
  };

  const getStatusLabel = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'payee' || s === 'paid') return 'Payée';
    if (s === 'en_attente' || s === 'pending') return 'En attente';
    if (s === 'en_retard' || s === 'overdue') return 'En retard';
    if (s === 'partiellement_payee') return 'Partiellement payée';
    if (s === 'annule' || s === 'cancelled') return 'Annulée';
    return status;
  };

  const getTypeColor = (type: string) => {
    return type === 'b2b' ? 'bg-purple-100 text-purple-800' : 'bg-cyan-100 text-cyan-800';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatAmount = (amount: number) => {
    if (!amount) return '0.00 DT';
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
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      </div>
    );
  }

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
        <StatCard title="Total Factures" value={stats.total.toString()} icon="🧾" />
        <StatCard title="Chiffre d'affaires" value={formatAmount(stats.revenue)} icon="💰" variant="success" />
        <StatCard title="En attente" value={stats.pending.toString()} icon="⏳" variant="warning" />
        <StatCard title="En retard" value={stats.overdue.toString()} icon="⚠️" variant="danger" />
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
                { value: 'payee', label: 'Payée' },
                { value: 'en_attente', label: 'En attente' },
                { value: 'en_retard', label: 'En retard' },
                { value: 'annule', label: 'Annulée' }
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <button
              onClick={loadFactures}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              🔄 Actualiser
            </button>
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
                <TableHead>Devis Lié</TableHead>
                <TableHead>Émission</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFactures.map((facture) => (
                <TableRow key={facture.id}>
                  <TableCell className="font-medium">{facture.document_number}</TableCell>
                  <TableCell>{getClientName(facture.client)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getTypeColor(facture.client?.type)}`}>
                      {facture.client?.type === 'b2b' ? 'B2B' : 'B2C'}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">{formatAmount(facture.total_amount)}</TableCell>
                  <TableCell>
                    {facture.devis_id ? (
                      <Link
                        href={`/admin/sales/devis/${facture.devis_id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm hover:underline"
                      >
                        Voir Devis
                      </Link>
                    ) : (
                      <span className="text-stone-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(facture.issue_date)}</TableCell>
                  <TableCell className={
                    (facture.status === 'en_retard' || facture.status === 'overdue') ? 'text-red-600 font-medium' : ''
                  }>
                    {formatDate(facture.due_date)}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(facture.status)}`}>
                      {getStatusLabel(facture.status)}
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
                  : 'Créez votre première facture à partir d\'un devis'
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