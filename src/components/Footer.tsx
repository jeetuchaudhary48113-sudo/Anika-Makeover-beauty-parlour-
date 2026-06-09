/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Crown, Heart, Instagram, Phone, MessageSquare, Navigation, MapPin } from 'lucide-react';
import { Contact, Settings, SocialLinks } from '../types';

interface FooterProps {
  contact: Contact;
  settings: Settings;
  socialLinks: SocialLinks;
  onNavigate: (tab: 'home' | 'service-detail' | 'admin', targetId?: string) => void;
  visualBuilder?: any;
}

export const Footer: React.FC<FooterProps> = ({ contact, settings, socialLinks, onNavigate, visualBuilder }) => {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (hash: string) => {
    onNavigate('home');
    setTimeout(() => {
      const targetId = hash.startsWith('#') ? hash.slice(1) : hash;
      const element = document.getElementById(targetId) || document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <footer className="bg-neutral-950 text-neutral-400 py-16 border-t border-neutral-900 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          
          {/* Brand/Owner Introduction */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {visualBuilder?.globalSettings?.logoUrl ? (
                <img 
                  src={visualBuilder.globalSettings.logoUrl} 
                  alt="Footer Logo" 
                  className="w-8 h-8 object-contain rounded"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="bg-amber-500 p-1.5 rounded-lg">
                  <Crown className="text-neutral-950 w-4.5 h-4.5" />
                </div>
              )}
              <span className="font-serif font-semibold text-lg text-neutral-100 tracking-wide">
                {visualBuilder?.globalSettings?.websiteName || settings.websiteName}
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              {visualBuilder?.globalSettings?.footerText || "Premium salon styling sanctuary located in Gorakhpur. Dedicated to beautiful, verified HD bridals, airbrush makeover transformations, hair couture, and safe skin treatments."}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-neutral-500">2026 Online Booking Active</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h4 className="text-neutral-200 text-xs sm:text-sm font-bold tracking-wider uppercase">
              Quick Portals
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button onClick={() => handleLinkClick('#home')} className="hover:text-amber-400 transition-colors cursor-pointer text-left">
                  Home Showcase
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('#about')} className="hover:text-amber-400 transition-colors cursor-pointer text-left">
                  Our Story & Owner
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('#services')} className="hover:text-amber-400 transition-colors cursor-pointer text-left">
                  Services List
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('#gallery')} className="hover:text-amber-400 transition-colors cursor-pointer text-left">
                  Transformation Lookbook
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('#reviews')} className="hover:text-amber-400 transition-colors cursor-pointer text-left">
                  Guest Feedback
                </button>
              </li>
            </ul>
          </div>

          {/* Services Quick Category shortcuts */}
          <div className="space-y-4">
            <h4 className="text-neutral-200 text-xs sm:text-sm font-bold tracking-wider uppercase">
              Treatment Curation
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-400">
              <li>Hair Cuts & Coloring</li>
              <li>HD & Airbrush Bridal Makeups</li>
              <li>Keratin Recovery Therapy</li>
              <li>24K Gold Hydra Facials</li>
              <li>Manicure / Pedicure Spa</li>
              <li>Premium Rica Chocolate Wax</li>
            </ul>
          </div>

          {/* Direct Contact info and directions shortcuts */}
          <div className="space-y-4">
            <h4 className="text-neutral-200 text-xs sm:text-sm font-bold tracking-wider uppercase">
              Connect Details
            </h4>
            
            <div className="space-y-3.5 text-xs sm:text-sm text-neutral-400 select-text">
              <div className="flex gap-2 items-start">
                <MapPin size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed text-xs">{contact.address}</span>
              </div>

              <div className="flex gap-2 items-center">
                <Phone size={14} className="text-amber-500 shrink-0" />
                <a href={`tel:${contact.phone}`} className="hover:text-white font-mono">{contact.phone}</a>
              </div>

              <div className="flex gap-2 items-center">
                <MessageSquare size={14} className="text-emerald-500 shrink-0" />
                <a 
                  href={`https://wa.me/${contact.whatsapp.replace('+', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 font-mono transition-colors"
                >
                  {contact.whatsapp} (WhatsApp)
                </a>
              </div>
            </div>

            {/* Quick External Actions Icon Bar */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href={socialLinks.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Follow Instagram Profile"
                className="p-2 bg-neutral-900 border border-neutral-800 text-pink-500 hover:text-white hover:bg-pink-600 rounded-lg transition-colors"
              >
                <Instagram size={15} />
              </a>
              <a 
                href={contact.directionsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                title="Open Directions in G-Maps"
                className="p-2 bg-neutral-900 border border-neutral-800 text-amber-500 hover:text-neutral-950 hover:bg-amber-400 rounded-lg transition-colors"
              >
                <Navigation size={15} />
              </a>
            </div>

          </div>

        </div>

        {/* Bottom copyright and legal line */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>{visualBuilder?.globalSettings?.copyrightText || `© ${currentYear} ${settings.websiteName}. All rights reserved.`}</p>
          
          <div className="flex items-center gap-1">
            <span>Designed for 2026 aesthetics with</span>
            <Heart size={11} className="fill-amber-500 text-amber-500 inline" />
            <span>near Taramandal, Gorakhpur</span>
          </div>

          <button
            onClick={() => onNavigate('admin')}
            className="hover:text-neutral-300 font-semibold tracking-wider font-mono uppercase cursor-pointer"
          >
            System Panel Login &rarr;
          </button>
        </div>

      </div>
    </footer>
  );
};
