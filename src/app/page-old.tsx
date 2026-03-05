'use client';
import { useRouter } from 'next/navigation';
import Hero from './components/features/Hero';
import ProductCard from './components/features/ProductCard';
import Counter from './components/ui/Counter';
import { Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const handleExploreCategory = (category: string) => {
    // Navigate to products page with category filter
    router.push(`/products?category=${encodeURIComponent(category)}`);
  };

  const handleViewDetails = (productId: number) => {
    console.log('Viewing product details:', productId);
    router.push(`/products/${productId}`);
  };

  const handleViewAllProducts = () => {
    router.push('/products');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-stone-50 via-neutral-50 to-stone-100">
      <Hero />

      {/* Stats/Features Banner */}
      <section className="py-12 bg-stone-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA4IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-2">
                <Counter end={500} suffix="+" duration={2500} />
              </h3>
              <p className="text-stone-300 font-medium">Clients Professionnels</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-2">
                <Counter end={98} suffix="%" duration={1800} />
              </h3>
              <p className="text-stone-300 font-medium">Taux de Satisfaction</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-2">
                <Counter end={10} suffix="+" duration={1200} />
              </h3>
              <p className="text-stone-300 font-medium">Années d'Expérience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-stone-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-neutral-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-stone-800 text-white px-5 py-2 rounded-full text-sm font-semibold mb-6 shadow-md">
              <Sparkles className="w-4 h-4" />
              Produits Premium
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              Notre <span className="text-stone-700">Catalogue</span>
            </h2>
            <p className="text-stone-700 text-lg max-w-2xl mx-auto font-medium">
              Sélection de cheveux de tresse de qualité professionnelle pour tous vos projets
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProductCard
              id={1}
              name="Expression Braid Classic"
              category="Synthétique Premium"
              stock="En stock"
              stockQuantity={150}
              image="/images/Synthétique.jpg"
              description="Cheveux synthétiques de haute qualité pour tresses professionnelles"
              onExploreCategory={handleExploreCategory}
              onViewDetails={handleViewDetails}
              buttonType="explore" // New prop to control button behavior
            />
            <ProductCard
              id={2}
              name="X-Pression Ultra"
              category="Haute Qualité"
              stock="En stock"
              stockQuantity={89}
              image="/images/Haute Qualité.png"
              description="Texture ultra-naturelle et résistance exceptionnelle"
              onExploreCategory={handleExploreCategory}
              onViewDetails={handleViewDetails}
              buttonType="explore"
            />
            <ProductCard
              id={3}
              name="Crochet Twist Natural"
              category="Collection Naturelle"
              stock="En stock"
              stockQuantity={200}
              image="/images/Collection Naturelle.jfif"
              description="Effet naturel parfait pour les twists et braids"
              onExploreCategory={handleExploreCategory}
              onViewDetails={handleViewDetails}
              buttonType="explore"
            />
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <button
              onClick={handleViewAllProducts}
              className="group bg-stone-800 text-white px-10 py-4 rounded-xl font-bold hover:bg-stone-900 transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              Voir Tous les Produits
              <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}