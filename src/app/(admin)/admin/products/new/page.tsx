// frontend/src/app/(admin)/admin/products/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, Textarea, Select } from '../../../../components/ui';

// Mock categories - in real app, this would come from context or API
const categories = [
  { id: 'cat-1', name: 'Cheveux Brésilien' },
  { id: 'cat-2', name: 'Mèches Malaisie' },
  { id: 'cat-3', name: 'Perruques Lace Front' },
];

const suppliers = [
  { id: 'FOUR-001', name: 'Beauty Hair China' },
  { id: 'FOUR-002', name: 'Premium Locks Ltd' },
  { id: 'FOUR-003', name: 'African Hair Import' },
];

export default function NewProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    costPrice: '',
    stock: '',
    minStock: '5',
    sku: '',
    supplier: '',
    status: 'active'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const generateSKU = () => {
    const prefix = 'NOUR';
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    setFormData(prev => ({ ...prev, sku: `${prefix}-${random}` }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom est obligatoire';
    if (!formData.category) newErrors.category = 'La catégorie est obligatoire';
    if (!formData.price) newErrors.price = 'Le prix est obligatoire';
    if (!formData.costPrice) newErrors.costPrice = 'Le prix de revient est obligatoire';
    if (!formData.stock) newErrors.stock = 'Le stock est obligatoire';
    if (!formData.sku) newErrors.sku = 'La référence est obligatoire';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit logic here (API call)
    console.log('Creating product:', formData);
    
    // Redirect to products list
    router.push('/admin/products');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-light text-stone-800">Nouveau Produit</h1>
          <p className="text-stone-600 mt-1">Ajoutez un nouveau produit à votre catalogue</p>
        </div>
        <Button variant="secondary" onClick={() => router.back()}>
          ← Retour
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Information */}
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-stone-800 mb-4">Informations de Base</h2>
                
                <div className="space-y-4">
                  <Input
                    label="Nom du produit *"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder='Ex: Cheveux Brésilien 24"'
                    error={errors.name}
                    required
                  />

                  <Textarea
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Description détaillée du produit..."
                    rows={3}
                  />

                  <Select
                    label="Catégorie *"
                    options={[
                      { value: '', label: 'Sélectionner une catégorie' },
                      ...categories.map(cat => ({ value: cat.id, label: cat.name }))
                    ]}
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    error={errors.category}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Prix de vente (€) *"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleChange('price', e.target.value)}
                      placeholder="45.00"
                      error={errors.price}
                      required
                    />

                    <Input
                      label="Prix de revient (€) *"
                      type="number"
                      value={formData.costPrice}
                      onChange={(e) => handleChange('costPrice', e.target.value)}
                      placeholder="25.00"
                      error={errors.costPrice}
                      required
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-stone-800 mb-4">Images du Produit</h2>
                <div className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center">
                  <p className="text-stone-500">Glissez-déposez les images ici ou</p>
                  <Button variant="secondary" className="mt-2">
                    Parcourir les fichiers
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Inventory & Details */}
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-stone-800 mb-4">Gestion du Stock</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Stock actuel *"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => handleChange('stock', e.target.value)}
                      placeholder="50"
                      error={errors.stock}
                      required
                    />

                    <Input
                      label="Stock minimum"
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => handleChange('minStock', e.target.value)}
                      placeholder="5"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Input
                      label="Référence (SKU) *"
                      value={formData.sku}
                      onChange={(e) => handleChange('sku', e.target.value)}
                      placeholder="NOUR-ABC123"
                      error={errors.sku}
                      required
                    />
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={generateSKU}
                      className="mt-6"
                    >
                      Générer
                    </Button>
                  </div>

                  <Select
                    label="Fournisseur"
                    options={[
                      { value: '', label: 'Sélectionner un fournisseur' },
                      ...suppliers.map(sup => ({ value: sup.id, label: sup.name }))
                    ]}
                    value={formData.supplier}
                    onChange={(e) => handleChange('supplier', e.target.value)}
                  />

                  <Select
                    label="Statut"
                    options={[
                      { value: 'active', label: 'Actif' },
                      { value: 'inactive', label: 'Inactif' }
                    ]}
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-stone-800 mb-4">Informations Supplémentaires</h2>
                <div className="space-y-4">
                  <Input
                    label="Longueur"
                    value=""
                    onChange={() => {}}
                    placeholder="Ex: 24 pouces"
                  />
                  <Input
                    label="Texture"
                    value=""
                    onChange={() => {}}
                    placeholder="Ex: Lisse, Bouclé"
                  />
                  <Input
                    label="Couleur"
                    value=""
                    onChange={() => {}}
                    placeholder="Ex: Noir Naturel"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-stone-200">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => router.back()}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="primary"
          >
            Créer le Produit
          </Button>
        </div>
      </form>
    </div>
  );
}