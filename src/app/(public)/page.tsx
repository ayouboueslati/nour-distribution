'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, TrendingUp, Shield, Truck, Clock, Sparkles } from 'lucide-react';
import { apiService, getProductImageUrl } from '../lib/api';
import { Product } from '../../types';
import { Badge, Button, Card } from '../components/ui';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      // Mocking fetch or using real API if available
      // const response = await apiService.getProducts({ is_featured: true, limit: 4 });
      // setFeaturedProducts(response.products);

      // Fallback/Mock for now as getFeaturedProducts might not return what we expect immediately
      const response = await apiService.getProducts({ limit: 4 });
      if (response && response.products) {
        setFeaturedProducts(response.products);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] overflow-hidden">
        {/* Full-bleed background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hro.jpg"
            alt="Cheveux de tresse africaine - Nour Distribution"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Gradient overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/70 via-stone-900/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 via-transparent to-stone-900/20"></div>
        </div>

        {/* Floating badge — top right */}
        <div className="absolute top-6 right-6 sm:top-10 sm:right-10 z-20 bg-gradient-to-br from-amber-500/90 to-orange-600/90 backdrop-blur-sm text-white px-5 py-3 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-300 hover:scale-105">
          <div className="text-xs font-semibold uppercase tracking-wide opacity-90">Nouveau</div>
          <div className="text-lg sm:text-xl font-bold">Collection 2025</div>
        </div>

        {/* Soft gradient fade into the section below */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-stone-50 to-transparent pointer-events-none z-10"></div>

        {/* Content overlay — minimal text, bottom-left anchored */}
        <div className="relative z-10 h-full min-h-[85vh] sm:min-h-[90vh] flex items-end">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28 lg:pb-32">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-5 border border-white/20 shadow-lg">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Distribution Professionnelle
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-[1.1] tracking-tight">
                Cheveux de Tresse
                <br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                  Africaine
                </span>
              </h1>

              <p className="text-base sm:text-lg text-white/80 mb-8 font-medium leading-relaxed">
                Qualité premium B2B & B2C — service d&apos;excellence.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/products">
                  <Button size="lg" className="group bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl px-10 py-6 text-lg font-medium shadow-xl hover:shadow-amber-500/30 hover:from-amber-500 hover:to-orange-500 transition-all hover:scale-105">
                    Voir le Catalogue
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="ghost" className="bg-white/10 backdrop-blur-md text-white border border-white/30 hover:bg-white/20 hover:border-white/50 rounded-xl px-10 py-6 text-lg font-medium transition-all hover:scale-105">
                    Devenir Partenaire
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Trust Indicators */}
      <section className="py-24 bg-stone-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="relative flex flex-col items-center gap-6 p-8 md:p-10 rounded-3xl bg-white card-border-gradient shadow-luxury hover-lift transition-all duration-400 animate-fade-in-up delay-200">
              <div className="absolute inset-0 glow-corner pointer-events-none rounded-3xl"></div>
              <div className="w-16 h-16 rounded-2xl gradient-badge flex items-center justify-center relative z-10">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 relative z-10">Qualité Garantie</h3>
              <p className="text-stone-500 leading-relaxed relative z-10">Produits certifiés 100% naturels et testés rigoureusement.</p>
            </div>
            <div className="relative flex flex-col items-center gap-6 p-8 md:p-10 rounded-3xl bg-white card-border-gradient shadow-luxury hover-lift transition-all duration-400 animate-fade-in-up delay-300">
              <div className="absolute inset-0 glow-corner pointer-events-none rounded-3xl"></div>
              <div className="w-16 h-16 rounded-2xl gradient-badge flex items-center justify-center relative z-10">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 relative z-10">Livraison Express</h3>
              <p className="text-stone-500 leading-relaxed relative z-10">Expédition sous 24/48h partout en France et en Europe.</p>
            </div>
            <div className="relative flex flex-col items-center gap-6 p-8 md:p-10 rounded-3xl bg-white card-border-gradient shadow-luxury hover-lift transition-all duration-400 animate-fade-in-up delay-[400ms]">
              <div className="absolute inset-0 glow-corner pointer-events-none rounded-3xl"></div>
              <div className="w-16 h-16 rounded-2xl gradient-badge flex items-center justify-center relative z-10">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 relative z-10">Service Pro 24/7</h3>
              <p className="text-stone-500 leading-relaxed relative z-10">Une équipe dédiée pour accompagner les professionnels.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-stone-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-16 gap-6 text-center sm:text-left">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-3 tracking-tight">Produits Vedettes</h2>
            <p className="text-stone-500 text-lg">Nos meilleures ventes sélectionnées pour vous</p>
          </div>
          <Link href="/products" className="group flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700 transition-colors">
            Explorer le catalogue
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[400px] bg-white rounded-3xl animate-pulse shadow-sm border border-stone-100"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <Link href={`/products/${product.id}`} key={product.id} className="group animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <Card className="h-full relative overflow-hidden bg-white card-border-gradient shadow-luxury hover-lift transition-all duration-400 p-0 rounded-3xl border-none">
                  <div className="absolute inset-0 glow-corner pointer-events-none"></div>
                  <div className="aspect-[4/5] bg-stone-100 relative overflow-hidden m-2 rounded-2xl">
                    <img
                      src={getProductImageUrl(product.main_image)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    {product.is_new_arrival && (
                      <span className="absolute top-3 left-3 bg-stone-900/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                        Nouveau
                      </span>
                    )}
                  </div>
                  <div className="p-6 relative z-10">
                    <div className="text-xs text-amber-600 font-bold mb-2 uppercase tracking-widest">
                      {product.category?.name || 'Collection'}
                    </div>
                    <h3 className="text-lg font-semibold text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-stone-900 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/images/pattern.png')]"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">Prêt à transformer votre salon ?</h2>
          <p className="text-stone-400 text-xl mb-10">
            Rejoignez plus de 500 salons partenaires qui nous font confiance pour la qualité de leurs extensions.
            Accédez à des tarifs préférentiels et un support dédié.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white border-none rounded-full px-10 py-4 text-lg font-bold shadow-lg hover:shadow-amber-500/20 transition-all">
              Créer un Compte Pro
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
