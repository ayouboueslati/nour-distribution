'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Shield, Truck, Lock } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, clearCart, totalItems } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal > 200 ? 0 : 25;
  const tax = subtotal * 0.1;
  const total = subtotal + shippingFee + tax;

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      alert('Commande soumise avec succès! Notre équipe vous contactera pour finaliser les prix.');
      setIsCheckingOut(false);
      clearCart();
    }, 2000);
  };
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        {/* Header */}
        <section className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-light text-stone-900 mb-4">
                Mon <span className="font-semibold">Panier</span>
              </h1>
            </div>
          </div>
        </section>

        {/* Empty Cart */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-6 bg-stone-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-stone-400" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              Votre panier est vide
            </h2>
            <p className="text-stone-600 mb-8 max-w-md mx-auto">
              Découvrez nos produits de qualité et ajoutez-les à votre panier pour passer commande.
            </p>
            <Link
              href="/products"
              className="bg-stone-800 text-white px-8 py-4 rounded-xl font-bold hover:bg-stone-900 transition-all duration-300 inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Découvrir nos produits
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-light text-stone-900 mb-4">
              Mon <span className="font-semibold">Panier</span>
            </h1>
            <p className="text-lg text-stone-600">
              Vérifiez vos articles avant de soumettre votre commande
            </p>
          </div>
        </div>
      </section>

      {/* Cart Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm">
              {/* Cart Header */}
              <div className="p-6 border-b border-stone-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-stone-900">
                    Articles dans votre panier ({totalItems})
                  </h2>
                  <Link
                    href="/products"
                    className="text-stone-600 hover:text-stone-900 transition-colors inline-flex items-center gap-2 text-sm font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Continuer mes achats
                  </Link>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-stone-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="shrink-0">
                        <div className="w-24 h-24 bg-stone-100 rounded-lg overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-stone-900 mb-1">
                              {item.name}
                            </h3>
                            <p className="text-sm text-stone-600 mb-2">
                              {item.category}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-stone-500">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              En stock ({item.stock} disponibles)
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 flex items-center justify-center rounded-md text-stone-600 hover:bg-white hover:text-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              
                              <span className="w-12 text-center text-stone-900 font-medium">
                                {item.quantity}
                              </span>
                              
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                                className="w-8 h-8 flex items-center justify-center rounded-md text-stone-600 hover:bg-white hover:text-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                              aria-label="Supprimer l'article"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Features */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center">
                <Truck className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <h4 className="font-semibold text-stone-900 mb-1">Livraison Rapide</h4>
                <p className="text-sm text-stone-600">Expédition sous 24-48h</p>
              </div>
              <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center">
                <Shield className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <h4 className="font-semibold text-stone-900 mb-1">Paiement Sécurisé</h4>
                <p className="text-sm text-stone-600">Transaction 100% sécurisée</p>
              </div>
              <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center">
                <Lock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <h4 className="font-semibold text-stone-900 mb-1">Confidentialité</h4>
                <p className="text-sm text-stone-600">Données protégées</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm sticky top-8">
              <div className="p-6 border-b border-stone-200">
                <h2 className="text-xl font-bold text-stone-900">
                  Résumé de la commande
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Order Details */}
                <div className="space-y-3">
                  <div className="flex justify-between text-stone-600">
                    <span>Articles ({totalItems})</span>
                    <span>Prix sur devis</span>
                  </div>
                  
                  <div className="flex justify-between text-stone-600">
                    <span>Frais d'expédition</span>
                    <span>{shippingFee === 0 ? 'Gratuit' : `${shippingFee}€`}</span>
                  </div>
                  
                  <div className="flex justify-between text-stone-600">
                    <span>Taxes</span>
                    <span>Incluses</span>
                  </div>

                  <div className="border-t border-stone-200 pt-3">
                    <div className="flex justify-between text-lg font-bold text-stone-900">
                      <span>Total estimé</span>
                      <span>Sur devis</span>
                    </div>
                  </div>
                </div>

                {/* Important Note */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900 text-sm mb-1">
                        Prix B2B Professionnels
                      </h4>
                      <p className="text-amber-800 text-xs">
                        Les prix définitifs seront confirmés par notre équipe après validation de votre commande. 
                        Vous recevrez un devis personnalisé sous 24h.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-stone-800 text-white py-4 rounded-xl font-bold hover:bg-stone-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Soumettre la commande
                    </>
                  )}
                </button>

                {/* Security Badge */}
                <div className="text-center">
                  <p className="text-xs text-stone-500 flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3" />
                    Commande 100% sécurisée
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 bg-stone-100 rounded-2xl p-6">
              <h3 className="font-semibold text-stone-900 mb-3">
                Comment ça marche ?
              </h3>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-stone-400 rounded-full"></div>
                  <span>Ajoutez vos produits au panier</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-stone-400 rounded-full"></div>
                  <span>Soumettez votre commande</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-stone-400 rounded-full"></div>
                  <span>Notre équipe vous contacte pour les prix</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-stone-400 rounded-full"></div>
                  <span>Recevez votre devis personnalisé</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-stone-400 rounded-full"></div>
                  <span>Livraison sous 24-48h après validation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}