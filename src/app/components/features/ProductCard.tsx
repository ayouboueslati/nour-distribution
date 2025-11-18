'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Heart, Eye, Sparkles, Package, ArrowRight, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  id: number;
  name: string;
  category: string;
  stock?: string;
  stockQuantity?: number;
  image: string;
  description?: string;
  onViewDetails?: (productId: number) => void;
  onExploreCategory?: (category: string) => void;
  buttonType?: 'cart' | 'explore';
}

const ProductCard = ({ 
  id,
  name, 
  category, 
  stock = "En stock", 
  stockQuantity,
  image,
  description,
  onViewDetails,
  onExploreCategory,
  buttonType = 'cart'
}: ProductCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handlePrimaryAction = () => {
    if (buttonType === 'explore' && onExploreCategory) {
      onExploreCategory(category);
    } else if (buttonType === 'cart') {
      addToCart({
        id,
        name,
        category,
        price: 0, // You can add actual prices later
        image,
        stock: stockQuantity || 0,
      }, quantity);
      
      // Optional: Show success message
      alert(`${quantity} ${name} ajouté au panier!`);
      // Reset quantity after adding to cart
      setQuantity(1);
    }
  };

  const handleViewDetails = () => {
    onViewDetails?.(id);
  };

  const incrementQuantity = () => {
    if (stockQuantity && quantity < stockQuantity) {
      setQuantity(prev => prev + 1);
    } else if (!stockQuantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      if (stockQuantity && value <= stockQuantity) {
        setQuantity(value);
      } else if (!stockQuantity) {
        setQuantity(value);
      }
    }
  };

  const getButtonText = () => {
    if (buttonType === 'explore') {
      return "Explorer la Catégorie";
    }
    return stock === "Rupture de stock" ? "Rupture de stock" : "Ajouter au Panier";
  };

  const getButtonIcon = () => {
    if (buttonType === 'explore') {
      return <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />;
    }
    return <ShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300" />;
  };

  const maxQuantity = stockQuantity || 999;

  return (
    <div 
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-stone-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 bg-linear-to-br from-amber-200 via-orange-200 to-amber-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl -z-10 blur-sm"></div>
      
      {/* Product Image Container */}
      <div className="relative h-80 bg-linear-to-br from-stone-50 to-neutral-100 overflow-hidden">
        {/* Product Image with Next.js Optimization */}
        {!imageError && image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
            <Package className="h-16 w-16 text-stone-300" />
            <span className="sr-only">Image non disponible</span>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-linear-to-t from-stone-900/60 via-stone-900/20 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Quick Action Buttons */}
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-3 transition-all duration-300 ${
            isHovered ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}>
            <button 
              onClick={handleViewDetails}
              className="bg-white text-stone-800 p-3 rounded-full shadow-lg hover:bg-stone-100 transition-all duration-300 hover:scale-110 transform focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              aria-label={`Voir les détails de ${name}`}
            >
              <Eye className="w-5 h-5" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={`p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 transform focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                isLiked 
                  ? 'bg-red-500 text-white focus:ring-red-500' 
                  : 'bg-white text-stone-800 hover:bg-stone-100'
              }`}
              aria-label={isLiked ? `Retirer ${name} des favoris` : `Ajouter ${name} aux favoris`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stock Badge with Animation */}
        <div className="absolute top-4 right-4">
          <div className="relative">
            <span className={`bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold shadow-lg border inline-flex items-center gap-1.5 ${
              stock === "En stock" 
                ? "text-green-800 border-green-200" 
                : stock === "Stock limité"
                ? "text-amber-800 border-amber-200"
                : "text-red-800 border-red-200"
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                stock === "En stock" ? "bg-green-500" :
                stock === "Stock limité" ? "bg-amber-500" :
                "bg-red-500"
              }`}></span>
              {stock}
              {stockQuantity && (
                <span className="text-xs opacity-75 ml-1">
                  ({stockQuantity})
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Category Tag */}
        <div className="absolute top-4 left-4">
          <span className="bg-stone-800/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
            {category}
          </span>
        </div>

        {/* Decorative Corner Accent */}
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-linear-to-tl from-stone-800/10 to-transparent rounded-tl-full"></div>
      </div>
      
      {/* Product Info with Enhanced Styling */}
      <div className="p-6 bg-white relative">
        {/* Decorative Line */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-linear-to-r from-transparent via-stone-300 to-transparent rounded-full"></div>
        
        <div className="mb-4 mt-2">
          <h3 className="text-xl font-bold text-stone-900 mb-1 group-hover:text-stone-700 transition-colors line-clamp-1">
            {name}
          </h3>
          {description && (
            <p className="text-sm text-stone-600 mb-2 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
          <div className="flex items-center gap-2 text-stone-500 text-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-medium">Qualité Premium</span>
          </div>
        </div>

        {/* Features List */}
        <div className="mb-5 space-y-2">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <div className="w-1.5 h-1.5 bg-stone-400 rounded-full"></div>
            <span>Livraison rapide disponible</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <div className="w-1.5 h-1.5 bg-stone-400 rounded-full"></div>
            <span>Prix B2B compétitifs</span>
          </div>
        </div>

        {/* Quantity Selector - Only show for cart button type */}
        {buttonType === 'cart' && stock !== "Rupture de stock" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Quantité
            </label>
            <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-lg p-1">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-md text-stone-600 hover:bg-white hover:text-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Réduire la quantité"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <input
                type="number"
                min="1"
                max={maxQuantity}
                value={quantity}
                onChange={handleQuantityChange}
                className="w-12 text-center bg-transparent border-none focus:outline-none focus:ring-0 text-stone-900 font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-label="Quantité"
              />
              
              <button
                onClick={incrementQuantity}
                disabled={quantity >= maxQuantity}
                className="w-8 h-8 flex items-center justify-center rounded-md text-stone-600 hover:bg-white hover:text-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Augmenter la quantité"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {stockQuantity && (
              <p className="text-xs text-stone-500 mt-1 text-center">
                Maximum: {stockQuantity} unités
              </p>
            )}
          </div>
        )}
        
        {/* Primary Action Button */}
        <button 
          onClick={handlePrimaryAction}
          className="w-full bg-stone-800 text-white py-3.5 rounded-xl font-bold hover:bg-stone-900 transition-all duration-300 text-sm shadow-md hover:shadow-xl transform hover:scale-[1.02] group/btn flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={buttonType === 'cart' && stock === "Rupture de stock"}
          aria-label={buttonType === 'explore' ? `Explorer la catégorie ${category}` : `Ajouter ${quantity} ${name} au panier`}
        >
          {getButtonIcon()}
          {getButtonText()}
          {buttonType === 'cart' && stock !== "Rupture de stock" && (
            <span className="bg-white/20 px-2 py-1 rounded text-xs">
              {quantity}
            </span>
          )}
        </button>

        {/* Trust Badge */}
        <div className="mt-4 text-center">
          <span className="text-xs text-stone-500 font-medium inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Produit Vérifié
          </span>
        </div>
      </div>

      {/* Shine Effect on Hover */}
      <div className={`absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 transition-all duration-700 pointer-events-none ${
        isHovered ? 'translate-x-full' : '-translate-x-full'
      }`}></div>
    </div>
  );
};

export default ProductCard;