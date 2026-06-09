/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { ArrowLeft, CheckCircle, Clock, Calendar, ShieldCheck, Heart, Sparkles, IndianRupee } from 'lucide-react';
import { Service } from '../types';

interface ServiceDetailPageProps {
  service: Service;
  onBack: () => void;
  onBook: (serviceId: string) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({ service, onBack, onBook }) => {
  // Ensure we scroll to top of page on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [service.id]);

  const benefitList = service.benefits ? service.benefits.split(',').map(b => b.trim()) : [];

  return (
    <div className="bg-neutral-950 text-neutral-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation Breadcrumb Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 mb-8 text-neutral-400 hover:text-amber-400 font-medium text-sm transition-colors duration-200 cursor-pointer group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Salon Menu</span>
        </button>

        {/* Master Details Panel split column layout */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Top/Left Column Image */}
            <div className="lg:col-span-5 h-80 sm:h-96 lg:h-full min-h-[300px] relative select-none">
              <img 
                src={service.image} 
                alt={service.name} 
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent lg:bg-gradient-to-l lg:from-neutral-900 lg:to-transparent" />
            </div>

            {/* Right Column Specifications details */}
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 space-y-6 flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Badge Category */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs uppercase tracking-widest">
                  <Sparkles size={11} className="animate-pulse" />
                  <span>{service.category} Collection</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-100 tracking-tight leading-tight select-text">
                  {service.name}
                </h1>

                <p className="text-amber-500 font-sans font-medium text-sm sm:text-base tracking-wide select-text">
                  ✨ {service.subtitle}
                </p>

                <p className="text-neutral-400 text-sm sm:text-base leading-relaxed font-light pt-2 select-text">
                  {service.description}
                </p>

                {/* Sub Benefits Checklist */}
                {benefitList.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-neutral-800/80">
                    <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-bold">
                      Key Treatment Benefits
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {benefitList.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-neutral-300">
                          <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Info / Control and Price metrics */}
              <div className="pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
                <div className="space-y-1">
                  <span className="text-neutral-500 text-xs uppercase font-semibold">Treatment Cost</span>
                  <div className="flex items-center gap-1.5 font-serif font-bold text-2xl sm:text-3xl text-amber-500">
                    <IndianRupee size={22} />
                    <span>{service.price}</span>
                    <span className="text-xs font-sans text-neutral-400 font-normal tracking-normal ml-1">
                      (All taxes included)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-neutral-400 font-mono pt-1">
                    <Clock size={11} className="text-neutral-500" />
                    <span>Duration Target: {service.duration}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => onBook(service.id)}
                    className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-semibold tracking-wider uppercase rounded-xl hover:from-amber-400 hover:to-amber-500 shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calendar size={16} />
                    <span>Book Selected Service</span>
                  </button>
                  <span className="text-[10px] text-neutral-500 text-center font-mono uppercase tracking-widest">
                    Easy Multi-channel Bookings
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Safety Guidelines below details */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 bg-neutral-900/40 rounded-2xl border border-neutral-800 flex gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl h-fit">
              <ShieldCheck className="text-amber-500" size={18} />
            </div>
            <div>
              <h4 className="text-neutral-200 font-semibold text-sm mb-1">Pristine Hygiene Protocol</h4>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                All combs, needles, scissor blades, and brushes undergo complete autoclave heat sanitization procedures before touching skin.
              </p>
            </div>
          </div>

          <div className="p-6 bg-neutral-900/40 rounded-2xl border border-neutral-800 flex gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl h-fit">
              <Heart className="text-amber-500" size={18} />
            </div>
            <div>
              <h4 className="text-neutral-200 font-semibold text-sm mb-1">Our Comfort Commitment</h4>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Need extra cooling, relaxing herbal tea, or audio controls adjusted? Feel totally welcome to inform your aesthetic specialist.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
