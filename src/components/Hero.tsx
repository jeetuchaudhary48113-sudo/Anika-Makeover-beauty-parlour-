/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, MessageSquare, Instagram } from 'lucide-react';
import { HeroBanner, Contact, SocialLinks } from '../types';

interface HeroProps {
  heroBanner: HeroBanner;
  contact: Contact;
  socialLinks?: SocialLinks;
  onBookClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ heroBanner, contact, socialLinks, onBookClick }) => {
  const bgImage = heroBanner.heroBgImage || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80";

  return (
    <section id="home" className="relative w-full bg-neutral-950 text-neutral-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8 select-none">
      
      {/* Decorative ambient subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
        
        {/* Luxe Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs uppercase tracking-[0.2em] mb-6 font-sans">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>Gorakhpur's Premium Beauty Experience</span>
        </div>

        {/* Salon Name Label (Heading) */}
        <h1 className="font-serif font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-none text-neutral-100 uppercase mb-4">
          {heroBanner.heroHeading || "Anika Makeover Salon"}
        </h1>

        {/* Subheading / Subtitle */}
        <p className="text-amber-500 font-sans font-medium text-lg sm:text-xl md:text-2xl tracking-wide max-w-3xl mb-8">
          {heroBanner.heroSubheading || "Where Luxury Meets Beauty & Elegant Styling"}
        </p>

        {/* Brand Masterpiece Framed Image - GUARANTEES Full image visibility on all screen sizes, perfect scaling, no overlay/blur, no cropping/clipping */}
        <div className="relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900/50 p-2 sm:p-3 mb-10 shadow-2xl">
          <div className="relative rounded-2xl overflow-hidden bg-neutral-950 aspect-[16/9] sm:aspect-[21/9] flex items-center justify-center">
            {/* Ambient Blurred Background (optional backdrop, fallback style) */}
            <img 
              src={bgImage} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xl select-none"
              referrerPolicy="no-referrer"
            />
            {/* Real Full Image - Absolutely zero cropping, zero clipping, 100% visible on Mobile, Tablet & Desktop */}
            <img 
              src={bgImage} 
              alt="Menka Luxury Makeover Studio" 
              className="relative z-10 max-h-[30vh] sm:max-h-[40vh] md:max-h-[50vh] w-full h-full object-contain select-none transition-transform duration-700 hover:scale-[1.02]"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Short introduction paragraph */}
        <p className="max-w-2xl text-neutral-400 text-sm sm:text-base leading-relaxed mb-8 font-light">
          Experience world-class hair designs, luxurious skin therapies, and mesmerizing custom bridal makeovers crafted in Gorakhpur by master beauty professional <strong>Menka Singh</strong>.
        </p>

        {/* Hero Action Buttons - Replacing single button with exactly 3 premium action buttons */}
        <div id="hero-buttons-container" className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 w-full px-4 max-w-3xl">
          
          {/* Button 1: Book Appointment */}
          <button
            id="hero-btn-book"
            onClick={() => {
              const element = document.getElementById('booking') || document.getElementById('sec-booking');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
              onBookClick();
            }}
            className="w-full sm:w-auto min-w-[210px] px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold tracking-wider uppercase rounded-xl shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar size={18} />
            <span>{heroBanner.heroBtnAppointmentText || 'Book Appointment'}</span>
          </button>

          {/* Button 2: WhatsApp */}
          <a
            id="hero-btn-whatsapp"
            href={heroBanner.heroBtnWhatsAppLink || `https://wa.me/${contact.whatsapp.replace('+', '').replace(/\s/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-w-[210px] px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-wider uppercase rounded-xl shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare size={18} />
            <span>{heroBanner.heroBtnWhatsAppText || 'WhatsApp'}</span>
          </a>

          {/* Button 3: Instagram */}
          <a
            id="hero-btn-instagram"
            href={heroBanner.heroBtnInstagramLink || (socialLinks?.instagram || "https://instagram.com")}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-w-[210px] px-8 py-3.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 hover:text-white font-bold tracking-wider uppercase rounded-xl shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Instagram size={18} />
            <span>{heroBanner.heroBtnInstagramText || 'Instagram'}</span>
          </a>
          
        </div>

      </div>

    </section>
  );
};
