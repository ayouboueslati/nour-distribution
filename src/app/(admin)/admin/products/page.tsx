// frontend/src/app/(admin)/admin/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Input, Card, Badge, Select, Modal, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui';

// Types
interface Category {
    id: string;
    name: string;
    description: string;
    productCount: number;
    createdAt: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    costPrice: number;
    stock: number;
    minStock: number;
    sku: string;
    supplier: string;
    images: string[];
    status: 'active' | 'inactive' | 'out_of_stock';
    createdAt: string;
    updatedAt: string;
}

// Mock data - in real app, this would come from API
const initialCategories: Category[] = [
    { id: 'cat-1', name: 'Cheveux Brésilien', description: 'Cheveux naturels brésiliens de haute qualité', productCount: 15, createdAt: '2024-01-15' },
    { id: 'cat-2', name: 'Mèches Malaisie', description: 'Mèches malaisiennes premium', productCount: 12, createdAt: '2024-01-15' },
    { id: 'cat-3', name: 'Perruques Lace Front', description: 'Perruques avec front en dentelle', productCount: 8, createdAt: '2024-01-15' },
];

const initialProducts: Product[] = [
    {
        id: 'prod-1',
        name: 'Cheveux Brésilien 24"',
        description: 'Cheveux brésiliens naturels 24 pouces',
        category: 'cat-1',
        price: 45,
        costPrice: 25,
        stock: 23,
        minStock: 5,
        sku: 'CB24-001',
        supplier: 'FOUR-001',
        images: [],
        status: 'active',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
    },
    {
        id: 'prod-2',
        name: 'Mèches Malaisie 26"',
        description: 'Mèches malaisiennes 26 pouces',
        category: 'cat-2',
        price: 52,
        costPrice: 30,
        stock: 5,
        minStock: 5,
        sku: 'MM26-001',
        supplier: 'FOUR-002',
        images: [],
        status: 'active',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
    },
    {
        id: 'prod-3',
        name: 'Perruque Lace Front Naturelle',
        description: 'Perruque lace front look naturel',
        category: 'cat-3',
        price: 120,
        costPrice: 65,
        stock: 0,
        minStock: 3,
        sku: 'PLF-001',
        supplier: 'FOUR-002',
        images: [],
        status: 'out_of_stock',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
    },
];

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Category Management Modal
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDescription, setNewCategoryDescription] = useState('');

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
            product.sku.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || product.status === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Get category name by ID
    const getCategoryName = (categoryId: string) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'Non catégorisé';
    };

    // Get status color and text
    const getProductStatus = (product: Product) => {
        if (product.status === 'inactive') {
            return { text: 'Inactif', variant: 'default' as const };
        }
        if (product.stock === 0) {
            return { text: 'Rupture de stock', variant: 'danger' as const };
        }
        if (product.stock <= product.minStock) {
            return { text: 'Stock faible', variant: 'warning' as const };
        }
        return { text: 'En stock', variant: 'success' as const };
    };
    // Category Management
    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return;

        const newCategory: Category = {
            id: `cat-${Date.now()}`,
            name: newCategoryName,
            description: newCategoryDescription,
            productCount: 0,
            createdAt: new Date().toISOString().split('T')[0]
        };

        setCategories(prev => [...prev, newCategory]);
        setNewCategoryName('');
        setNewCategoryDescription('');
        setShowCategoryModal(false);
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        setNewCategoryName(category.name);
        setNewCategoryDescription(category.description);
        setShowCategoryModal(true);
    };

    const handleUpdateCategory = () => {
        if (!editingCategory || !newCategoryName.trim()) return;

        setCategories(prev =>
            prev.map(cat =>
                cat.id === editingCategory.id
                    ? { ...cat, name: newCategoryName, description: newCategoryDescription }
                    : cat
            )
        );

        // Also update products that use this category
        setProducts(prev =>
            prev.map(product =>
                product.category === editingCategory.id
                    ? { ...product, category: editingCategory.id } // Keep same category ID, just update references if needed
                    : product
            )
        );

        setEditingCategory(null);
        setNewCategoryName('');
        setNewCategoryDescription('');
        setShowCategoryModal(false);
    };

    const handleDeleteCategory = (categoryId: string) => {
        // Check if category has products
        const category = categories.find(cat => cat.id === categoryId);
        if (category && category.productCount > 0) {
            alert('Impossible de supprimer une catégorie contenant des produits. Veuillez d\'abord déplacer ou supprimer les produits.');
            return;
        }

        if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
            setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        }
    };

    const resetCategoryForm = () => {
        setEditingCategory(null);
        setNewCategoryName('');
        setNewCategoryDescription('');
        setShowCategoryModal(false);
    };

    // Statistics
    const totalProducts = products.length;
    const outOfStockProducts = products.filter(p => p.stock === 0).length;
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
    const activeProducts = products.filter(p => p.status === 'active').length;

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

            {/* Filters */}
            <Card>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                { value: 'all', label: 'Tous les statuts' },
                                { value: 'active', label: 'Actif' },
                                { value: 'inactive', label: 'Inactif' },
                                { value: 'out_of_stock', label: 'Rupture' }
                            ]}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        />
                        <Select
                            options={[
                                { value: 'all', label: 'Tous les fournisseurs' },
                                { value: 'FOUR-001', label: 'Beauty Hair China' },
                                { value: 'FOUR-002', label: 'Premium Locks Ltd' }
                            ]}
                            value="all"
                            onChange={() => { }}
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
                        <div className="text-sm text-stone-600">
                            Mis à jour aujourd'hui
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
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
                                                {getCategoryName(product.category)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-semibold text-stone-800">{product.price}€</p>
                                                <p className="text-xs text-stone-500">Coût: {product.costPrice}€</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium">{product.stock}</span>
                                                {product.stock <= product.minStock && (
                                                    <span className="text-xs text-amber-600">min: {product.minStock}</span>
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
                                                {product.supplier === 'FOUR-001' ? 'Beauty Hair' : 'Premium Locks'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={`/admin/products/${product.id}`}
                                                    className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                                                >
                                                    Modifier
                                                </Link>
                                                <button
                                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                    onClick={() => console.log('View details', product.id)}
                                                >
                                                    Détails
                                                </button>
                                                <button
                                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                    onClick={() => console.log('Delete', product.id)}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Nom de la catégorie *"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Ex: Cheveux Brésilien"
                            />
                            <Input
                                label="Description"
                                value={newCategoryDescription}
                                onChange={(e) => setNewCategoryDescription(e.target.value)}
                                placeholder="Description de la catégorie"
                            />
                        </div>
                        <div className="flex justify-end space-x-3 mt-4">
                            <Button variant="secondary" onClick={resetCategoryForm}>
                                Annuler
                            </Button>
                            <Button
                                variant="primary"
                                onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                                disabled={!newCategoryName.trim()}
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
                                            {category.productCount} produit(s) • Créée le {category.createdAt}
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