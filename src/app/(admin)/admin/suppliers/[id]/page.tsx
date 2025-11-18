'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button, Card} from '../../../../components/ui';

// Mock data - replace with API call
const supplierDetail = {
  id: 'FOUR-001',
  nom: 'Beauty Hair China',
  telephone: '+86 138 0013 8000',
  email: 'contact@beautyhair.cn',
  adresse: '123 Hair Street, Guangzhou, China',
  type: 'Fabricant',
  specialite: 'Cheveux Brésilien',
  statut: 'Actif',
  siteWeb: 'https://beautyhair.cn',
  contactPerson: 'Mr. Zhang Wei',
  conditionsPaiement: '30 jours',
  delaiLivraison: '15 jours',
  note: 4.5,
  dateAjout: '2024-06-15',
  derniereCommande: '2025-01-10',
  totalCommandes: 12,
  valeurTotale: '45,800€',
  notes: 'Fournisseur très fiable, produits de haute qualité. Délais respectés.'
};

const recentOrders = [
  { id: 'CMD-2025-001', date: '2025-01-10', montant: '3,200€', statut: 'Livrée' },
  { id: 'CMD-2024-012', date: '2024-12-15', montant: '2,800€', statut: 'Livrée' },
  { id: 'CMD-2024-011', date: '2024-11-20', montant: '4,100€', statut: 'Livrée' },
];

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params.id;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-2">
            ← Retour aux fournisseurs
          </Button>
          <h1 className="text-3xl font-light text-stone-800">{supplierDetail.nom}</h1>
          <p className="text-stone-600 mt-1">Détails du fournisseur et historique</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary">
            Modifier
          </Button>
          <Button variant="primary">
            Nouvelle Commande
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Card */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">Informations de Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Téléphone" value={supplierDetail.telephone} />
                <InfoField label="Email" value={supplierDetail.email} />
                <InfoField label="Site web" value={supplierDetail.siteWeb} />
                <InfoField label="Contact principal" value={supplierDetail.contactPerson} />
                <div className="md:col-span-2">
                  <InfoField label="Adresse" value={supplierDetail.adresse} />
                </div>
              </div>
            </div>
          </Card>

          {/* Business Details */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">Informations Commerciales</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoField label="Type" value={supplierDetail.type} />
                <InfoField label="Spécialité" value={supplierDetail.specialite} />
                <InfoField label="Conditions paiement" value={supplierDetail.conditionsPaiement} />
                <InfoField label="Délai livraison" value={supplierDetail.delaiLivraison} />
              </div>
            </div>
          </Card>

          {/* Recent Orders */}
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-stone-800">Commandes Récentes</h2>
                <Button variant="ghost" size="sm">
                  Voir tout
                </Button>
              </div>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-3 border border-stone-200 rounded-lg">
                    <div>
                      <p className="font-medium text-stone-800">{order.id}</p>
                      <p className="text-sm text-stone-600">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-stone-800">{order.montant}</p>
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {order.statut}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">Statistiques</h2>
              <div className="space-y-3">
                <StatItem label="Note moyenne" value="4.5/5" icon="⭐" />
                <StatItem label="Total commandes" value="12" icon="📦" />
                <StatItem label="Valeur totale" value="45,800€" icon="💰" />
                <StatItem label="Depuis" value="Juin 2024" icon="📅" />
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">Actions Rapides</h2>
              <div className="space-y-2">
                <Button variant="ghost" fullWidth className="justify-start">
                  📞 Appeler
                </Button>
                <Button variant="ghost" fullWidth className="justify-start">
                  ✉️ Envoyer email
                </Button>
                <Button variant="ghost" fullWidth className="justify-start">
                  📋 Nouvelle commande
                </Button>
                <Button variant="ghost" fullWidth className="justify-start">
                  📊 Voir performance
                </Button>
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">Notes</h2>
              <p className="text-stone-600 text-sm leading-relaxed">
                {supplierDetail.notes}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-stone-600">{label}</p>
      <p className="text-stone-800 mt-1">{value || '-'}</p>
    </div>
  );
}

function StatItem({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <span>{icon}</span>
        <span className="text-stone-600">{label}</span>
      </div>
      <span className="font-semibold text-stone-800">{value}</span>
    </div>
  );
}