/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, MessageSquare, PhoneCall } from 'lucide-react';
import { Banners, Contact } from '../types';

interface HeroProps {
  banners: Banners;
  contact: Contact;
  onBookClick: () => void;
  onServicesClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ banners, contact, onBookClick, onServicesClick }) => {
  return (
    <section id="home" className="relative relative-view h-[85vh] sm:h-[90vh] md:h-[95vh] flex items-center justify-center overflow-hidden bg-neutral-950">
      
      {/* Impeccable Background Image with Subtle Parallax Zoom Style */}
      <div className="absolute inset-0 z-0">
        <img 
          src={banners.heroBgImage} 
          alt="Anika Makeover Studio Luxury Background" 
          className="w-full h-full object-cover opacity-35 object-center scale-105 animate-pulse-slow select-none"
        />
        {/* Double-layered luxurious shadow veneer gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-neutral-950 to-transparent" />
      </div>

      {/* Hero Content Containment */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center select-none">
        
        {/* Badge Intro */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs uppercase tracking-[0.25em] mb-6 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Gorakhpur's Premium Beauty Experience</span>
        </div>

        {/* Brand Masterpiece Headings */}
        <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-neutral-100 tracking-tight leading-[1.1] mb-6 select-text max-w-4xl">
          <span className="block">{banners.heroHeading}</span>
          <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-extralight text-amber-500/95 tracking-wide mt-3 select-text">
            {banners.heroSubheading}
          </span>
        </h1>

        {/* Short Explainer */}
        <p className="max-w-2xl text-neutral-400 text-sm sm:text-base md:text-lg mb-10 leading-relaxed font-light">
          Experience world-class hair, luxurious skin therapies, and mesmerizing custom bridal makeovers crafted in Gorakhpur by icon professional <strong>Anika Choudhary</strong>.
        </p>

        {/* Adaptive buttons row */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 w-full px-4">
          
          <button
            onClick={onBookClick}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-semibold tracking-wider uppercase rounded-full hover:from-amber-400 hover:to-amber-500 shadow-xl shadow-amber-500/10 hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Calendar size={18} />
            <span>Book Appointment</span>
          </button>

          <button
            onClick={onServicesClick}
            className="w-full sm:w-auto px-8 py-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white font-semibold tracking-wider uppercase rounded-full border border-neutral-800 hover:border-neutral-700 shadow-lg hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            Explore Services
          </button>

          <a
            href={`https://wa.me/${contact.whatsapp.replace('+', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold tracking-wider uppercase rounded-full shadow-lg hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2.5"
          >
            <MessageSquare size={18} />
            <span>WhatsApp Booking</span>
          </a>

          <a
            href={`tel:${contact.phone}`}
            className="w-full sm:w-auto px-6 py-4 text-neutral-300 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <PhoneCall size={16} className="text-amber-500" />
            <span>Call {contact.phone}</span>
          </a>
          
        </div>

      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Discover More</span>
        <div className="w-[1.5px] h-10 bg-gradient-to-b from-amber-500 to-transparent animate-bounce" />
      </div>

    </section>
  );
};
