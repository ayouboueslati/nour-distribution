'use client';

import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

const Hero = () => {
  return (
    <section className="relative bg-linear-to-br from-stone-50 via-neutral-50 to-stone-100 py-12 sm:py-16 md:py-20 lg:py-28 overflow-hidden">
      {/* Animated background elements with enhanced parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-stone-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-neutral-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-stone-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center">

          {/* Left Content */}
          <div className="order-2 md:order-1 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 glass-dark text-white px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Sparkles className="w-4 h-4 animate-pulse-subtle" />
              Distribution Professionnelle
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-stone-900 mb-4 sm:mb-6 leading-tight">
              Cheveux de Tresse
              <br />
              <span className="bg-linear-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent animate-gradient">
                Africaine
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-stone-700 mb-6 sm:mb-8 max-w-xl leading-relaxed font-medium">
              Qualité professionnelle premium pour vos besoins B2B et B2C.
              Solutions sur mesure avec service personnalisé d'excellence.
            </p>

            {/* Feature highlights */}
            <div className="flex flex-col gap-3 mb-6 sm:mb-8">
              <div className="flex items-center gap-2 text-stone-700">
                <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-sm sm:text-base font-medium">Qualité supérieure garantie</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700">
                <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-sm sm:text-base font-medium">Livraison rapide et fiable</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700">
                <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-sm sm:text-base font-medium">Prix compétitifs pour professionnels</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a
                href="#products"
                className="group relative overflow-hidden bg-linear-to-r from-amber-600 to-orange-600 text-white px-8 sm:px-10 py-4 rounded-xl font-bold hover:from-amber-700 hover:to-orange-700 transition-all duration-300 inline-flex items-center justify-center text-sm sm:text-base shadow-lg hover:shadow-2xl hover:scale-105 transform"
              >
                <span className="relative z-10 flex items-center">
                  Voir le Catalogue
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </a>

              <a
                href="#contact"
                className="glass bg-white/90 text-stone-800 px-8 sm:px-10 py-4 rounded-xl font-bold border-2 border-stone-200 hover:border-amber-600 hover:bg-white transition-all duration-300 text-sm sm:text-base shadow-md hover:shadow-lg hover:scale-105 transform inline-flex items-center justify-center"
              >
                Demande B2B
              </a>
            </div>

            {/* Trust indicator */}
            <div className="mt-8 sm:mt-10 flex items-center gap-6 text-sm text-stone-600 animate-fade-in-up delay-300">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-amber-400 to-orange-500 border-2 border-white shadow-md hover:scale-110 transition-transform"></div>
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-400 to-red-500 border-2 border-white shadow-md hover:scale-110 transition-transform"></div>
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-amber-500 to-yellow-600 border-2 border-white shadow-md hover:scale-110 transition-transform"></div>
                </div>
                <span className="font-semibold">500+ clients satisfaits</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative order-1 md:order-2 animate-fade-in-right">
            <div className="relative h-80 sm:h-[400px] md:h-[450px] lg:h-[550px] rounded-2xl sm:rounded-3xl overflow-hidden bg-linear-to-br from-amber-100 to-orange-100 shadow-2xl group">
              {/* Replace this with your actual product image */}
              <Image
                src="/images/hro.jpg" // Change this path to your actual image
                alt="Cheveux de tresse africaine - Nour Distribution"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                priority // Important for above-the-fold images
                sizes="(max-width: 768px) 100vw, 50vw"
                placeholder="blur" // Optional: add blur placeholder
                blurDataURL="data:image/jpeg;base64,..." // Add if using placeholder
              />

              {/* Fallback in case image doesn't load */}
              <div className="absolute inset-0 bg-linear-to-br from-amber-200 via-orange-200 to-stone-300 flex items-center justify-center md:hidden">
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-amber-600" />
                  </div>
                  <p className="text-stone-600 font-semibold text-sm">Image du produit</p>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-stone-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Floating badge with enhanced glassmorphism */}
            <div className="absolute -top-4 -right-4 glass-dark bg-linear-to-br from-amber-500/90 to-orange-600/90 text-white px-6 py-3 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-300 hover:scale-105 animate-bounce-subtle">
              <div className="text-xs font-semibold uppercase tracking-wide">Nouveau</div>
              <div className="text-xl font-bold">Collection 2025</div>
            </div>

            {/* Decorative elements */}
            <div className="hidden sm:block absolute -bottom-6 -left-6 w-32 h-32 bg-linear-to-br from-amber-600 to-orange-600 rounded-3xl -z-10 transform rotate-12 shadow-xl"></div>
            <div className="hidden lg:block absolute -top-6 -right-6 w-24 h-24 bg-linear-to-br from-orange-500 to-red-500 rounded-2xl -z-10 transform -rotate-12 opacity-50"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

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

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out 0.2s backwards;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;