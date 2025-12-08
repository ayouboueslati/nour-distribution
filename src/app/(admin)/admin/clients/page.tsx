'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, Button, Input, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui';

// Import the types - fix the path
import type { B2CClient, B2BClient, Client } from '../../../../types/client';

// Mock data
const b2cClients: B2CClient[] = [
  {
    id: 'CLI-B2C-001',
    type: 'b2c',
    nom: 'Dupont',
    prenom: 'Marie',
    email: 'marie.dupont@email.com',
    telephone: '+33 6 12 34 56 78',
    adresse: '15 Rue de la Paix, Paris 75002',
    statut: 'Actif',
    valeur: 'Bronze',
    totalCommandes: 3,
    totalDepense: '450€',
    dernierAchat: '2025-01-10',
    devisEnCours: 1
  },
  {
    id: 'CLI-B2C-002',
    type: 'b2c',
    nom: 'Martin',
    prenom: 'Sophie',
    email: '',
    telephone: '+33 6 98 76 54 32',
    adresse: '22 Avenue des Champs, Lyon 69001',
    statut: 'Nouveau',
    valeur: 'Bronze',
    totalCommandes: 1,
    totalDepense: '120€',
    dernierAchat: '2025-01-14',
    devisEnCours: 0
  }
];

const b2bClients: B2BClient[] = [
  {
    id: 'CLI-B2B-001',
    type: 'b2b',
    entreprise: 'Sarah Beauty Salon',
    matricule: 'FR123456789',
    contact: 'Sarah Ben',
    email: 'sarah@beautysalon.com',
    telephone: '+33 1 23 45 67 89',
    adresse: '45 Rue du Commerce, Marseille 13001',
    statut: 'Actif',
    valeur: 'Gold',
    typeBusiness: 'Salon de coiffure',
    totalCommandes: 12,
    totalDepense: '8,450€',
    dernierAchat: '2025-01-12',
    devisEnCours: 2,
    conditionsPaiement: '30 jours'
  },
  {
    id: 'CLI-B2B-002',
    type: 'b2b',
    entreprise: 'Institut Afro Elegance',
    matricule: 'FR987654321',
    contact: 'Mohamed Ali',
    email: 'contact@afroelegance.com',
    telephone: '+33 4 56 78 90 12',
    adresse: '78 Boulevard Saint-Germain, Paris 75006',
    statut: 'Actif',
    valeur: 'Silver',
    typeBusiness: 'Institut de beauté',
    totalCommandes: 8,
    totalDepense: '3,200€',
    dernierAchat: '2025-01-08',
    devisEnCours: 1,
    conditionsPaiement: '45 jours'
  }
];

// Type guard functions
const isB2CClient = (client: Client): client is B2CClient => {
  return client.type === 'b2c';
};

const isB2BClient = (client: Client): client is B2BClient => {
  return client.type === 'b2b';
};

export default function ClientsPage() {
  const [activeTab, setActiveTab] = useState<'b2c' | 'b2b'>('b2c');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [valueFilter, setValueFilter] = useState('all');

  const currentClients = activeTab === 'b2c' ? b2cClients : b2bClients;

  const filteredClients = currentClients.filter(client => {
    const searchTerm = search.toLowerCase();
    const matchesSearch = 
      (isB2CClient(client) 
        ? `${client.prenom} ${client.nom}`.toLowerCase()
        : client.entreprise.toLowerCase()
      ).includes(searchTerm) ||
      client.telephone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || client.statut === statusFilter;
    const matchesValue = valueFilter === 'all' || client.valeur === valueFilter;

    return matchesSearch && matchesStatus && matchesValue;
  });

  const getStatusVariant = (statut: string) => {
    switch (statut) {
      case 'Actif': return 'success';
      case 'Nouveau': return 'info';
      case 'Inactif': return 'default';
      case 'VIP': return 'warning';
      default: return 'default';
    }
  };

  const getValueVariant = (valeur: string) => {
    switch (valeur) {
      case 'Platinum': return 'info';
      case 'Gold': return 'warning';
      case 'Silver': return 'default';
      case 'Bronze': return 'default';
      default: return 'default';
    }
  };

  // Statistics
  const totalClients = b2cClients.length + b2bClients.length;
  const activeClients = [...b2cClients, ...b2bClients].filter(c => c.statut === 'Actif').length;
  const pendingDevis = [...b2cClients, ...b2bClients].reduce((sum, c) => sum + c.devisEnCours, 0);
  const newThisMonth = 5; // Mock data

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-stone-800">Gestion des Clients</h1>
          <p className="text-stone-600 mt-1">Gérez vos relations clients B2B et B2C</p>
        </div>
        <Link href="/admin/clients/new">
          <Button variant="primary">
            + Nouveau Client
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Clients" 
          value={totalClients.toString()} 
          icon="👥" 
          description="B2B et B2C combinés"
        />
        <StatCard 
          title="Clients Actifs" 
          value={activeClients.toString()} 
          icon="✅" 
          description="Avec commandes récentes"
          variant="success"
        />
        <StatCard 
          title="Devis en Cours" 
          value={pendingDevis.toString()} 
          icon="📋" 
          description="En attente de traitement"
          variant="warning"
        />
        <StatCard 
          title="Nouveaux Ce Mois" 
          value={newThisMonth.toString()} 
          icon="🆕" 
          description="Clients récemment ajoutés"
          variant="info"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <QuickActionCard
          title="📋 Devis en Attente"
          description="Traiter les devis non assignés"
          count={3}
          color="bg-amber-500"
          href="/admin/sales/devis?filter=pending"
        />
        <QuickActionCard
          title="📞 Clients à Relancer"
          description="Relancer les devis non confirmés"
          count={5}
          color="bg-blue-500"
          href="/admin/clients?filter=followup"
        />
        <QuickActionCard
          title="🎯 Campagne Email"
          description="Envoyer une offre groupée"
          count={0}
          color="bg-green-500"
          href="/admin/clients?action=campaign"
        />
        <QuickActionCard
          title="📊 Analyse Performances"
          description="Voir les statistiques avancées"
          count={0}
          color="bg-purple-500"
          href="/admin/analytics/clients"
        />
      </div>

      {/* Tabs and Filters */}
      <Card>
        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6">
            <TabButton
              active={activeTab === 'b2c'}
              onClick={() => setActiveTab('b2c')}
              count={b2cClients.length}
            >
              👤 Particuliers (B2C)
            </TabButton>
            <TabButton
              active={activeTab === 'b2b'}
              onClick={() => setActiveTab('b2b')}
              count={b2bClients.length}
            >
              🏢 Professionnels (B2B)
            </TabButton>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder={`Rechercher ${activeTab === 'b2c' ? 'un particulier' : 'une entreprise'}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select 
              className="border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:border-stone-500 focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="Actif">Actif</option>
              <option value="Nouveau">Nouveau</option>
              <option value="Inactif">Inactif</option>
              <option value="VIP">VIP</option>
            </select>
            <select 
              className="border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:border-stone-500 focus:outline-none"
              value={valueFilter}
              onChange={(e) => setValueFilter(e.target.value)}
            >
              <option value="all">Toutes les valeurs</option>
              <option value="Platinum">Platinum</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Bronze">Bronze</option>
            </select>
            <select 
              className="border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:border-stone-500 focus:outline-none"
              defaultValue="all"
            >
              <option value="all">Tous les canaux</option>
              <option value="email">Avec email</option>
              <option value="phone">Téléphone uniquement</option>
              <option value="whatsapp">WhatsApp préféré</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Clients Table */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-stone-800">
              {activeTab === 'b2c' ? 'Clients Particuliers' : 'Clients Professionnels'} 
              ({filteredClients.length})
            </h2>
            <div className="text-sm text-stone-600">
              Dernière mise à jour: Aujourd'hui
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                {activeTab === 'b2c' ? (
                  <>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Adresse</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                  </>
                )}
                <TableHead>Valeur</TableHead>
                <TableHead>Commandes</TableHead>
                <TableHead>Dernier Achat</TableHead>
                <TableHead>Devis en Cours</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  {/* Client Name/Company */}
                  <TableCell>
                    <div>
                      <p className="font-medium text-stone-800">
                        {isB2CClient(client) 
                          ? `${client.prenom} ${client.nom}`
                          : client.entreprise
                        }
                      </p>
                      <p className="text-sm text-stone-600">{client.id}</p>
                    </div>
                  </TableCell>

                  {/* Contact Information */}
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{client.telephone}</p>
                      {client.email && (
                        <p className="text-sm text-stone-600">{client.email}</p>
                      )}
                      {isB2BClient(client) && (
                        <p className="text-xs text-stone-500">{client.contact}</p>
                      )}
                    </div>
                  </TableCell>

                  {/* Address or Business Type */}
                  <TableCell>
                    {isB2CClient(client) ? (
                      <p className="text-sm text-stone-600 line-clamp-2 max-w-[200px]">
                        {client.adresse}
                      </p>
                    ) : isB2BClient(client) ? (
                      <p className="text-sm text-stone-600">{client.typeBusiness}</p>
                    ) : null}
                  </TableCell>

                  {/* Client Value */}
                  <TableCell>
                    <Badge variant={getValueVariant(client.valeur)} size="sm">
                      {client.valeur}
                    </Badge>
                  </TableCell>

                  {/* Orders */}
                  <TableCell>
                    <div className="text-center">
                      <p className="font-medium">{client.totalCommandes}</p>
                      <p className="text-xs text-stone-500">{client.totalDepense}</p>
                    </div>
                  </TableCell>

                  {/* Last Purchase */}
                  <TableCell>
                    <p className="text-sm text-stone-600">{client.dernierAchat}</p>
                  </TableCell>

                  {/* Pending Quotes */}
                  <TableCell>
                    <div className="text-center">
                      {client.devisEnCours > 0 ? (
                        <Badge variant="warning" size="sm">
                          {client.devisEnCours} devis
                        </Badge>
                      ) : (
                        <span className="text-stone-400">-</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant={getStatusVariant(client.statut)} size="sm">
                      {client.statut}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link 
                        href={`/admin/clients/${client.id}`}
                        className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                      >
                        Voir
                      </Link>
                      <button 
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        onClick={() => console.log('Contact', client.id)}
                      >
                        Contacter
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                        onClick={() => console.log('Create quote', client.id)}
                      >
                        Devis
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <div className="text-stone-400 text-lg">Aucun client trouvé</div>
              <p className="text-stone-500 mt-2">
                {search || statusFilter !== 'all' || valueFilter !== 'all'
                  ? 'Ajustez vos filtres pour voir plus de résultats' 
                  : `Commencez par ajouter votre premier client ${activeTab === 'b2c' ? 'particulier' : 'professionnel'}`
                }
              </p>
              {(search === '' && statusFilter === 'all' && valueFilter === 'all') && (
                <Link href="/admin/clients/new" className="inline-block mt-4">
                  <Button variant="primary">
                    + Ajouter un Client
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

// Supporting Components (StatCard, QuickActionCard, TabButton remain the same)
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

function QuickActionCard({
  title,
  description,
  count,
  color,
  href
}: {
  title: string;
  description: string;
  count: number;
  color: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-stone-800">{title}</p>
            <p className="text-sm text-stone-600 mt-1">{description}</p>
          </div>
          <div className={`${color} text-white w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200 text-sm font-medium`}>
            {count}
          </div>
        </div>
      </Card>
    </Link>
  );
}

function TabButton({ 
  active, 
  onClick, 
  count, 
  children 
}: { 
  active: boolean; 
  onClick: () => void; 
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-amber-500 text-white shadow-md' 
          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
      }`}
    >
      <span>{children}</span>
      <span className={`px-2 py-1 text-xs rounded-full ${
        active ? 'bg-amber-600' : 'bg-stone-300'
      }`}>
        {count}
      </span>
    </button>
  );
}