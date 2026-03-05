'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Grid3X3, List, X, Loader2 } from 'lucide-react';
import ProductCard from '../../components/features/ProductCard';
import { apiService, getProductImageUrl } from '../../lib/api';
import { Product, Category, ProductListResponse } from '../../../types';

export default function ProductsPage() {
    return (
        <React.Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>}>
            <ProductsPageContent />
        </React.Suspense>
    );
}

function ProductsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedCategoryName, setSelectedCategoryName] = useState<string>('Toutes les catégories');
    const [inStockOnly, setInStockOnly] = useState<boolean>(true);
    const [lowStockOnly, setLowStockOnly] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // Pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalProducts, setTotalProducts] = useState<number>(0);
    const pageSize = 12;

    // Get category from URL parameter
    const urlCategory = searchParams.get('category');

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch products when filters change
    useEffect(() => {
        fetchProducts();
    }, [selectedCategoryId, inStockOnly, lowStockOnly, searchTerm, currentPage]);

    // Handle URL category parameter
    useEffect(() => {
        if (urlCategory && Array.isArray(categories) && categories.length > 0) {
            const category = categories.find(c => c.name === urlCategory);
            if (category) {
                setSelectedCategoryId(category.id);
                setSelectedCategoryName(category.name);
            }
        }
    }, [urlCategory, categories]);

    const fetchCategories = async () => {
        try {
            const response = await apiService.getCategories();
            // The API returns an object with a 'categories' property
            // Check if response is an object and has categories property
            if (response && typeof response === 'object' && 'categories' in response) {
                setCategories(Array.isArray(response.categories) ? response.categories : []);
            } else if (Array.isArray(response)) {
                // Fallback: if response is directly an array
                setCategories(response);
            } else {
                console.warn('Unexpected categories response format:', response);
                setCategories([]);
            }
        } catch (err: any) {
            console.error('Error fetching categories:', err);
            setError('Erreur lors du chargement des catégories');
            setCategories([]);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        setError('');

        try {
            const params: any = {
                skip: (currentPage - 1) * pageSize,
                limit: pageSize,
            };

            if (selectedCategoryId) {
                params.category_id = selectedCategoryId;
            }

            if (inStockOnly) {
                params.is_active = true;
            }

            if (searchTerm) {
                params.search = searchTerm;
            }

            const response = await apiService.getProducts(params);

            // Handle different response structures
            let productsArray: Product[] = [];
            let total = 0;

            if (response && typeof response === 'object') {
                // Check for 'products' property (from ProductListResponse)
                if ('products' in response && Array.isArray(response.products)) {
                    productsArray = response.products;
                    total = response.total || productsArray.length;
                }
                // Check for 'data' property (alternative structure)
                else if ('data' in response && Array.isArray(response.data)) {
                    productsArray = response.data;
                    total = response.total || productsArray.length;
                }
                // If response itself is an array
                else if (Array.isArray(response)) {
                    productsArray = response;
                    total = response.length;
                }
            }

            let filteredProducts = productsArray;

            // Apply client-side filters for low stock
            if (lowStockOnly) {
                filteredProducts = filteredProducts.filter((p: Product) =>
                    p.available_quantity > 0 && p.available_quantity < 20
                );
            }

            // Apply client-side filter for in stock
            if (inStockOnly) {
                filteredProducts = filteredProducts.filter((p: Product) =>
                    p.available_quantity > 0
                );
            }

            setProducts(filteredProducts);
            setTotalProducts(total);
        } catch (err: any) {
            console.error('Error fetching products:', err);
            setError('Erreur lors du chargement des produits');
            setProducts([]);
            setTotalProducts(0);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (productId: string) => {
        router.push(`/products/${productId}`);
    };

    const getStockStatus = (availableQty: number, needsRestock: boolean): string => {
        if (availableQty === 0) return "Rupture de stock";
        if (needsRestock || availableQty < 20) return "Stock limité";
        return "En stock";
    };

    const handleCategoryChange = (categoryId: string, categoryName: string) => {
        setSelectedCategoryId(categoryId);
        setSelectedCategoryName(categoryName);
        setCurrentPage(1);

        if (categoryName === 'Toutes les catégories') {
            router.push('/products');
        } else {
            router.push(`/products?category=${encodeURIComponent(categoryName)}`);
        }
    };

    const clearCategoryFilter = () => {
        setSelectedCategoryId('');
        setSelectedCategoryName('Toutes les catégories');
        setCurrentPage(1);
        router.push('/products');
    };

    const resetAllFilters = () => {
        setSelectedCategoryId('');
        setSelectedCategoryName('Toutes les catégories');
        setInStockOnly(true);
        setLowStockOnly(false);
        setSearchTerm('');
        setCurrentPage(1);
        router.push('/products');
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleLoadMore = () => {
        setCurrentPage(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Header Section */}
            <section className="bg-white border-b border-stone-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-light text-stone-900 mb-4">
                            Notre <span className="font-semibold">Catalogue</span>
                        </h1>
                        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                            Découvrez notre sélection complète de cheveux de tresse africaine de qualité professionnelle
                        </p>
                        {selectedCategoryName !== 'Toutes les catégories' && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <span className="text-amber-600 font-medium">
                                    Filtre actif: {selectedCategoryName}
                                </span>
                                <button
                                    onClick={clearCategoryFilter}
                                    className="text-stone-500 hover:text-stone-700 transition-colors"
                                    aria-label="Effacer le filtre"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Filters and Products Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filters */}
                    <div className="lg:w-64 shrink-0">
                        <div className="glass bg-white/80 rounded-2xl border border-stone-200 p-6 sticky top-24 shadow-md">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-stone-900">Filtres</h3>
                                <Filter className="h-5 w-5 text-amber-600" />
                            </div>

                            {/* Search */}
                            <div className="mb-6">
                                <h4 className="font-medium text-stone-900 mb-3">Recherche</h4>
                                <input
                                    type="text"
                                    placeholder="Nom, SKU..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition-all duration-300"
                                />
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <h4 className="font-medium text-stone-900 mb-3">Catégories</h4>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={selectedCategoryId === ''}
                                            onChange={() => handleCategoryChange('', 'Toutes les catégories')}
                                            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300"
                                        />
                                        <span className="text-sm text-stone-700">Toutes les catégories</span>
                                    </label>
                                    {Array.isArray(categories) && categories.map((category) => (
                                        <label key={category.id} className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="category"
                                                value={category.id}
                                                checked={selectedCategoryId === category.id}
                                                onChange={() => handleCategoryChange(category.id, category.name)}
                                                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300"
                                            />
                                            <span className="text-sm text-stone-700">{category.name}</span>
                                        </label>
                                    ))}
                                    {(!Array.isArray(categories) || categories.length === 0) && !loading && (
                                        <p className="text-sm text-stone-500 italic text-center py-2">
                                            Aucune catégorie disponible
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Stock Filter */}
                            <div className="mb-6">
                                <h4 className="font-medium text-stone-900 mb-3">Disponibilité</h4>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={inStockOnly}
                                            onChange={(e) => setInStockOnly(e.target.checked)}
                                            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded"
                                        />
                                        <span className="text-sm text-stone-700">En stock</span>
                                    </label>
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={lowStockOnly}
                                            onChange={(e) => setLowStockOnly(e.target.checked)}
                                            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded"
                                        />
                                        <span className="text-sm text-stone-700">Stock limité</span>
                                    </label>
                                </div>
                            </div>

                            {/* Reset Filters */}
                            <button
                                onClick={resetAllFilters}
                                className="w-full bg-stone-100 text-stone-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-stone-200 transition-colors"
                            >
                                Réinitialiser
                            </button>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div className="text-stone-600">
                                {loading ? (
                                    <span>Chargement...</span>
                                ) : (
                                    <>
                                        <span className="font-medium">{products.length}</span> produits trouvés
                                        {selectedCategoryName !== 'Toutes les catégories' && (
                                            <span className="text-amber-600 ml-2">
                                                dans {selectedCategoryName}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                {/* View Toggle */}
                                <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-1">
                                    <button className="p-2 rounded-md bg-amber-50 text-amber-600">
                                        <Grid3X3 className="h-4 w-4" />
                                    </button>
                                    <button className="p-2 rounded-md text-stone-400 hover:text-stone-600">
                                        <List className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Error State */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Loading State with Skeleton */}
                        {loading && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <div key={n} className="bg-white rounded-2xl overflow-hidden shadow-md border border-stone-200 animate-pulse">
                                        <div className="h-80 bg-stone-200 skeleton"></div>
                                        <div className="p-6">
                                            <div className="h-6 bg-stone-200 rounded mb-3 skeleton"></div>
                                            <div className="h-4 bg-stone-200 rounded mb-4 w-3/4 skeleton"></div>
                                            <div className="h-10 bg-stone-200 rounded skeleton"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Products Grid with Stagger Animation */}
                        {!loading && !error && products.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product, index) => (
                                    <div
                                        key={product.id}
                                        className={`animate-fade-in-up delay-${Math.min(index * 75, 300)}`}
                                    >
                                        <ProductCard
                                            id={product.id}
                                            name={product.name}
                                            category={product.category?.name || 'Non catégorisé'}
                                            stock={getStockStatus(product.available_quantity, product.needs_restock)}
                                            stockQuantity={product.available_quantity}
                                            image={getProductImageUrl(product.main_image)}
                                            description={product.short_description || product.description || ''}
                                            onViewDetails={() => handleViewDetails(product.id)}
                                            buttonType="cart"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && !error && products.length === 0 && (
                            <div className="text-center py-12">
                                <div className="bg-white rounded-lg border border-stone-200 p-8">
                                    <Filter className="h-12 w-12 text-stone-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-stone-900 mb-2">
                                        Aucun produit trouvé
                                    </h3>
                                    <p className="text-stone-600 mb-4">
                                        Aucun produit ne correspond à vos critères de filtre.
                                    </p>
                                    <button
                                        onClick={resetAllFilters}
                                        className="bg-amber-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors"
                                    >
                                        Réinitialiser les filtres
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Load More */}
                        {!loading && !error && products.length > 0 && totalProducts > (currentPage * pageSize) && (
                            <div className="text-center mt-12 animate-fade-in">
                                <button
                                    onClick={handleLoadMore}
                                    className="bg-white text-stone-800 px-8 py-3 rounded-xl font-medium border border-stone-300 hover:border-amber-600 hover:bg-stone-50 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 transform"
                                >
                                    Charger plus de produits
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}