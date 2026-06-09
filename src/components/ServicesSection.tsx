/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Eye, Calendar, Sparkles, IndianRupee, Clock } from 'lucide-react';
import { Service } from '../types';

interface ServicesSectionProps {
  services: Service[];
  onSelectService: (serviceId: string) => void;
  onBookNow: (serviceId: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services, onSelectService, onBookNow }) => {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Hair' | 'Skin' | 'Makeup' | 'Wellness'>('All');

  const categories = ['All', 'Hair', 'Skin', 'Makeup', 'Wellness'] as const;

  const filteredServices = services.filter((s) => {
    if (activeCategory === 'All') return true;
    return s.category.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <section id="services" className="bg-neutral-950 text-neutral-100 py-20 sm:py-24 border-b border-neutral-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading Metadata */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-xs uppercase tracking-widest mb-3">
            <Sparkles size={12} className="text-amber-400" />
            <span>The Salon Menu</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight text-neutral-100">
            Premium Curated Treatment Services
          </h2>
          <div className="w-16 h-[2.5px] bg-amber-500 mx-auto mt-4" />
          <p className="mt-4 text-neutral-400 text-sm sm:text-base max-w-xl mx-auto font-light">
            Indulge in certified styling excellence with dynamic 2026 techniques and advanced nourishing ingredients.
          </p>
        </div>

        {/* Category Filters Tabs Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 sm:mb-16">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase border transition-all duration-300 pointer-events-auto cursor-pointer ${
                activeCategory === cat
                  ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-lg shadow-amber-500/10 scale-105'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dynamic Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.length === 0 ? (
            <div className="col-span-full py-16 text-center text-neutral-500">
              No premium treatments found in this collection.
            </div>
          ) : (
            filteredServices.map((service) => (
              <div 
                key={service.id}
                className="group relative bg-neutral-900 border border-neutral-800/80 rounded-2xl overflow-hidden hover:border-neutral-700/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Scaled Hover Showcase Image */}
                <div className="h-56 relative overflow-hidden select-none">
                  <img 
                    src={service.image} 
                    alt={service.name} 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Category Pill Tag Overlay */}
                  <span className="absolute top-4 left-4 inline-block px-3 py-1 bg-neutral-950/80 backdrop-blur-md rounded-full text-[10px] text-amber-400 font-semibold uppercase tracking-wider border border-neutral-800">
                    {service.category}
                  </span>
                  {/* Subtle shadows layer */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-neutral-900 to-transparent" />
                </div>

                {/* Card Content body */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif font-bold text-lg text-neutral-100 group-hover:text-amber-400 transition-colors duration-200">
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-0.5 font-mono font-semibold text-lg text-amber-500 shrink-0">
                        <IndianRupee size={15} />
                        <span>{service.price}</span>
                      </div>
                    </div>

                    <p className="text-xs text-amber-500/80 font-medium font-sans tracking-wide">
                      {service.subtitle}
                    </p>

                    <p className="text-neutral-400 text-xs sm:text-sm line-clamp-3 leading-relaxed font-light select-text">
                      {service.description}
                    </p>
                  </div>

                  {/* Specs footer bar */}
                  <div className="flex items-center gap-4 py-3 border-t border-b border-neutral-800/65 text-[11px] text-neutral-400 font-mono">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-amber-500" />
                      <span>{service.duration}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-neutral-700" />
                    <span className="truncate max-w-[150px]">{service.benefits.split(',')[0]}</span>
                  </div>

                  {/* Direct Action triggers row */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => onSelectService(service.id)}
                      className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 font-medium text-xs rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Learn More</span>
                    </button>

                    <button
                      onClick={() => onBookNow(service.id)}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs rounded-xl hover:scale-[1.03] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Calendar size={13} />
                      <span>Book Now</span>
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </section>
  );
};
