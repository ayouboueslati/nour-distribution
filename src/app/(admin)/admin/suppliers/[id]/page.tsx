'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Building2,
  Phone,
  Mail,
  MapPin,
  Star,
  Package,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Card, Badge, Button } from '../../../../components/ui';
import { apiService } from '../../../../lib/api';

interface Supplier {
  id: string;
  company_name: string;
  legal_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  fiscal_id?: string;
  business_registration?: string;
  vat_number?: string;
  payment_terms?: string;
  preferred_payment_method?: string;
  shipping_terms?: string;
  lead_time_days?: number;
  is_active: boolean;
  is_preferred: boolean;
  notes?: string;
  products_count?: number;
  created_at: string;
  updated_at?: string;
}

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params?.id as string;

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'notes'>('overview');

  useEffect(() => {
    if (supplierId) loadSupplier();
  }, [supplierId]);

  const loadSupplier = async () => {
    try {
      setLoading(true);
      const data = await apiService.getSupplier(supplierId);
      setSupplier(data);
    } catch (err: any) {
      setError(err.message || 'Impossible de charger le fournisseur');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 bg-white border border-stone-200 rounded-full hover:bg-stone-50">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-light text-stone-800">Fournisseur introuvable</h1>
        </div>
        <Card><div className="p-8 text-center text-stone-500">{error || 'Ce fournisseur n\'existe pas ou a ete supprime.'}</div></Card>
      </div>
    );
  }

  const fullAddress = [
    supplier.address_line1,
    supplier.address_line2,
    supplier.city,
    supplier.postal_code,
    supplier.country,
  ].filter(Boolean).join(', ');

  const tabs = [
    { id: 'overview', label: 'Apercu', icon: Building2 },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'notes', label: 'Notes', icon: FileText },
  ] as const;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white border border-stone-200 rounded-full hover:bg-stone-50 hover:border-amber-500 hover:text-amber-600 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-light text-stone-800">{supplier.company_name}</h1>
              <Badge variant={supplier.is_active ? 'success' : 'danger'}>
                {supplier.is_active ? 'Actif' : 'Inactif'}
              </Badge>
              {supplier.is_preferred && (
                <Badge variant="warning">
                  <Star className="w-3 h-3 mr-1 inline" />
                  Prefere
                </Badge>
              )}
            </div>
            {supplier.legal_name && supplier.legal_name !== supplier.company_name && (
              <p className="text-sm text-stone-500 mt-1">{supplier.legal_name}</p>
            )}
          </div>
        </div>

        <Link href={`/admin/suppliers/${supplierId}/edit`}>
          <Button variant="primary" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Modifier
          </Button>
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Produits</p>
              <p className="text-lg font-semibold text-stone-800">{supplier.products_count ?? '—'}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Delai livraison</p>
              <p className="text-lg font-semibold text-stone-800">
                {supplier.lead_time_days ?? '—'} j
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${supplier.is_active ? 'bg-green-100' : 'bg-red-100'}`}>
              {supplier.is_active
                ? <CheckCircle className="w-5 h-5 text-green-600" />
                : <XCircle className="w-5 h-5 text-red-600" />}
            </div>
            <div>
              <p className="text-xs text-stone-500">Statut</p>
              <p className="text-sm font-semibold text-stone-800">
                {supplier.is_active ? 'Actif' : 'Inactif'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Conditions paiement</p>
              <p className="text-sm font-semibold text-stone-800 truncate">
                {supplier.payment_terms || '—'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200">
        <nav className="flex space-x-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 rounded-t-lg font-medium transition-all flex items-center gap-2 text-sm ${
                activeTab === id
                  ? 'bg-white border-t border-x border-stone-200 text-amber-600'
                  : 'text-stone-600 hover:text-stone-800 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact info */}
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-base font-semibold text-stone-800">Coordonnees</h2>
              {supplier.contact_person && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-stone-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-stone-500">Contact</p>
                    <p className="text-sm font-medium text-stone-800">{supplier.contact_person}</p>
                  </div>
                </div>
              )}
              {supplier.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-stone-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-stone-500">Email</p>
                    <a href={`mailto:${supplier.email}`} className="text-sm font-medium text-amber-600 hover:underline">
                      {supplier.email}
                    </a>
                  </div>
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-stone-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-stone-500">Telephone</p>
                    <a href={`tel:${supplier.phone}`} className="text-sm font-medium text-stone-800">
                      {supplier.phone}
                    </a>
                    {supplier.whatsapp && (
                      <p className="text-xs text-stone-500 mt-0.5">WhatsApp: {supplier.whatsapp}</p>
                    )}
                  </div>
                </div>
              )}
              {fullAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-stone-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-stone-500">Adresse</p>
                    <p className="text-sm font-medium text-stone-800">{fullAddress}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Business info */}
          <Card>
            <div className="p-6 space-y-4">
              <h2 className="text-base font-semibold text-stone-800">Informations commerciales</h2>
              {[
                { label: 'Matricule fiscal', value: supplier.fiscal_id },
                { label: 'Registre commerce', value: supplier.business_registration },
                { label: 'Numero TVA', value: supplier.vat_number },
                { label: 'Conditions paiement', value: supplier.payment_terms },
                { label: 'Methode paiement', value: supplier.preferred_payment_method },
                { label: 'Conditions livraison', value: supplier.shipping_terms },
              ].map(({ label, value }) =>
                value ? (
                  <div key={label} className="flex justify-between items-center py-1.5 border-b border-stone-100 last:border-0">
                    <span className="text-sm text-stone-500">{label}</span>
                    <span className="text-sm font-medium text-stone-800">{value}</span>
                  </div>
                ) : null
              )}
              <div className="flex justify-between items-center py-1.5 border-b border-stone-100">
                <span className="text-sm text-stone-500">Delai livraison</span>
                <span className="text-sm font-medium text-stone-800">{supplier.lead_time_days ?? '—'} jours</span>
              </div>
            </div>
          </Card>

          {/* Dates */}
          <Card>
            <div className="p-6 space-y-3">
              <h2 className="text-base font-semibold text-stone-800">Historique</h2>
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-500">Date creation</span>
                <span className="text-sm font-medium text-stone-800">
                  {new Date(supplier.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </span>
              </div>
              {supplier.updated_at && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">Derniere modification</span>
                  <span className="text-sm font-medium text-stone-800">
                    {new Date(supplier.updated_at).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'products' && (
        <Card>
          <div className="p-8 text-center space-y-3">
            <Package className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-stone-500 text-sm">
              {supplier.products_count
                ? `Ce fournisseur a ${supplier.products_count} produit(s). Consultez la liste des produits et filtrez par fournisseur.`
                : 'Aucun produit associe a ce fournisseur.'}
            </p>
            <Link href={`/admin/products?supplier_id=${supplierId}`}>
              <Button variant="secondary" className="mt-2">
                Voir les produits
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {activeTab === 'notes' && (
        <Card>
          <div className="p-6">
            <h2 className="text-base font-semibold text-stone-800 mb-4">Notes internes</h2>
            {supplier.notes ? (
              <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{supplier.notes}</p>
            ) : (
              <p className="text-sm text-stone-400 italic">Aucune note pour ce fournisseur.</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
