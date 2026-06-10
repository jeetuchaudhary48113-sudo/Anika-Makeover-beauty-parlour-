/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Eye, ShieldCheck, Heart, Award, CheckCircle2 } from 'lucide-react';
import { Owner } from '../types';

interface AboutAndOwnerProps {
  owner: Owner;
}

export const AboutAndOwner: React.FC<AboutAndOwnerProps> = ({ owner }) => {
  const pillars = [
    {
      icon: <Award className="text-amber-500 w-5 h-5 shrink-0" />,
      title: "12+ Years High-End Expertise",
      desc: "Menka has trained with industry-leading artists to deliver pixel-perfect makeover finishes."
    },
    {
      icon: <ShieldCheck className="text-amber-500 w-5 h-5 shrink-0" />,
      title: "100% Imported Skin-Safe Products",
      desc: "We exclusively utilize high-end, clinically safe skin brands and hypoallergenic HD makeup options."
    },
    {
      icon: <Heart className="text-amber-500 w-5 h-5 shrink-0" />,
      title: "Bespoke Consulting Tailoring",
      desc: "Every makeover begins with structural profile planning to align with your personal features and aesthetics."
    }
  ];

  const whyChooseUs = [
    "Expert Stylists and Certified Professionals",
    "Punctual Classy Session Timing",
    "Extremely Hygienic and Sanitized Premium Tools",
    "Soothing Luxury Ambient Backdrops",
  ];

  return (
    <section id="about" className="bg-neutral-900 border-b border-neutral-900 text-neutral-100 py-20 sm:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* About Salon Story Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-xs uppercase tracking-widest">
              <span>The Salon Story</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-100 tracking-tight">
              Anika Makeover Salon <br/>
              <span className="text-amber-500/90 font-sans font-light text-2xl sm:text-3xl block mt-2">
                Elevating Self-Care To Fine Art
              </span>
            </h2>

            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed font-light">
              Founded under the creative guidance of director Menka Singh, we have built a beautiful, tranquil sanctuary in the heart of Gorakhpur (Budh Vihar near Taramandal). Our luxury salon is configured specifically for individuals who value flawless beauty treatments and holistic, organic wellness.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800">
                <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-sm">
                  <Eye size={16} />
                  <span>Our Vision</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  To remain Gorakhpur's premier boutique styling sanctuary by integrating advanced global technologies with personalized, safe cosmetics care in 2026.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800">
                <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-sm">
                  <ShieldCheck size={16} />
                  <span>Our Mission</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  To build empowering beauty profiles through highly customizable treatments, extreme procedural hygiene, and luxury hospitality.
                </p>
              </div>
            </div>

            {/* Why Choose Us checklist */}
            <div className="pt-4 space-y-3">
              <h4 className="text-neutral-200 font-medium text-sm tracking-wider uppercase">
                Why Clients Prefer Us
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {whyChooseUs.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-neutral-400">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Core Brand Pillars Grid Side */}
          <div className="space-y-6">
            <h3 className="text-xl font-serif text-amber-500/90 tracking-wider uppercase mb-2">
              Our Professional Standards
            </h3>
            <div className="space-y-4">
              {pillars.map((p, idx) => (
                <div 
                  key={idx} 
                  className="p-5 rounded-2xl bg-neutral-950/40 border border-neutral-800/60 hover:bg-neutral-950 hover:border-neutral-700/50 transition-all duration-300 flex gap-4"
                >
                  <div className="p-2.5 bg-amber-500/10 rounded-xl h-fit">
                    {p.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-200 text-sm sm:text-base mb-1">
                      {p.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-light">
                      {p.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Dedicated Owner Spotlight Card Block */}
        <div className="mt-20 border border-neutral-800/80 rounded-3xl bg-neutral-950 p-6 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Owner Image Layout */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full p-1.5 border-2 border-dashed border-amber-500/40 overflow-hidden shadow-2xl">
                <img 
                  src={owner.photo} 
                  alt={owner.name} 
                  className="w-full h-full object-cover object-center rounded-full saturate-[1.05] hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="mt-4 text-center">
                <h3 className="font-serif font-bold text-lg sm:text-xl text-neutral-100 tracking-wide">
                  {owner.name}
                </h3>
                <span className="text-[10px] sm:text-xs font-semibold text-amber-500 uppercase tracking-widest mt-1 block">
                  {owner.experience}
                </span>
              </div>
            </div>

            {/* Owner Biography & Personal Message */}
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex px-2.5 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/10 text-amber-400 text-[10px] uppercase tracking-widest font-semibold">
                Salon Director Message
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-serif font-italic text-neutral-100 italic tracking-tight font-light leading-snug">
                &ldquo;{owner.message}&rdquo;
              </h3>

              <div className="h-[1px] bg-neutral-800 w-full" />

              <div>
                <h4 className="text-xs uppercase font-semibold text-neutral-400 tracking-wider mb-2">
                  Professional Biography
                </h4>
                <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed font-light select-text">
                  {owner.biography}
                </p>
              </div>

              {/* Dynamic verified signature styling */}
              <div className="flex items-center gap-2 pt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] uppercase font-mono text-neutral-500 tracking-widest">
                  Licensed High-End Cosmetology & Makeup Expert (Govt. Regd.)
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
