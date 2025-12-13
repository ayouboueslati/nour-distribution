'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Input, Card, Badge, Select, Modal, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui';
import { apiService } from '../../../lib/api';
import { Product, Category, Supplier } from '../../../../types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Category Management Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    slug: '',
    image_url: '',
    sort_order: 0,
    is_active: true,
    is_featured: false
  });

  // Bulk Operations
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  // Fetch data from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, suppliersData] = await Promise.all([
        apiService.getProducts(),
        apiService.getCategories(),
        apiService.getSuppliers()
      ]);

      setProducts(productsData.products || []);
      setCategories(categoriesData.categories || []);
      setSuppliers(suppliersData.suppliers || []);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      product.description?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
    const matchesSupplier = supplierFilter === 'all' || product.supplier_id === supplierFilter;

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && product.is_active) ||
      (statusFilter === 'inactive' && !product.is_active);

    const matchesStock = stockFilter === 'all' ||
      (stockFilter === 'out_of_stock' && product.stock_quantity === 0) ||
      (stockFilter === 'low_stock' && product.stock_quantity > 0 && product.stock_quantity <= product.min_stock_level) ||
      (stockFilter === 'in_stock' && product.stock_quantity > product.min_stock_level);

    return matchesSearch && matchesCategory && matchesSupplier && matchesStatus && matchesStock;
  });

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Non catégorisé';
  };

  // Get supplier name by ID
  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(sup => sup.id === supplierId);
    return supplier ? supplier.company_name : 'N/A';
  };

  // Get status color and text
  const getProductStatus = (product: Product) => {
    if (!product.is_active) {
      return { text: 'Inactif', variant: 'default' as const };
    }
    if (product.stock_quantity === 0) {
      return { text: 'Rupture de stock', variant: 'danger' as const };
    }
    if (product.stock_quantity <= product.min_stock_level) {
      return { text: 'Stock faible', variant: 'warning' as const };
    }
    return { text: 'En stock', variant: 'success' as const };
  };

  // Category Management
  const handleAddCategory = async () => {
    if (!categoryForm.name.trim() || !categoryForm.slug.trim()) return;

    try {
      await apiService.createCategory(categoryForm);
      await fetchData(); // Refresh data
      resetCategoryForm();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la catégorie');
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      slug: category.slug,
      image_url: category.image_url || '',
      sort_order: category.sort_order,
      is_active: category.is_active,
      is_featured: category.is_featured
    });
    setShowCategoryModal(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      await apiService.updateCategory(editingCategory.id, categoryForm);
      await fetchData(); // Refresh data
      resetCategoryForm();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification de la catégorie');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        await apiService.deleteCategory(categoryId);
        await fetchData(); // Refresh data
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la suppression de la catégorie');
      }
    }
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: '',
      slug: '',
      image_url: '',
      sort_order: 0,
      is_active: true,
      is_featured: false
    });
    setShowCategoryModal(false);
  };

  // Bulk Operations
  const handleBulkAction = async () => {
    if (!bulkAction || selectedProducts.length === 0) return;

    try {
      switch (bulkAction) {
        case 'activate':
          await Promise.all(selectedProducts.map(id =>
            apiService.updateProduct(id, { is_active: true })
          ));
          break;
        case 'deactivate':
          await Promise.all(selectedProducts.map(id =>
            apiService.updateProduct(id, { is_active: false })
          ));
          break;
        case 'delete':
          if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedProducts.length} produit(s) ?`)) {
            await Promise.all(selectedProducts.map(id =>
              apiService.deleteProduct(id)
            ));
          }
          break;
      }

      await fetchData(); // Refresh data
      setSelectedProducts([]);
      setShowBulkModal(false);
      setBulkAction('');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'opération en masse');
    }
  };

  // Toggle product selection
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Select all filtered products
  const selectAllProducts = () => {
    setSelectedProducts(filteredProducts.map(p => p.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedProducts([]);
  };

  // Statistics
  const totalProducts = products.length;
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0).length;
  const lowStockProducts = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.min_stock_level).length;
  const activeProducts = products.filter(p => p.is_active).length;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center animate-fade-in">
          <div>
            <div className="h-8 w-64 bg-stone-200 rounded skeleton mb-2"></div>
            <div className="h-4 w-48 bg-stone-200 rounded skeleton"></div>
          </div>
          <div className="flex space-x-3">
            <div className="h-10 w-40 bg-stone-200 rounded-lg skeleton"></div>
            <div className="h-10 w-40 bg-stone-200 rounded-lg skeleton"></div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 p-6 animate-pulse" style={{ animationDelay: `${i * 75}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-stone-200 rounded w-1/2 skeleton"></div>
                <div className="w-10 h-10 bg-stone-200 rounded-lg skeleton"></div>
              </div>
              <div className="h-8 bg-stone-200 rounded w-1/3 skeleton"></div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-stone-200 rounded skeleton"></div>
            ))}
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          {/* Table Header */}
          <div className="border-b border-stone-200 p-6">
            <div className="h-6 bg-stone-200 rounded w-48 skeleton"></div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-stone-100">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="grid grid-cols-9 gap-4">
                  {Array.from({ length: 9 }).map((_, j) => (
                    <div key={j} className="h-4 bg-stone-200 rounded skeleton"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Erreur</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <Button variant="primary" onClick={fetchData} className="mt-3">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-stone-800">Gestion des Produits</h1>
          <p className="text-stone-600 mt-1">Gérez votre inventaire et catégories</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => setShowCategoryModal(true)}
          >
            📁 Gérer Catégories
          </Button>
          <Link href="/admin/products/new">
            <Button variant="primary">
              + Nouveau Produit
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Produits" value={totalProducts.toString()} icon="📦" />
        <StatCard title="En stock" value={activeProducts.toString()} icon="✅" variant="success" />
        <StatCard title="Stock faible" value={lowStockProducts.toString()} icon="⚠️" variant="warning" />
        <StatCard title="Rupture" value={outOfStockProducts.toString()} icon="❌" variant="danger" />
      </div>

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="font-medium text-amber-800">
                {selectedProducts.length} produit(s) sélectionné(s)
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={clearSelection}
              >
                Tout désélectionner
              </Button>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowBulkModal(true)}
            >
              Actions en masse
            </Button>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              options={[
                { value: 'all', label: 'Toutes les catégories' },
                ...categories.map(cat => ({ value: cat.id, label: cat.name }))
              ]}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            />
            <Select
              options={[
                { value: 'all', label: 'Tous les fournisseurs' },
                ...suppliers.map(sup => ({ value: sup.id, label: sup.company_name }))
              ]}
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
            />
            <Select
              options={[
                { value: 'all', label: 'Tous les statuts' },
                { value: 'active', label: 'Actif' },
                { value: 'inactive', label: 'Inactif' }
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <Select
              options={[
                { value: 'all', label: 'Tout le stock' },
                { value: 'in_stock', label: 'En stock' },
                { value: 'low_stock', label: 'Stock faible' },
                { value: 'out_of_stock', label: 'Rupture' }
              ]}
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-stone-800">
              Liste des Produits ({filteredProducts.length})
            </h2>
            <div className="flex items-center space-x-4">
              {filteredProducts.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAllProducts}
                >
                  Tout sélectionner
                </Button>
              )}
              <div className="text-sm text-stone-600">
                Mis à jour aujourd'hui
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={selectAllProducts}
                    className="rounded border-stone-300"
                  />
                </TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const status = getProductStatus(product);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="rounded border-stone-300"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-stone-800">{product.name}</p>
                        <p className="text-sm text-stone-600 truncate max-w-[200px]">
                          {product.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>
                      <Badge variant="default" size="sm">
                        {getCategoryName(product.category_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-stone-800">
                          {product.wholesale_price ? `${product.wholesale_price}€` : 'N/A'}
                        </p>
                        <p className="text-xs text-stone-500">
                          Coût: {product.cost_price ? `${product.cost_price}€` : 'N/A'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{product.stock_quantity}</span>
                        {product.stock_quantity <= product.min_stock_level && (
                          <span className="text-xs text-amber-600">min: {product.min_stock_level}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant} size="sm">
                        {status.text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-stone-600">
                        {getSupplierName(product.supplier_id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                        >
                          Modifier
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Détails
                        </Link>
                        <button
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                          onClick={async () => {
                            if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
                              try {
                                await apiService.deleteProduct(product.id);
                                await fetchData(); // Refresh the list
                              } catch (err: any) {
                                setError(err.message || 'Erreur lors de la suppression du produit');
                              }
                            }
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-stone-400 text-lg">Aucun produit trouvé</div>
              <p className="text-stone-500 mt-2">
                {search || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Ajustez vos filtres pour voir plus de résultats'
                  : 'Commencez par ajouter votre premier produit'
                }
              </p>
              {(search === '' && categoryFilter === 'all' && statusFilter === 'all') && (
                <Link href="/admin/products/new" className="inline-block mt-4">
                  <Button variant="primary">
                    + Ajouter un Produit
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Category Management Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={resetCategoryForm}
        title={editingCategory ? "Modifier la Catégorie" : "Gérer les Catégories"}
        size="lg"
      >
        <div className="space-y-6">
          {/* Add/Edit Category Form */}
          <div className="bg-stone-50 p-4 rounded-lg">
            <h3 className="font-medium text-stone-800 mb-3">
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle Catégorie'}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Nom de la catégorie *"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Cheveux Brésilien"
              />
              <Input
                label="Slug *"
                value={categoryForm.slug}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="Ex: cheveux-bresilien"
                helpText="Identifiant unique pour l'URL"
              />
              <Input
                label="Description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de la catégorie"
              />
              <Input
                label="Image URL"
                value={categoryForm.image_url}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Ordre d'affichage"
                  type="number"
                  value={categoryForm.sort_order}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) }))}
                />
                <div className="flex items-center space-x-4 mt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={categoryForm.is_active}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded border-stone-300"
                    />
                    <span className="ml-2 text-sm text-stone-600">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={categoryForm.is_featured}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="rounded border-stone-300"
                    />
                    <span className="ml-2 text-sm text-stone-600">En vedette</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <Button variant="secondary" onClick={resetCategoryForm}>
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                disabled={!categoryForm.name.trim() || !categoryForm.slug.trim()}
              >
                {editingCategory ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </div>

          {/* Categories List */}
          <div>
            <h3 className="font-medium text-stone-800 mb-3">Catégories Existantes</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border border-stone-200 rounded-lg">
                  <div>
                    <p className="font-medium text-stone-800">{category.name}</p>
                    <p className="text-sm text-stone-600">{category.description}</p>
                    <p className="text-xs text-stone-500">
                      {category.products_count || 0} produit(s) • Slug: {category.slug}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-amber-600 hover:text-amber-700 text-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Bulk Actions Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Actions en Masse"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-stone-600">
            Appliquer une action à {selectedProducts.length} produit(s) sélectionné(s)
          </p>

          <Select
            label="Action à appliquer"
            options={[
              { value: '', label: 'Sélectionner une action' },
              { value: 'activate', label: 'Activer les produits' },
              { value: 'deactivate', label: 'Désactiver les produits' },
              { value: 'delete', label: 'Supprimer les produits' }
            ]}
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowBulkModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleBulkAction}
              disabled={!bulkAction}
            >
              Appliquer
            </Button>
          </div>
        </div>
      </Modal>
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