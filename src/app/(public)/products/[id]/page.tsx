'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Truck, Shield, Check, ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';
import { apiService, getProductImageUrl } from '../../../lib/api';
import { useCart } from '../../../context/CartContext';
import { Product } from '../../../../types';
import { Badge } from '../../../components/ui';

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { addToCart } = useCart();

    // Convert 'id' to string (handle array case)
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProduct(id);
        }
    }, [id]);

    const fetchProduct = async (productId: string) => {
        try {
            setLoading(true);
            const data = await apiService.getProduct(productId);
            setProduct(data);
            if (data.main_image) {
                setSelectedImage(data.main_image);
            }
        } catch (err: any) {
            console.error('Error fetching product:', err);
            setError('Impossible de charger les détails du produit.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;

        setIsAdding(true);
        addToCart({
            product_id: product.id,
            name: product.name,
            category: product.category?.name || 'Général',
            image: product.main_image || '/images/products/placeholder.jpg',
            stock: product.available_quantity,
            sku: product.sku
        }, quantity);

        // Simulate a small delay for feedback
        setTimeout(() => {
            setIsAdding(false);
        }, 500);
    };

    const handleQuantityChange = (delta: number) => {
        const newQty = quantity + delta;
        if (newQty >= 1 && product && newQty <= product.available_quantity) {
            setQuantity(newQty);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-stone-600">Chargement du produit...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-bold text-stone-900 mb-2">Produit introuvable</h2>
                    <p className="text-stone-600 mb-6">{error || "Ce produit n'existe pas ou a été retiré."}</p>
                    <Link
                        href="/products"
                        className="inline-flex items-center justify-center px-6 py-3 bg-stone-800 text-white rounded-xl hover:bg-stone-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour au catalogue
                    </Link>
                </div>
            </div>
        );
    }

    // Determine stock status
    const isOutOfStock = product.available_quantity === 0;
    const isLowStock = product.available_quantity > 0 && product.available_quantity < 20;

    return (
        <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumb / Back Navigation */}
                <nav className="mb-8 flex items-center gap-2 text-sm text-stone-600">
                    <Link href="/products" className="hover:text-amber-600 transition-colors flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" />
                        Catalogue
                    </Link>
                    <span className="text-stone-400">/</span>
                    <span className="text-stone-900 font-medium truncate max-w-[200px]">{product.name}</span>
                </nav>

                <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-stone-200">
                        {/* Image Gallery Section */}
                        <div className="p-8 lg:p-12 space-y-6 min-w-0">
                            <div className="aspect-square bg-stone-100 rounded-2xl overflow-hidden relative group">
                                <img
                                    src={selectedImage ? getProductImageUrl(selectedImage) : getProductImageUrl(product.main_image)}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {product.is_featured && (
                                    <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                                        Populaire
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {product.additional_images && product.additional_images.length > 0 && (
                                <div className="flex gap-4 overflow-x-auto pb-4 snap-x gallery-scroll">
                                    {/* Include main image as a thumbnail if not selected */}
                                    <button
                                        onClick={() => setSelectedImage(product.main_image || '')}
                                        className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${(selectedImage === product.main_image) || (!selectedImage && !product.main_image)
                                            ? 'border-amber-500 ring-2 ring-amber-500/20'
                                            : 'border-stone-200 hover:border-amber-300'
                                            }`}
                                    >
                                        <img
                                            src={getProductImageUrl(product.main_image)}
                                            alt="Main view"
                                            className="w-full h-full object-cover"
                                        />
                                    </button>

                                    {/* Additional images */}
                                    {product.additional_images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(img)}
                                            className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img
                                                ? 'border-amber-500 ring-2 ring-amber-500/20'
                                                : 'border-stone-200 hover:border-amber-300'
                                                }`}
                                        >
                                            <img
                                                src={getProductImageUrl(img)}
                                                alt={`View ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info Section */}
                        <div className="p-8 lg:p-12 flex flex-col">
                            <div className="flex-1">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <Badge variant="default" className="mb-3">
                                            {product.category?.name || 'Non catégorisé'}
                                        </Badge>
                                        <h1 className="text-3xl sm:text-4xl font-light text-stone-900 mb-2">
                                            {product.name}
                                        </h1>
                                        <div className="flex items-center gap-2 text-sm text-stone-500">
                                            <span>SKU: {product.sku}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Section */}
                                <div className="mb-8 p-4 bg-stone-50 rounded-xl border border-stone-100">
                                    <div className="flex items-end gap-2 mb-1">
                                        <span className="text-3xl font-bold text-stone-900">
                                            {/* Logic to show price only if logged in or B2B logic */}
                                            Sur Devis
                                        </span>
                                    </div>
                                    <p className="text-sm text-stone-500">
                                        Prix professionnel réservé aux membres connectés
                                    </p>
                                </div>

                                {/* Stock Status */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-3 h-3 rounded-full ${isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-green-500'
                                        }`}></div>
                                    <span className={`font-medium ${isOutOfStock ? 'text-red-700' : isLowStock ? 'text-amber-700' : 'text-green-700'
                                        }`}>
                                        {isOutOfStock ? 'Rupture de stock' : isLowStock ? `Stock limité (${product.available_quantity} restants)` : 'En stock'}
                                    </span>
                                </div>

                                {/* Description */}
                                <div className="prose prose-stone max-w-none mb-8">
                                    <h3 className="text-lg font-semibold text-stone-900 mb-2">Description</h3>
                                    <p className="text-stone-600 leading-relaxed">
                                        {product.description || "Aucune description disponible pour ce produit."}
                                    </p>
                                </div>

                                {/* Specifications (Mocked if generic) */}
                            </div>

                            {/* Actions Footer */}
                            <div className="mt-8 pt-8 border-t border-stone-200">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Quantity Selector */}
                                    <div className="flex items-center border border-stone-300 rounded-xl bg-white w-full sm:w-auto">
                                        <button
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1 || isOutOfStock}
                                            className="px-4 py-3 text-stone-600 hover:text-stone-900 disabled:opacity-30 transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="flex-1 w-12 text-center font-medium text-stone-900">{quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={quantity >= product.available_quantity || isOutOfStock}
                                            className="px-4 py-3 text-stone-600 hover:text-stone-900 disabled:opacity-30 transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Add to Cart Button */}
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isOutOfStock}
                                        className="flex-1 bg-stone-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                    >
                                        {isAdding ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Ajout...
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-5 h-5" />
                                                {isOutOfStock ? 'Indisponible' : 'Ajouter au panier'}
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Trust Badges */}
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="flex items-center gap-3 text-stone-600">
                                        <Truck className="w-5 h-5 text-amber-600" />
                                        <span className="text-sm">Livraison express 24/48h</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-stone-600">
                                        <Shield className="w-5 h-5 text-amber-600" />
                                        <span className="text-sm">Garantie qualité pro</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
