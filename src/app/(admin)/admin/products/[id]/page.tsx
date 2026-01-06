'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Badge, Modal, Input, Select } from '../../../../components/ui';
import { apiService } from '../../../../lib/api';
import { Product } from '../../../../../types';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stock Adjustment State
  const [showAdjModal, setShowAdjModal] = useState(false);
  const [adjForm, setAdjForm] = useState({
    real_quantity: 0,
    reason: 'manual_audit',
    note: ''
  });

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProductAdmin(productId);
      setProduct(response);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du produit');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
      try {
        await apiService.deleteProduct(productId);
        router.push('/admin/products');
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la suppression');
      }
    }
  }

  const handleStockAdjust = async () => {
    try {
      await apiService.adjustStock({
        product_id: productId,
        real_quantity: adjForm.real_quantity,
        reason: adjForm.reason,
        note: adjForm.note
      });
      setShowAdjModal(false);
      fetchProduct(); // Refresh
      setAdjForm({ real_quantity: 0, reason: 'manual_audit', note: '' });
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'ajustement du stock");
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) {
      return { text: 'Rupture de stock', variant: 'danger' as const, color: 'text-red-600' };
    }
    if (product.stock_quantity <= product.min_stock_level) {
      return { text: 'Stock faible', variant: 'warning' as const, color: 'text-amber-600' };
    }
    return { text: 'En stock', variant: 'success' as const, color: 'text-green-600' };
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-stone-600">Chargement du produit...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Erreur</h3>
          <p className="text-red-600 mt-1">{error || 'Produit non trouvé'}</p>
          <Button variant="primary" onClick={() => router.push('/admin/products')} className="mt-3">
            Retour aux produits
          </Button>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-2">
            ← Retour aux produits
          </Button>
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-light text-stone-800">{product.name}</h1>
            <Badge variant={stockStatus.variant}>{stockStatus.text}</Badge>
            {!product.is_active && (
              <Badge variant="default">Inactif</Badge>
            )}
          </div>
          <p className="text-stone-600 mt-1">SKU: {product.sku}</p>
        </div>
        <div className="flex space-x-3">
          <Link href={`/admin/products/${product.id}/edit`}>
            <Button variant="primary">
              ✏️ Modifier
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">Informations de Base</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="Nom du produit" value={product.name} />
                <InfoField label="Référence SKU" value={product.sku} />
                <InfoField label="Code-barres" value={product.barcode} />
                <InfoField label="Catégorie" value={product.category?.name ?? null} />
                <InfoField label="Fournisseur" value={product.supplier?.company_name ?? null} />
                <InfoField label="Référence fournisseur" value={product.supplier_sku} />
                <div className="md:col-span-2">
                  <InfoField label="Description" value={product.description} />
                </div>
                <div className="md:col-span-2">
                  <InfoField label="Description courte" value={product.short_description} />
                </div>
              </div>
            </div>
          </Card>

          {/* Hair Characteristics */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">Caractéristiques des Cheveux</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoField label="Type" value={product.hair_type} />
                <InfoField label="Texture" value={product.hair_texture} />
                <InfoField label="Longueur" value={product.hair_length} />
                <InfoField label="Couleur" value={product.hair_color} />
                <InfoField label="Origine" value={product.hair_origin} />
                <InfoField label="Qualité" value={product.hair_quality} />
              </div>
            </div>
          </Card>

          {/* Packaging */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">Emballage</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoField label="Poids" value={product.weight_grams ? `${product.weight_grams}g` : 'N/A'} />
                <InfoField label="Pièces par lot" value={product.bundle_pieces.toString()} />
                <InfoField label="Dimensions" value={product.package_dimensions} />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stock & Pricing */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">Stock & Prix</h2>
              <div className="space-y-4">
                <div className="bg-stone-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-stone-600">Stock actuel</span>
                    <span className={`text-lg font-bold ${stockStatus.color}`}>
                      {product.stock_quantity}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-500">
                    <span>Stock minimum: {product.min_stock_level}</span>
                    <span>Maximum: {product.max_stock_level || 'N/A'}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-stone-200">
                    <Button variant="secondary" size="sm" fullWidth onClick={() => {
                      setAdjForm({ ...adjForm, real_quantity: product.stock_quantity });
                      setShowAdjModal(true);
                    }}>
                      🛠️ Ajustement Manuel
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <PriceField label="Prix de revient" value={product.cost_price} />
                  <PriceField label="Prix de gros" value={product.wholesale_price} />
                  <PriceField label="Prix de détail" value={product.retail_price} />
                </div>
              </div>
            </div>
          </Card>

          {/* Status & Visibility */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">Statut</h2>
              <div className="space-y-3">
                <StatusField label="Actif" value={product.is_active} />
                <StatusField label="En vedette" value={product.is_featured} />
                <StatusField label="Meilleure vente" value={product.is_best_seller} />
                <StatusField label="Nouveauté" value={product.is_new_arrival} />
              </div>
            </div>
          </Card>

          {/* SEO & Metadata */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">SEO</h2>
              <div className="space-y-3">
                <InfoField label="Titre SEO" value={product.meta_title} />
                <InfoField label="Description SEO" value={product.meta_description} />
                <InfoField label="Mots-clés" value={product.search_keywords} />
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">Actions Rapides</h2>
              <div className="space-y-2">
                <Link href={`/admin/products/${product.id}/edit`} className="block">
                  <Button variant="ghost" fullWidth className="justify-start">
                    ✏️ Modifier le produit
                  </Button>
                </Link>
                <Button variant="ghost" fullWidth className="justify-start">
                  📊 Voir l'historique
                </Button>
                <Button variant="ghost" fullWidth className="justify-start">
                  📄 Dupliquer
                </Button>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-4">Zone de Danger</h2>
              <p className="text-sm text-red-600 mb-4">
                La suppression est irréversible. Toutes les données seront perdues.
              </p>
              <Button variant="danger" onClick={handleDelete} fullWidth>
                🗑️ Supprimer le Produit
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showAdjModal}
        onClose={() => setShowAdjModal(false)}
        title="Ajustement de Stock Manuel"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Ajustez la quantité réelle en stock. Cela créera un mouvement de stock de type "Ajustement".
          </p>
          <div>
            <label className="text-sm font-medium text-stone-700">Quantité Réelle (Comptée)</label>
            <Input
              type="number"
              value={adjForm.real_quantity}
              onChange={e => setAdjForm({ ...adjForm, real_quantity: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">Raison</label>
            <Select
              options={[
                { value: 'manual_audit', label: 'Inventaire Manuel' },
                { value: 'damage', label: 'Endommagé / Perdu' },
                { value: 'correction', label: 'Correction Erreur' },
                { value: 'return', label: 'Retour Client (Non Restocké)' }
              ]}
              value={adjForm.reason}
              onChange={e => setAdjForm({ ...adjForm, reason: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">Note (Optionnel)</label>
            <Input
              placeholder="Détails supplémentaires..."
              value={adjForm.note}
              onChange={e => setAdjForm({ ...adjForm, note: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowAdjModal(false)}>Annuler</Button>
            <Button variant="primary" onClick={handleStockAdjust}>Confirmer l'Ajustement</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-sm font-medium text-stone-600">{label}</p>
      <p className="text-stone-800 mt-1">{value || 'Non renseigné'}</p>
    </div>
  );
}

function PriceField({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-stone-600">{label}</span>
      <span className="font-semibold text-stone-800">
        {value ? `${value}€` : 'N/A'}
      </span>
    </div>
  );
}

function StatusField({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-stone-600">{label}</span>
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-800'
        }`}>
        {value ? 'Oui' : 'Non'}
      </span>
    </div>
  );
}