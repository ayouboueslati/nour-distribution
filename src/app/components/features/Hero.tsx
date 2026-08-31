'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';

const Hero = () => {
  return (
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

      {/* Content overlay — minimal text, bottom-left anchored */}
      <div className="relative z-10 h-full min-h-[85vh] sm:min-h-[90vh] flex items-end">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-24">
          <div className="max-w-xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-5 border border-white/20 shadow-lg">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Distribution Professionnelle
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-[1.1] tracking-tight">
              Cheveux de Tresse
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent animate-gradient">
                Africaine
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/80 mb-8 font-medium leading-relaxed">
              Qualité premium B2B & B2C — service d&apos;excellence.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a
                href="#products"
                className="group relative overflow-hidden bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 sm:px-10 py-4 rounded-xl font-bold hover:from-amber-500 hover:to-orange-500 transition-all duration-300 inline-flex items-center justify-center text-sm sm:text-base shadow-xl hover:shadow-amber-500/30 hover:scale-105 transform"
              >
                <span className="relative z-10 flex items-center">
                  Voir le Catalogue
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </a>

              <a
                href="#contact"
                className="bg-white/10 backdrop-blur-md text-white px-8 sm:px-10 py-4 rounded-xl font-bold border border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-105 transform inline-flex items-center justify-center"
              >
                Demande B2B
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge — top right */}
      <div className="absolute top-6 right-6 sm:top-10 sm:right-10 z-20 bg-gradient-to-br from-amber-500/90 to-orange-600/90 backdrop-blur-sm text-white px-5 py-3 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-300 hover:scale-105 animate-bounce-subtle">
        <div className="text-xs font-semibold uppercase tracking-wide opacity-90">Nouveau</div>
        <div className="text-lg sm:text-xl font-bold">Collection 2025</div>
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

        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;