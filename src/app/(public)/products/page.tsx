'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Grid3X3, List, X } from 'lucide-react';
import ProductCard from '../../components/features/ProductCard';

// Mock data - replace with actual API data later
const products = [
    {
        id: 1,
        name: "Expression Braid Classic",
        category: "Synthétique Premium",
        description: "Cheveux synthétiques de haute qualité pour tresses professionnelles",
        stock: 150,
        image: "/images/products/expression-braid.jpg"
    },
    {
        id: 2,
        name: "X-Pression Ultra",
        category: "Haute Qualité",
        description: "Texture ultra-naturelle et résistance exceptionnelle",
        stock: 89,
        image: "/images/products/x-pression.jpg"
    },
    {
        id: 3,
        name: "Crochet Twist Natural",
        category: "Collection Naturelle",
        description: "Effet naturel parfait pour les twists et braids",
        stock: 200,
        image: "/images/products/crochet-twist.jpg"
    },
    {
        id: 4,
        name: "Kanekalon Jumbo Braid",
        category: "Format Jumbo",
        description: "Idéal pour les tresses épaisses et volumineuses",
        stock: 75,
        image: "/images/products/kanekalon-jumbo.jpg"
    },
    {
        id: 5,
        name: "Marley Twist Premium",
        category: "Texture Marley",
        description: "Texture bouclée naturelle pour un look authentique",
        stock: 120,
        image: "/images/products/marley-twist.jpg"
    },
    {
        id: 6,
        name: "Bohemian Locs",
        category: "Style Bohème",
        description: "Pour des locks légères et naturelles",
        stock: 95,
        image: "/images/products/bohemian-locs.jpg"
    }
];

const categories = [
    "Toutes les catégories",
    "Synthétique Premium",
    "Haute Qualité",
    "Collection Naturelle",
    "Format Jumbo",
    "Texture Marley",
    "Style Bohème"
];

export default function ProductsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [selectedCategory, setSelectedCategory] = useState<string>('Toutes les catégories');
    const [inStockOnly, setInStockOnly] = useState<boolean>(true);
    const [lowStockOnly, setLowStockOnly] = useState<boolean>(false);
    const [filteredProducts, setFilteredProducts] = useState(products);

    // Get category from URL parameter
    const urlCategory = searchParams.get('category');

    useEffect(() => {
        if (urlCategory) {
            setSelectedCategory(urlCategory);
        }
    }, [urlCategory]);

    useEffect(() => {
        let filtered = products;

        // Apply category filter
        if (selectedCategory !== 'Toutes les catégories') {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        // Apply stock filters
        if (inStockOnly) {
            filtered = filtered.filter(product => product.stock > 0);
        }
        if (lowStockOnly) {
            filtered = filtered.filter(product => product.stock > 0 && product.stock < 20);
        }

        setFilteredProducts(filtered);
    }, [selectedCategory, inStockOnly, lowStockOnly]);

    const handleViewDetails = (productId: number) => {
        console.log('Viewing product details:', productId);
        router.push(`/products/${productId}`);
    };

    const getStockStatus = (stock: number) => {
        if (stock === 0) return "Rupture de stock";
        if (stock < 20) return "Stock limité";
        return "En stock";
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        if (category === 'Toutes les catégories') {
            // Remove category from URL
            router.push('/products');
        } else {
            // Update URL with category
            router.push(`/products?category=${encodeURIComponent(category)}`);
        }
    };

    const clearCategoryFilter = () => {
        setSelectedCategory('Toutes les catégories');
        router.push('/products');
    };

    const resetAllFilters = () => {
        setSelectedCategory('Toutes les catégories');
        setInStockOnly(true);
        setLowStockOnly(false);
        router.push('/products');
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
                        {selectedCategory !== 'Toutes les catégories' && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <span className="text-amber-600 font-medium">
                                    Filtre actif: {selectedCategory}
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
                        <div className="bg-white rounded-lg border border-stone-200 p-6 sticky top-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-stone-900">Filtres</h3>
                                <Filter className="h-5 w-5 text-stone-500" />
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <h4 className="font-medium text-stone-900 mb-3">Catégories</h4>
                                <div className="space-y-2">
                                    {categories.map((category, index) => (
                                        <label key={index} className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="category"
                                                value={category}
                                                checked={selectedCategory === category}
                                                onChange={() => handleCategoryChange(category)}
                                                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300"
                                            />
                                            <span className="text-sm text-stone-700">{category}</span>
                                        </label>
                                    ))}
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
                                <span className="font-medium">{filteredProducts.length}</span> produits trouvés
                                {selectedCategory !== 'Toutes les catégories' && (
                                    <span className="text-amber-600 ml-2">
                                        dans {selectedCategory}
                                    </span>
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

                                {/* Sort */}
                                <select className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                                    <option>Trier par: Pertinence</option>
                                    <option>Nom: A à Z</option>
                                    <option>Nom: Z à A</option>
                                    <option>Stock: Élevé à faible</option>
                                    <option>Stock: Faible à élevé</option>
                                </select>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    name={product.name}
                                    category={product.category}
                                    stock={getStockStatus(product.stock)}
                                    stockQuantity={product.stock}
                                    image={product.image}
                                    description={product.description}
                                    onViewDetails={handleViewDetails}
                                    buttonType="cart"
                                />
                            ))}
                        </div>

                        {/* Empty State */}
                        {filteredProducts.length === 0 && (
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
                        {filteredProducts.length > 0 && (
                            <div className="text-center mt-12">
                                <button className="bg-white text-stone-800 px-8 py-3 rounded-lg font-medium border border-stone-300 hover:border-amber-600 hover:bg-stone-50 transition-colors">
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