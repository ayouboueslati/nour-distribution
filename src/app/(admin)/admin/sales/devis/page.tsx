'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/Table';
import { apiService } from '../../../../lib/api';

export default function DevisPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [devisList, setDevisList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    converted: 0
  });

  useEffect(() => {
    loadDevis();
  }, [statusFilter]);

  const loadDevis = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await apiService.getDevis(params);
      const devisData = response.documents || response;
      setDevisList(devisData.sort((a: any, b: any) =>
        new Date(b.created_at || b.issue_date).getTime() - new Date(a.created_at || a.issue_date).getTime()
      ));

      // Calculate stats
      setStats({
        total: devisData.length,
        pending: devisData.filter((d: any) => d.status === 'en_attente').length,
        accepted: devisData.filter((d: any) => d.status === 'accepte').length,
        converted: devisData.filter((d: any) => d.status === 'facture').length
      });
    } catch (error) {
      console.error('Error loading devis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDevis = async (devisId: string) => {
    if (!confirm('Accepter ce devis ?')) return;

    try {
      await apiService.acceptDevis(devisId);
      loadDevis();
    } catch (error) {
      console.error('Error accepting devis:', error);
    }
  };

  const handleConvertToFacture = async (devisId: string) => {
    if (!confirm('Convertir ce devis en facture ? Le stock sera réduit.')) return;

    try {
      await apiService.convertDevisToFacture(devisId);
      loadDevis();
    } catch (error) {
      console.error('Error converting to facture:', error);
    }
  };

  const filteredDevis = devisList.filter(devis =>
    devis.client?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    devis.client?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    devis.client?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    devis.document_number?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return 'bg-amber-100 text-amber-800';
      case 'brouillon': return 'bg-stone-100 text-stone-800';
      case 'accepte': return 'bg-green-100 text-green-800';
      case 'refuse': return 'bg-red-100 text-red-800';
      case 'facture': return 'bg-blue-100 text-blue-800';
      case 'annule': return 'bg-stone-100 text-stone-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'en_attente':
      case 'pending':
        return 'En attente';
      case 'brouillon':
      case 'draft':
        return 'Brouillon';
      case 'accepte':
      case 'accepted':
        return 'Accepté';
      case 'refuse':
      case 'rejected':
        return 'Refusé';
      case 'facture':
      case 'invoiced':
        return 'Converti en facture';
      case 'annule':
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
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
    if (!amount) return '-';
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
          <h1 className="text-3xl font-light text-stone-800">Gestion des Devis</h1>
          <p className="text-stone-600 mt-1">Créez et gérez vos devis pour vos clients B2B et B2C</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Devis" value={stats.total.toString()} icon="📊" />
        <StatCard title="En attente" value={stats.pending.toString()} icon="⏳" variant="warning" />
        <StatCard title="Acceptés" value={stats.accepted.toString()} icon="✅" variant="success" />
        <StatCard title="Transformés" value={stats.converted.toString()} icon="🧾" variant="info" />
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
                { value: 'en_attente', label: 'En attente' },
                { value: 'accepte', label: 'Accepté' },
                { value: 'refuse', label: 'Refusé' },
                { value: 'facture', label: 'Transformé en facture' },
                { value: 'annule', label: 'Annulé' }
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <button
              onClick={loadDevis}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              🔄 Actualiser
            </button>
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
                <TableHead>Échéance</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevis.map((devis) => (
                <TableRow key={devis.id}>
                  <TableCell className="font-medium">{devis.document_number}</TableCell>
                  <TableCell>{getClientName(devis.client)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getTypeColor(devis.client?.type)}`}>
                      {getTypeLabel(devis.client?.type)}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">{formatAmount(devis.total_amount)}</TableCell>
                  <TableCell>{devis.items?.length || 0} article(s)</TableCell>
                  <TableCell>{formatDate(devis.issue_date)}</TableCell>
                  <TableCell>{formatDate(devis.due_date)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(devis.status)}`}>
                      {getStatusLabel(devis.status)}
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
                      {devis.status === 'en_attente' && (
                        <>
                          <button
                            onClick={() => handleAcceptDevis(devis.id)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Accepter
                          </button>
                        </>
                      )}
                      {devis.status === 'accepte' && (
                        <button
                          onClick={() => handleConvertToFacture(devis.id)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Facturer
                        </button>
                      )}
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
                  : 'Les devis créés depuis les commandes apparaîtront ici'
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