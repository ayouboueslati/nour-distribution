'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, TrendingUp, Shield, Truck, Clock } from 'lucide-react';
import { apiService } from '../lib/api';
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
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-stone-900 text-white">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-stone-900/90"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <Badge variant="warning" className="bg-amber-500/20 text-amber-300 border-amber-500/30 backdrop-blur-md px-4 py-2">
            Nouvelle Collection 2024
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
            L'Excellence Capillaire <br />
            <span className="text-amber-500">Pour Professionnels</span>
          </h1>
          <p className="text-xl md:text-2xl text-stone-300 max-w-3xl mx-auto font-light leading-relaxed">
            Distributeur exclusif d'extensions et perruques de haute qualité.
            Fournisseur de confiance pour les salons de coiffure et professionnels de la beauté.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/products">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white border-none rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-amber-500/20 transition-all">
                Découvrir le Catalogue
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md rounded-full px-8 py-6 text-lg">
                Devenir Partenaire
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-stone-50 hover:bg-stone-100 transition-colors duration-300">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900">Qualité Garantie</h3>
              <p className="text-stone-600">Produits certifiés 100% naturels et testés rigoureusement.</p>
            </div>
            <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-stone-50 hover:bg-stone-100 transition-colors duration-300">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900">Livraison Express</h3>
              <p className="text-stone-600">Expédition sous 24/48h partout en France et en Europe.</p>
            </div>
            <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-stone-50 hover:bg-stone-100 transition-colors duration-300">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900">Service Pro 24/7</h3>
              <p className="text-stone-600">Une équipe dédiée pour accompagner les professionnels.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-2">Produits Vedettes</h2>
            <p className="text-stone-600">Nos meilleures ventes sélectionnées pour vous</p>
          </div>
          <Link href="/products" className="group flex items-center gap-2 text-amber-600 font-medium hover:text-amber-700 transition-colors">
            Tout voir
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-stone-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id} className="group">
                <Card className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden border-stone-200">
                  <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
                    <img
                      src={product.main_image || '/images/products/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.is_new_arrival && (
                      <span className="absolute top-2 left-2 bg-stone-900 text-white text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                        Nouveau
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-amber-600 font-medium mb-1 uppercase tracking-wider">
                      {product.category?.name || 'Collection'}
                    </div>
                    <h3 className="text-lg font-semibold text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-1">
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
