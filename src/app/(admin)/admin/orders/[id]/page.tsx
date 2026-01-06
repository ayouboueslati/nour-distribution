'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Check, X, AlertCircle } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import ProductSearch from '../../../../components/features/ProductSearch';
import { DevisTab } from '../../../../components/features/devis/DevisTab';
import { apiService } from '../../../../lib/api';
import { notificationService } from '../../../../lib/notifications';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingItems, setEditingItems] = useState(false);
  const [generatingDevis, setGeneratingDevis] = useState(false);
  const [linkedDocuments, setLinkedDocuments] = useState<{ devis: any[], factures: any[] }>({ devis: [], factures: [] });
  const [activeTab, setActiveTab] = useState<'details' | 'devis'>('details');
  const [pricingData, setPricingData] = useState<any>({
    items: [],
    shipping_fee: 0,
    discount: 0,
    tax_amount: 0,
    subtotal: 0,
    total_amount: 0
  });

  useEffect(() => {
    loadOrder();
  }, [resolvedParams.id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOrder(resolvedParams.id);
      console.log('📦 ORDER LOADED:', response);
      setOrder(response);

      // Load linked documents (Monitor Flow)
      try {
        const [devisRes, facturesRes] = await Promise.all([
          apiService.getDevisByOrderId(resolvedParams.id).catch(() => []),
          apiService.getInvoicesByOrderId(resolvedParams.id).catch(() => [])
        ]);
        console.log('📋 DEVIS RESPONSE:', devisRes);
        console.log('📄 FACTURES RESPONSE:', facturesRes);

        // Handle different response formats from backend APIs
        // - getDevisByOrderId returns: { devis_list: [...], total: N, ... }
        // - getInvoicesByOrderId returns: [...] (plain array)
        const devisList = Array.isArray(devisRes) ? devisRes : (devisRes.devis_list || []);
        const facturesList = Array.isArray(facturesRes) ? facturesRes : (facturesRes.documents || []);

        console.log('📋 PROCESSED DEVIS:', devisList);
        console.log('📄 PROCESSED FACTURES:', facturesList);

        setLinkedDocuments({
          devis: devisList,
          factures: facturesList
        });
      } catch (docError) {
        console.warn('Could not load linked documents:', docError);
      }

      // Initialize pricing data
      const items = (response.items || []).map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product?.name || 'Produit',
        quantity: item.quantity,
        unit_price: item.unit_price || 0,
        discount_percent: item.discount_percent || 0,
        subtotal: item.subtotal || 0,
        available_stock: item.product?.available_quantity || 0
      }));

      setPricingData({
        items,
        shipping_fee: response.shipping_fee || 0,
        discount: response.discount || 0,
        tax_amount: response.tax_amount || 0,
        subtotal: response.subtotal || 0,
        total_amount: response.total_amount || 0
      });
    } catch (error) {
      console.error('Error loading order:', error);
      notificationService.error('Erreur', 'Impossible de charger la commande');
    } finally {
      setLoading(false);
    }
  };

  const handleItemPriceChange = (itemId: string, field: string, value: number) => {
    setPricingData((prev: any) => {
      const items = prev.items.map((item: any) => {
        if (item.id === itemId) {
          const updated = { ...item, [field]: value };
          const basePrice = updated.unit_price * updated.quantity;
          const discountAmount = basePrice * (updated.discount_percent / 100);
          updated.subtotal = basePrice - discountAmount;
          return updated;
        }
        return item;
      });

      const subtotal = items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
      const taxAmount = subtotal * 0.19;
      const totalAmount = subtotal + prev.shipping_fee - prev.discount + taxAmount;

      return {
        ...prev,
        items,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount
      };
    });
  };

  const handleGlobalFieldChange = (field: string, value: number) => {
    setPricingData((prev: any) => {
      const updated = { ...prev, [field]: value };
      updated.total_amount = updated.subtotal + updated.shipping_fee - updated.discount + updated.tax_amount;
      return updated;
    });
  };

  const handleSavePricing = async () => {
    try {
      // Validation: vérifier que tous les items ont un prix
      const itemsWithoutPrice = pricingData.items.filter((item: any) => !item.unit_price || item.unit_price === 0);
      if (itemsWithoutPrice.length > 0) {
        notificationService.error(
          'Prix manquants',
          `Veuillez définir les prix pour: ${itemsWithoutPrice.map((i: any) => i.product_name).join(', ')}`
        );
        return;
      }

      if (pricingData.total_amount === 0) {
        notificationService.error('Erreur', 'Le montant total ne peut pas être 0');
        return;
      }

      await apiService.updateOrderPricing(resolvedParams.id, pricingData);
      setEditing(false);
      notificationService.success('Succès', 'Prix enregistrés. Vous pouvez maintenant accepter la commande.');
      loadOrder();
    } catch (error) {
      console.error('Error saving pricing:', error);
    }
  };

  const handleAcceptOrder = async () => {
    // Vérification avant acceptation
    if (!order.total_amount || order.total_amount === 0) {
      notificationService.error(
        'Prix non définis',
        'Veuillez définir les prix avant d\'accepter la commande'
      );
      return;
    }

    const hasItemsWithoutPrice = order.items?.some((item: any) => !item.unit_price || item.unit_price === 0);
    if (hasItemsWithoutPrice) {
      notificationService.error(
        'Prix incomplets',
        'Tous les articles doivent avoir un prix défini'
      );
      return;
    }

    if (!confirm('Accepter cette commande ? Un devis sera automatiquement généré avec toutes les informations client.')) return;

    try {
      setGeneratingDevis(true);

      // Accepter la commande (génère automatiquement le devis)
      await apiService.acceptOrder(resolvedParams.id);

      notificationService.success(
        'Commande acceptée',
        'Le devis a été généré automatiquement avec toutes les informations client'
      );

      loadOrder();
    } catch (error: any) {
      console.error('Error accepting order:', error);

      if (error.message?.includes('prix')) {
        notificationService.error(
          'Erreur',
          'Impossible d\'accepter : les prix ne sont pas définis correctement'
        );
      }
    } finally {
      setGeneratingDevis(false);
    }
  };

  const handleRejectOrder = async () => {
    const reason = prompt('Raison du rejet:');
    if (!reason) return;

    try {
      await apiService.rejectOrder(resolvedParams.id, reason);
      router.push('/admin/orders');
    } catch (error) {
      console.error('Error rejecting order:', error);
    }
  };

  const handleAddProduct = async (product: any) => {
    try {
      await apiService.addOrderItem(resolvedParams.id, {
        product_id: product.id,
        quantity: 1,
        unit_price: product.retail_price || 0
      });
      loadOrder();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce produit ?')) return;
    try {
      await apiService.removeOrderItem(resolvedParams.id, itemId);
      loadOrder();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await apiService.updateOrderItem(resolvedParams.id, itemId, { quantity });
      loadOrder();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'en_attente' || s === 'pending') return 'bg-amber-100 text-amber-800';
    if (s === 'en_traitement' || s === 'processing') return 'bg-blue-100 text-blue-800';
    if (s === 'confirme' || s === 'confirmed') return 'bg-green-100 text-green-800';
    if (s === 'annule' || s === 'cancelled' || s === 'rejecte' || s === 'rejected') return 'bg-red-100 text-red-800';
    return 'bg-stone-100 text-stone-800';
  };

  const getStatusLabel = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'en_attente' || s === 'pending') return 'En attente';
    if (s === 'en_traitement' || s === 'processing') return 'En traitement';
    if (s === 'confirme' || s === 'confirmed') return 'Confirmée';
    if (s === 'annule' || s === 'cancelled') return 'Annulée';
    if (s === 'rejecte' || s === 'rejected') return 'Rejetée';
    return status;
  };

  const formatAmount = (amount: number) => `${amount.toFixed(2)} DT`;

  const isPending = () => {
    const s = order?.status?.toLowerCase();
    // Bouton visible si PENDING ou PROCESSING (mais pas confirmé/annulé)
    return s === 'en_attente' || s === 'pending' || s === 'en_traitement' || s === 'processing';
  };

  const canEdit = () => {
    const s = order?.status?.toLowerCase();
    return s === 'en_attente' || s === 'pending' || s === 'en_traitement' || s === 'processing';
  };

  const getClientName = (client: any) => {
    if (!client) return 'Client inconnu';
    const t = client.type?.toLowerCase();
    if (t === 'b2b') return client.company_name || 'Entreprise';
    return `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Client';
  };

  const hasPricingIssues = () => {
    if (!order) return false;
    if (!order.total_amount || order.total_amount === 0) return true;
    return order.items?.some((item: any) => !item.unit_price || item.unit_price === 0);
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

  if (!order) {
    return (
      <div className="p-6">
        <Card>
          <div className="p-12 text-center">
            <p className="text-stone-600 text-lg">Commande introuvable</p>
            <Link href="/admin/orders" className="text-amber-600 hover:text-amber-700 mt-4 inline-block">
              Retour aux commandes
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin/orders" className="text-stone-900 hover:text-amber-600 font-medium">
              ← Retour
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900">Commande {order.order_number}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
            <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
            <span className="text-stone-700 font-medium text-sm md:text-base">
              {new Date(order.submitted_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 md:gap-3">
          {canEdit() && (
            <>
              <Button onClick={() => setEditingItems(!editingItems)} variant={editingItems ? "secondary" : "primary"} className="flex-1 sm:flex-none">
                {editingItems ? '✏️ Mode édition' : '📝 Modifier les articles'}
              </Button>
              <Button onClick={() => setEditing(!editing)} variant={editing ? "secondary" : "primary"} className="flex-1 sm:flex-none">
                {editing ? '💰 Mode prix' : '💵 Définir les prix'}
              </Button>
              {isPending() && (
                <>
                  <Button
                    onClick={handleAcceptOrder}
                    variant="success"
                    disabled={hasPricingIssues() || generatingDevis}
                    className="flex-1 sm:flex-none w-full sm:w-auto"
                  >
                    {generatingDevis ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Génération...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Accepter & Générer Devis
                      </>
                    )}
                  </Button>
                  <Button onClick={handleRejectOrder} variant="danger" className="flex-1 sm:flex-none">
                    <X className="w-4 h-4 mr-2" />
                    Rejeter
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>


      {/* Tab Navigation */}
      <div className="border-b border-stone-200 bg-white rounded-t-lg">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'details'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-stone-600 hover:text-stone-800 hover:border-stone-300'
              }`}
          >
            Détails
          </button>
          <button
            onClick={() => setActiveTab('devis')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'devis'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-stone-600 hover:text-stone-800 hover:border-stone-300'
              }`}
          >
            Devis
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="space-y-6 mt-6">
          {/* FLUX DOCUMENTAIRE (Monitoring System) */}
          <Card className="border-l-4 border-l-blue-500">
            <div className="p-6">
              <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">📋</span> Flux Documentaire
              </h2>

              <div className="relative border-l-2 border-stone-200 ml-3 space-y-8 pl-8 pb-4">
                {/* 1. Commande */}
                <div className="relative">
                  <span className="absolute -left-[41px] bg-blue-100 text-blue-600 rounded-full p-2 border-4 border-white">
                    <span className="w-4 h-4 flex items-center justify-center font-bold text-xs">1</span>
                  </span>
                  <div>
                    <h3 className="font-bold text-stone-900">Commande Créée</h3>
                    <p className="text-sm text-stone-800 font-bold">CMD-{order.order_number}</p>
                    <p className="text-xs text-stone-700 mt-1">{new Date(order.submitted_at).toLocaleString()}</p>
                    <span className={`inline-block mt-2 text-xs px-2 py-1 rounded bg-stone-100 font-medium`}>
                      Statut: {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>

                {/* 2. Devis (Loop through linked devis) */}
                {linkedDocuments.devis.length > 0 ? (
                  linkedDocuments.devis.map((devis: any) => (
                    <div key={devis.id} className="relative">
                      <span className="absolute -left-[41px] bg-amber-100 text-amber-600 rounded-full p-2 border-4 border-white">
                        <span className="w-4 h-4 flex items-center justify-center font-bold text-xs">2</span>
                      </span>
                      <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 hover:border-amber-300 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-stone-900">Devis Généré</h3>
                            <Link href={`/admin/sales/devis/${devis.id}`} className="text-blue-600 text-sm font-medium hover:underline">
                              {devis.document_number} ↗
                            </Link>
                            <p className="text-xs text-stone-700 mt-1">Émis le {new Date(devis.issue_date).toLocaleDateString()}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded font-medium ${devis.status === 'accepte' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                            {devis.status}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-stone-700 font-medium">
                          Montant: {formatAmount(devis.total_amount)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="relative opacity-50">
                    <span className="absolute -left-[41px] bg-stone-100 text-stone-400 rounded-full p-2 border-4 border-white">
                      <span className="w-4 h-4 flex items-center justify-center font-bold text-xs">2</span>
                    </span>
                    <p className="text-stone-600 italic">En attente de devis...</p>
                  </div>
                )}

                {/* 3. Factures (Loop through linked invoices) */}
                {linkedDocuments.factures.length > 0 ? (
                  linkedDocuments.factures.map((fac: any) => (
                    <div key={fac.id} className="relative">
                      <span className="absolute -left-[41px] bg-green-100 text-green-600 rounded-full p-2 border-4 border-white">
                        <span className="w-4 h-4 flex items-center justify-center font-bold text-xs">3</span>
                      </span>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-stone-900">Facture Émise</h3>
                            <Link href={`/admin/sales/factures/${fac.id}`} className="text-blue-600 text-sm font-medium hover:underline">
                              {fac.document_number} ↗
                            </Link>
                            <p className="text-xs text-stone-700 mt-1">Émise le {new Date(fac.issue_date).toLocaleDateString()}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded font-medium ${fac.status === 'payee' || fac.status === 'paid' ? 'bg-green-200 text-green-900' : 'bg-blue-100 text-blue-800'}`}>
                            {getStatusLabel(fac.status)}
                          </span>
                        </div>
                        <div className="mt-2 text-sm font-bold text-stone-900">
                          Total: {formatAmount(fac.total_amount)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="relative opacity-50">
                    <span className="absolute -left-[41px] bg-stone-100 text-stone-400 rounded-full p-2 border-4 border-white">
                      <span className="w-4 h-4 flex items-center justify-center font-bold text-xs">3</span>
                    </span>
                    <p className="text-stone-600 italic">En attente de facturation...</p>
                  </div>
                )}

              </div>
            </div>
          </Card>

          {/* Warning si prix manquants */}
          {hasPricingIssues() && isPending() && (
            <Card className="border-amber-300 bg-amber-50">
              <div className="p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900">Prix non définis</h3>
                  <p className="text-amber-800 text-sm mt-1">
                    Vous devez définir les prix de tous les articles avant de pouvoir accepter la commande et générer le devis.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Client Info */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-stone-800 mb-4">Informations Client</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-stone-700 font-semibold uppercase tracking-wide">Nom</p>
                  <p className="font-bold text-stone-900 text-base">{getClientName(order.client)}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-700 font-semibold uppercase tracking-wide">Type</p>
                  <p className="font-bold text-stone-900 text-base">
                    {(order.client?.type?.toLowerCase() === 'b2b') ? 'Professionnel (B2B)' : 'Particulier (B2C)'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone-700 font-semibold uppercase tracking-wide">Email</p>
                  <p className="font-bold text-stone-900 text-base">{order.client?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-700 font-semibold uppercase tracking-wide">Téléphone</p>
                  <p className="font-bold text-stone-900 text-base">{order.client?.phone || '-'}</p>
                </div>
                {order.client?.address && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-stone-700 font-semibold uppercase tracking-wide">Adresse client</p>
                    <p className="font-bold text-stone-900 text-base">{order.client.address}</p>
                  </div>
                )}
                {order.shipping_address && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-stone-700 font-semibold uppercase tracking-wide">Adresse de livraison</p>
                    <p className="font-bold text-stone-900 text-base">{order.shipping_address}</p>
                  </div>
                )}
                {order.delivery_notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-stone-600">Notes de livraison</p>
                    <p className="font-medium">{order.delivery_notes}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Items */}
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-stone-800">Articles commandés</h2>
                {editingItems && canEdit() && (
                  <div className="w-96 text-stone-900">
                    <ProductSearch
                      onSelect={handleAddProduct}
                      excludeIds={pricingData.items.map((item: any) => item.product_id)}
                      placeholder="Ajouter un produit..."
                    />
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-stone-800">Produit</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-stone-800">Quantité</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-stone-800">Prix unitaire</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-stone-800">Remise %</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-stone-800">Sous-total</th>
                      {editingItems && canEdit() && (
                        <th className="px-4 py-3 text-center text-sm font-semibold text-stone-800">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {pricingData.items.map((item: any) => (
                      <tr key={item.id} className={(!item.unit_price || item.unit_price === 0) ? 'bg-amber-50' : ''}>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-bold text-stone-900">{item.product_name}</p>
                            {item.available_stock !== undefined && (
                              <p className="text-xs text-stone-600 font-medium">Stock: {item.available_stock}</p>
                            )}
                            {(!item.unit_price || item.unit_price === 0) && (
                              <p className="text-xs text-amber-600 font-bold">⚠️ Prix non défini</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {editingItems && canEdit() ? (
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-20 text-center mx-auto"
                            />
                          ) : (
                            <span className="text-stone-900 font-bold">{item.quantity}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {editing ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => handleItemPriceChange(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="w-32 text-right ml-auto"
                            />
                          ) : (
                            <span className={(!item.unit_price || item.unit_price === 0) ? 'text-amber-600 font-bold' : 'text-stone-900 font-bold'}>
                              {formatAmount(item.unit_price)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {editing ? (
                            <Input
                              type="number"
                              step="0.1"
                              value={item.discount_percent}
                              onChange={(e) => handleItemPriceChange(item.id, 'discount_percent', parseFloat(e.target.value) || 0)}
                              className="w-24 text-right ml-auto"
                            />
                          ) : (
                            <span className="text-stone-900 font-bold">{item.discount_percent}%</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-stone-900">
                          {formatAmount(item.subtotal)}
                        </td>
                        {editingItems && canEdit() && (
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Totals */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-stone-800 mb-4">Récapitulatif</h2>
              <div className="space-y-3 max-w-md ml-auto">
                <div className="flex justify-between">
                  <span className="text-stone-700 font-medium">Sous-total</span>
                  <span className="font-bold text-stone-900">{formatAmount(pricingData.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-700 font-medium">Frais de livraison</span>
                  {editing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={pricingData.shipping_fee}
                      onChange={(e) => handleGlobalFieldChange('shipping_fee', parseFloat(e.target.value) || 0)}
                      className="w-32 text-right"
                    />
                  ) : (
                    <span className="font-bold text-stone-900">{formatAmount(pricingData.shipping_fee)}</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-700 font-medium">Remise globale</span>
                  {editing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={pricingData.discount}
                      onChange={(e) => handleGlobalFieldChange('discount', parseFloat(e.target.value) || 0)}
                      className="w-32 text-right"
                    />
                  ) : (
                    <span className="font-medium text-red-600">-{formatAmount(pricingData.discount)}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700 font-medium">TVA (19%)</span>
                  <span className="font-bold text-stone-900">{formatAmount(pricingData.tax_amount)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t-2 border-stone-300">
                  <span className="text-lg font-semibold text-stone-800">Total TTC</span>
                  <span className="text-lg font-bold text-stone-900">{formatAmount(pricingData.total_amount)}</span>
                </div>
              </div>

              {editing && (
                <div className="flex justify-end gap-3 mt-6">
                  <Button onClick={() => setEditing(false)} variant="secondary">
                    Annuler
                  </Button>
                  <Button onClick={handleSavePricing} variant="primary">
                    💾 Enregistrer les prix
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Devis Tab */}
      {activeTab === 'devis' && (
        <div className="mt-6">
          <DevisTab orderId={resolvedParams.id} />
        </div>
      )}
    </div>
  );
}