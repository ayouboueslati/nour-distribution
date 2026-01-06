'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Input, Card, Textarea, Select, ImageUpload } from '../../../../../components/ui';
import { apiService } from '../../../../../lib/api';
import { Product } from '../../../../../../types';

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  company_name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // File states
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);

  // Existing images state
  const [productMainImage, setProductMainImage] = useState<string | null>(null);
  const [productAdditionalImages, setProductAdditionalImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    description: '',
    short_description: '',
    sku: '',
    barcode: '',

    // Categorization
    category_id: '',

    // Hair-Specific Attributes
    hair_type: '',
    hair_texture: '',
    hair_length: '',
    hair_color: '',
    hair_origin: '',
    hair_quality: '',

    // Packaging
    weight_grams: '' as string | number,
    bundle_pieces: '1',
    package_dimensions: '',

    // Inventory
    stock_quantity: '0',
    min_stock_level: '5',
    max_stock_level: '' as string | number,

    // Pricing
    cost_price: '' as string | number,
    wholesale_price: '' as string | number,
    retail_price: '' as string | number,

    // Supplier
    supplier_id: '',
    supplier_sku: '',

    // Status & Visibility
    is_active: true,
    is_featured: false,
    is_best_seller: false,
    is_new_arrival: true,

    // SEO
    meta_title: '',
    meta_description: '',
    search_keywords: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch product data, categories and suppliers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        const [productData, categoriesData, suppliersData] = await Promise.all([
          apiService.getProductAdmin(productId),
          apiService.getCategories(), // Note: In a real app, we might need pagination handling here
          apiService.getSuppliers({ limit: 1000 })
        ]);

        setProduct(productData);
        setCategories(categoriesData.categories || []);
        setSuppliers(suppliersData.suppliers || []);

        // Set existing images
        setProductMainImage(productData.main_image || null);
        setProductAdditionalImages(productData.additional_images || []);

        // Populate form with existing data
        setFormData({
          name: productData.name || '',
          description: productData.description || '',
          short_description: productData.short_description || '',
          sku: productData.sku || '',
          barcode: productData.barcode || '',
          category_id: productData.category_id || productData.category?.id || '',
          hair_type: productData.hair_type || '',
          hair_texture: productData.hair_texture || '',
          hair_length: productData.hair_length || '',
          hair_color: productData.hair_color || '',
          hair_origin: productData.hair_origin || '',
          hair_quality: productData.hair_quality || '',
          weight_grams: productData.weight_grams || '',
          bundle_pieces: productData.bundle_pieces?.toString() || '1',
          package_dimensions: productData.package_dimensions || '',
          stock_quantity: productData.stock_quantity?.toString() || '0',
          min_stock_level: productData.min_stock_level?.toString() || '5',
          max_stock_level: productData.max_stock_level || '',
          cost_price: productData.cost_price !== undefined && productData.cost_price !== null ? productData.cost_price : '',
          wholesale_price: productData.wholesale_price !== undefined && productData.wholesale_price !== null ? productData.wholesale_price : '',
          retail_price: productData.retail_price !== undefined && productData.retail_price !== null ? productData.retail_price : '',
          supplier_id: productData.supplier_id || productData.supplier?.id || '',
          supplier_sku: productData.supplier_sku || '',
          is_active: productData.is_active !== undefined ? productData.is_active : true,
          is_featured: productData.is_featured || false,
          is_best_seller: productData.is_best_seller || false,
          is_new_arrival: productData.is_new_arrival !== undefined ? productData.is_new_arrival : true,
          meta_title: productData.meta_title || '',
          meta_description: productData.meta_description || '',
          search_keywords: productData.search_keywords || ''
        });

      } catch (error: any) {
        setError(error.message || 'Erreur lors du chargement des données');
        console.error('Error fetching data:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    // ... existing submit logic ...
    // (omitted for brevity in this replace block, handled by context)
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // ... validation ...
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom est obligatoire';
    if (!formData.category_id) newErrors.category_id = 'La catégorie est obligatoire';
    if (!formData.sku.trim()) newErrors.sku = 'La référence est obligatoire';
    if (!formData.supplier_id) newErrors.supplier_id = 'Le fournisseur est obligatoire';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // 1. Update Product Data
      const submitData: any = {
        // Basic Information
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        short_description: formData.short_description.trim() || null,
        sku: formData.sku.trim(),
        barcode: formData.barcode.trim() || null,

        // Categorization
        category_id: formData.category_id,

        // Hair-Specific Attributes
        hair_type: formData.hair_type.trim() || null,
        hair_texture: formData.hair_texture.trim() || null,
        hair_length: formData.hair_length.trim() || null,
        hair_color: formData.hair_color.trim() || null,
        hair_origin: formData.hair_origin.trim() || null,
        hair_quality: formData.hair_quality.trim() || null,

        // Packaging
        weight_grams: formData.weight_grams ? Number(formData.weight_grams) : null,
        bundle_pieces: Number(formData.bundle_pieces) || 1,
        package_dimensions: formData.package_dimensions.trim() || null,

        // Inventory
        stock_quantity: Number(formData.stock_quantity) || 0,
        min_stock_level: Number(formData.min_stock_level) || 5,
        max_stock_level: formData.max_stock_level ? Number(formData.max_stock_level) : null,

        // Pricing
        cost_price: formData.cost_price ? Number(formData.cost_price) : null,
        wholesale_price: formData.wholesale_price ? Number(formData.wholesale_price) : null,
        retail_price: formData.retail_price ? Number(formData.retail_price) : null,

        // Supplier
        supplier_id: formData.supplier_id,
        supplier_sku: formData.supplier_sku.trim() || null,

        // Status & Visibility
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        is_best_seller: formData.is_best_seller,
        is_new_arrival: formData.is_new_arrival,

        // SEO
        meta_title: formData.meta_title.trim() || null,
        meta_description: formData.meta_description.trim() || null,
        search_keywords: formData.search_keywords.trim() || null
      };

      console.log('📤 Updating product data:', submitData);
      await apiService.updateProduct(productId, submitData);

      // 2. Upload New Images if any
      // Upload main image
      if (mainImageFile) {
        console.log('📤 Uploading new main image:', mainImageFile.name);
        try {
          await apiService.uploadMainImage(productId, mainImageFile);
          console.log('✅ Main image uploaded successfully');
        } catch (err) {
          console.error('❌ Error uploading main image:', err);
        }
      }

      // Upload additional images
      console.log('Checking for additional images:', additionalImageFiles);
      if (additionalImageFiles.length > 0) {
        console.log(`📤 Uploading ${additionalImageFiles.length} additional images...`);
        try {
          const result = await apiService.uploadAdditionalImages(productId, additionalImageFiles);
          console.log('✅ Additional images uploaded successfully:', result);
        } catch (err) {
          console.error('❌ Error uploading additional images:', err);
        }
      } else {
        console.log('ℹ️ No additional images to upload');
      }

      // Redirect to product detail page
      router.push(`/admin/products/${productId}`);
    } catch (error: any) {
      console.error('Error updating product:', error);
      setErrors({ submit: error.message || 'Erreur lors de la modification du produit' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDeleteImage = async (imagePath: string, isMain: boolean) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette image ?')) return;

    try {
      await apiService.deleteProductImage(productId, imagePath);

      if (isMain) {
        setProductMainImage(null);
      } else {
        setProductAdditionalImages(prev => prev.filter(p => p !== imagePath));
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Erreur lors de la suppression de l\'image');
    }
  };

  if (initialLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-stone-600">Chargement du produit...</div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Erreur</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <Button variant="primary" onClick={() => router.push('/admin/products')} className="mt-3">
            Retour aux produits
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-2">
            ← Retour
          </Button>
          <h1 className="text-3xl font-light text-stone-800">Modifier le Produit</h1>
          <p className="text-stone-600 mt-1">SKU: {product?.sku}</p>
        </div>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{errors.submit}</p>
        </div>
      )}

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

                  <Textarea
                    label="Description courte"
                    value={formData.short_description}
                    onChange={(e) => handleChange('short_description', e.target.value)}
                    placeholder="Description courte pour les cartes produit..."
                    rows={2}
                  />

                  <Select
                    label="Catégorie *"
                    options={[
                      { value: '', label: 'Sélectionner une catégorie' },
                      ...categories.map(cat => ({ value: cat.id, label: cat.name }))
                    ]}
                    value={formData.category_id}
                    onChange={(e) => handleChange('category_id', e.target.value)}
                    error={errors.category_id}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Référence (SKU) *"
                      value={formData.sku}
                      onChange={(e) => handleChange('sku', e.target.value)}
                      placeholder="NOUR-ABC123"
                      error={errors.sku}
                      required
                    />

                    <Input
                      label="Code-barres"
                      value={formData.barcode}
                      onChange={(e) => handleChange('barcode', e.target.value)}
                      placeholder="1234567890123"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-stone-800 mb-4">Prix</h2>
                <div className="space-y-4">
                  <Input
                    label="Prix de revient (€)"
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => handleChange('cost_price', e.target.value)}
                    placeholder="25.00"
                  />

                  <Input
                    label="Prix de gros (€)"
                    type="number"
                    step="0.01"
                    value={formData.wholesale_price}
                    onChange={(e) => handleChange('wholesale_price', e.target.value)}
                    placeholder="45.00"
                  />

                  <Input
                    label="Prix de détail (€)"
                    type="number"
                    step="0.01"
                    value={formData.retail_price}
                    onChange={(e) => handleChange('retail_price', e.target.value)}
                    placeholder="65.00"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-stone-800 mb-4">Images</h2>
                <div className="space-y-6">
                  <ImageUpload
                    label="Image Principale"
                    files={mainImageFile ? [mainImageFile] : []}
                    onFilesChange={(files: File[]) => setMainImageFile(files[0] || null)}
                    existingImages={productMainImage ? [productMainImage] : []}
                    onDeleteExisting={(path: string) => handleDeleteImage(path, true)}
                    helpText="Cette image sera utilisée comme miniature partout."
                  />

                  <ImageUpload
                    label="Images Supplémentaires"
                    files={additionalImageFiles}
                    onFilesChange={setAdditionalImageFiles}
                    multiple
                    existingImages={productAdditionalImages}
                    onDeleteExisting={(path: string) => handleDeleteImage(path, false)}
                    helpText="Ajoutez d'autres vues du produit."
                  />
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
                      label="Stock actuel"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => handleChange('stock_quantity', e.target.value)}
                      placeholder="50"
                    />

                    <Input
                      label="Stock minimum"
                      type="number"
                      value={formData.min_stock_level}
                      onChange={(e) => handleChange('min_stock_level', e.target.value)}
                      placeholder="5"
                    />
                  </div>

                  <Input
                    label="Stock maximum"
                    type="number"
                    value={formData.max_stock_level}
                    onChange={(e) => handleChange('max_stock_level', e.target.value)}
                    placeholder="100"
                  />

                  <Select
                    label="Fournisseur *"
                    options={[
                      { value: '', label: 'Sélectionner un fournisseur' },
                      ...suppliers.map(sup => ({ value: sup.id, label: sup.company_name }))
                    ]}
                    value={formData.supplier_id}
                    onChange={(e) => handleChange('supplier_id', e.target.value)}
                    error={errors.supplier_id}
                    required
                  />

                  <Input
                    label="Référence fournisseur"
                    value={formData.supplier_sku}
                    onChange={(e) => handleChange('supplier_sku', e.target.value)}
                    placeholder="Référence du fournisseur"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-stone-800 mb-4">Caractéristiques des Cheveux</h2>
                <div className="space-y-4">
                  <Input
                    label="Type de cheveux"
                    value={formData.hair_type}
                    onChange={(e) => handleChange('hair_type', e.target.value)}
                    placeholder="Ex: Brésilien, Malaisien, Péruvien"
                  />
                  <Input
                    label="Texture"
                    value={formData.hair_texture}
                    onChange={(e) => handleChange('hair_texture', e.target.value)}
                    placeholder="Ex: Lisse, Bouclé, Ondulé"
                  />
                  <Input
                    label="Longueur"
                    value={formData.hair_length}
                    onChange={(e) => handleChange('hair_length', e.target.value)}
                    placeholder={'Ex: 24", 26", 28"'}
                  />

                  <Input
                    label="Couleur"
                    value={formData.hair_color}
                    onChange={(e) => handleChange('hair_color', e.target.value)}
                    placeholder="Ex: Noir Naturel, Brun, Blond"
                  />
                  <Input
                    label="Origine"
                    value={formData.hair_origin}
                    onChange={(e) => handleChange('hair_origin', e.target.value)}
                    placeholder="Ex: Brésil, Malaisie, Pérou"
                  />
                  <Input
                    label="Qualité"
                    value={formData.hair_quality}
                    onChange={(e) => handleChange('hair_quality', e.target.value)}
                    placeholder="Ex: Premium, Standard, Économique"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-stone-800 mb-4">Emballage</h2>
                <div className="space-y-4">
                  <Input
                    label="Poids (grammes)"
                    type="number"
                    value={formData.weight_grams}
                    onChange={(e) => handleChange('weight_grams', e.target.value)}
                    placeholder="Ex: 150"
                  />

                  <Input
                    label="Nombre de pièces par lot"
                    type="number"
                    value={formData.bundle_pieces}
                    onChange={(e) => handleChange('bundle_pieces', e.target.value)}
                    placeholder="1"
                  />

                  <Input
                    label="Dimensions de l'emballage"
                    value={formData.package_dimensions}
                    onChange={(e) => handleChange('package_dimensions', e.target.value)}
                    placeholder="Ex: 30x20x5 cm"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-stone-800 mb-4">Statut et Visibilité</h2>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleChange('is_active', e.target.checked)}
                      className="rounded border-stone-300"
                    />
                    <span className="ml-2 text-sm text-stone-600">Produit actif</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => handleChange('is_featured', e.target.checked)}
                      className="rounded border-stone-300"
                    />
                    <span className="ml-2 text-sm text-stone-600">Produit en vedette</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_best_seller}
                      onChange={(e) => handleChange('is_best_seller', e.target.checked)}
                      className="rounded border-stone-300"
                    />
                    <span className="ml-2 text-sm text-stone-600">Meilleure vente</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_new_arrival}
                      onChange={(e) => handleChange('is_new_arrival', e.target.checked)}
                      className="rounded border-stone-300"
                    />
                    <span className="ml-2 text-sm text-stone-600">Nouveauté</span>
                  </label>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* SEO Section */}
        <Card className="mt-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">SEO et Métadonnées</h2>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Titre SEO"
                value={formData.meta_title}
                onChange={(e) => handleChange('meta_title', e.target.value)}
                placeholder="Titre pour les moteurs de recherche"
              />
              <Textarea
                label="Description SEO"
                value={formData.meta_description}
                onChange={(e) => handleChange('meta_description', e.target.value)}
                placeholder="Description pour les moteurs de recherche..."
                rows={2}
              />
              <Input
                label="Mots-clés de recherche"
                value={formData.search_keywords}
                onChange={(e) => handleChange('search_keywords', e.target.value)}
                placeholder="cheveux, brésilien, 24 pouces, naturel"
                helpText="Séparez les mots-clés par des virgules"
              />
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-stone-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(`/admin/products/${productId}`)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Mise à jour...' : 'Mettre à jour le Produit'}
          </Button>
        </div>
      </form>
    </div>
  );
}