/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, ArrowUpRight, Gift, Percent } from 'lucide-react';
import { Banners, Offer } from '../types';

interface PromotionalBannersProps {
  banners: Banners;
  offers: Offer[];
  onBookClick: () => void;
}

export const PromotionalBanners: React.FC<PromotionalBannersProps> = ({ banners, offers, onBookClick }) => {
  return (
    <section className="bg-neutral-950 text-neutral-100 py-16 sm:py-24 border-t border-b border-neutral-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-xs uppercase tracking-widest mb-3">
            <Sparkles size={12} className="animate-spin-slow" />
            <span>Seasonal Spotlights</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight text-neutral-100 mb-4">
            Exclusive Packages & Transforming Styles
          </h2>
          <div className="w-16 h-[2px] bg-amber-500 mx-auto" />
          <p className="mt-4 text-neutral-400 text-sm sm:text-base max-w-xl mx-auto font-light">
            Indulge in our limited-time premium curation. Beautiful, highly professional services bundled together for luxurious care.
          </p>
        </div>

        {/* Master Bento-style Promotional Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Card 1: Royal Bridal Transformation */}
          <div className="lg:col-span-12 xl:col-span-7 bg-neutral-900/60 rounded-3xl border border-neutral-800/80 p-6 sm:p-10 flex flex-col sm:flex-row gap-8 items-center justify-between hover:border-neutral-700/80 transition-all duration-300 group">
            <div className="flex-1 space-y-4">
              <span className="text-[10px] text-amber-400 font-semibold tracking-[0.2em] uppercase block">
                Exclusive Look Styling
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-100 tracking-tight group-hover:text-amber-400 transition-colors duration-200">
                {banners.promoBridalTitle}
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                {banners.promoBridalDesc}
              </p>
              <button 
                onClick={onBookClick}
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest hover:text-amber-300 group/btn transition-colors cursor-pointer"
              >
                <span>Reserve Your Look</span>
                <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </button>
            </div>
            <div className="w-full sm:w-48 md:w-56 h-48 rounded-2xl overflow-hidden shrink-0 shadow-lg">
              <img 
                src={banners.promoBridalImage} 
                alt="Bridal Makeup Premium Look" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Card 2: Hair Transformation Premium Focus */}
          <div className="lg:col-span-6 xl:col-span-5 bg-neutral-900/60 rounded-3xl border border-neutral-800/80 p-6 sm:p-8 flex flex-col justify-between hover:border-neutral-700/80 transition-all duration-300 group">
            <div className="w-full h-44 rounded-2xl overflow-hidden mb-6 shadow-lg">
              <img 
                src={banners.promoHairImage} 
                alt="Hair Styling Trends" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="space-y-3">
              <span className="text-[10px] text-amber-500 font-semibold tracking-[0.2em] uppercase block">
                Hair Couture
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-neutral-100 tracking-tight">
                {banners.promoHairTitle}
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                {banners.promoHairDesc}
              </p>
              <button
                onClick={onBookClick}
                className="pt-2 text-xs font-bold text-amber-400 uppercase tracking-wider hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer"
              >
                Book Keratin / Styling Now &rarr;
              </button>
            </div>
          </div>

          {/* Card 3: Premium Combo Beauty Packages */}
          <div className="lg:col-span-6 xl:col-span-5 bg-neutral-900/60 rounded-3xl border border-neutral-800/80 p-6 sm:p-8 flex flex-col justify-between hover:border-neutral-700/80 transition-all duration-300 group">
            <div className="w-full h-44 rounded-2xl overflow-hidden mb-6 shadow-lg">
              <img 
                src={banners.promoPackageImage} 
                alt="Skincare Package Facials" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="space-y-3">
              <span className="text-[10px] text-amber-500 font-semibold tracking-[0.2em] uppercase block">
                Luxury Pampering
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-neutral-100 tracking-tight">
                {banners.promoPackageTitle}
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                {banners.promoPackageDesc}
              </p>
              <button
                onClick={onBookClick}
                className="pt-2 text-xs font-bold text-amber-400 uppercase tracking-wider hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer"
              >
                Schedule Wellness Combo &rarr;
              </button>
            </div>
          </div>

          {/* Dynamic Active Offers & Discount Coupons Section */}
          <div className="lg:col-span-12 xl:col-span-7 bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-3xl border border-neutral-800/80 p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-neutral-400 pointer-events-none">
              <Gift size={200} />
            </div>

            <div className="relative z-10">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] uppercase tracking-widest font-semibold mb-4">
                <Percent size={10} />
                <span>Active Offers List</span>
              </span>
              
              <h3 className="text-2xl font-serif font-semibold mb-6">
                Redeem Promo Codes on Checkout
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {offers.map((offer) => (
                  <div 
                    key={offer.id} 
                    className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800/80 flex flex-col justify-between hover:bg-neutral-800/40 transition-all"
                  >
                    <div>
                      <h4 className="font-semibold text-neutral-200 text-base mb-1">{offer.title}</h4>
                      <p className="text-xs text-neutral-400 mb-4 leading-relaxed">{offer.description}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-800/55">
                      <div className="px-3 py-1 bg-amber-500/10 border border-dashed border-amber-500/35 rounded-lg text-amber-400 font-mono text-xs font-bold">
                        {offer.discountCode}
                      </div>
                      <span className="text-xs font-semibold text-emerald-400">Save {offer.discountPercentage}% Off</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
