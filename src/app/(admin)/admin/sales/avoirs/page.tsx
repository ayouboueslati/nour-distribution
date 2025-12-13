'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/Table';
import { apiService } from '../../../../lib/api';

export default function AvoirsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [avoirsList, setAvoirsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0
  });

  useEffect(() => {
    loadAvoirs();
  }, [statusFilter]);

  const loadAvoirs = async () => {
    try {
      setLoading(true);
      const params: any = {};

      const response = await apiService.getAvoirs(params);
      const avoirsData = response.documents || response;
      setAvoirsList(avoirsData);
      
      // Calculate stats
      const totalAmount = avoirsData.reduce((sum: number, a: any) => sum + (a.total_amount || 0), 0);

      setStats({
        total: avoirsData.length,
        totalAmount: totalAmount
      });
    } catch (error) {
      console.error('Error loading avoirs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (avoirId: string) => {
    try {
      window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/documents/avoirs/${avoirId}/pdf`, '_blank');
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const filteredAvoirs = avoirsList.filter(avoir => 
    avoir.client?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    avoir.client?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    avoir.client?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    avoir.document_number?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return 'bg-amber-100 text-amber-800';
      case 'valide': return 'bg-green-100 text-green-800';
      case 'annule': return 'bg-red-100 text-red-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'valide': return 'Validé';
      case 'annule': return 'Annulé';
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
          <h1 className="text-3xl font-light text-stone-800">Gestion des Avoirs</h1>
          <p className="text-stone-600 mt-1">Créez et gérez les avoirs et notes de crédit</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Avoirs" value={stats.total.toString()} icon="💳" />
        <StatCard title="Montant Total" value={formatAmount(stats.totalAmount)} icon="💰" />
        <StatCard title="Ce mois" value="0" icon="📅" variant="info" />
        <StatCard title="Retours produits" value={stats.total.toString()} icon="📦" variant="warning" />
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
                { value: 'en_attente', label: 'En attente' },
                { value: 'valide', label: 'Validé' },
                { value: 'annule', label: 'Annulé' }
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <button
              onClick={loadAvoirs}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              🔄 Actualiser
            </button>
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
                <TableHead>Type</TableHead>
                <TableHead>Facture Liée</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead>Création</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAvoirs.map((avoir) => (
                <TableRow key={avoir.id}>
                  <TableCell className="font-medium">{avoir.document_number}</TableCell>
                  <TableCell>{getClientName(avoir.client)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getTypeColor(avoir.client?.type)}`}>
                      {getTypeLabel(avoir.client?.type)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {avoir.reference_document ? (
                      <Link 
                        href={`/admin/sales/factures/${avoir.reference_document.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        {avoir.reference_document.document_number}
                      </Link>
                    ) : (
                      <span className="text-stone-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">{formatAmount(avoir.total_amount)}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {avoir.notes?.split('\n')[0] || 'Avoir commercial'}
                  </TableCell>
                  <TableCell>{formatDate(avoir.issue_date)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(avoir.status)}`}>
                      {getStatusLabel(avoir.status)}
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
                      <button 
                        onClick={() => handleDownloadPDF(avoir.id)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        PDF
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
                  : 'Les avoirs créés pour les retours apparaîtront ici'
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
  variant?: 'default' | 'success' | 'info' | 'warning';
}) {
  const variantStyles = {
    default: 'bg-stone-50 border-stone-200',
    success: 'bg-green-50 border-green-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-amber-50 border-amber-200'
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