/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Phone, MapPin, Navigation, MessageCircle, Clock, Sparkles } from 'lucide-react';
import { Contact, Settings } from '../types';

interface ContactMapProps {
  contact: Contact;
  settings: Settings;
}

export const ContactMap: React.FC<ContactMapProps> = ({ contact, settings }) => {
  return (
    <section id="contact" className="bg-neutral-950 text-neutral-100 py-20 sm:py-24 overflow-hidden border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-xs uppercase tracking-widest mb-3">
            <MapPin size={12} />
            <span>Find Us on Map</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight text-neutral-100">
            Visit Anika Makeover Sanctuary
          </h2>
          <div className="w-16 h-[2.5px] bg-amber-500 mx-auto mt-4" />
          <p className="mt-4 text-neutral-400 text-sm sm:text-base max-w-xl mx-auto font-light">
            Conveniently situated near the high-end Taramandal district of Gorakhpur with spacious reserved elite parking.
          </p>
        </div>

        {/* Contact info detail column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Info Details Boxes column */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Box 1: Geolocation Address details */}
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl flex gap-4 hover:border-neutral-750 transition-all">
              <div className="p-3 bg-amber-500/10 rounded-xl h-fit text-amber-500">
                <MapPin size={22} />
              </div>
              <div>
                <h4 className="text-neutral-350 font-semibold text-sm tracking-wide mb-1 select-none">
                  Boulevard Address
                </h4>
                <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed select-text">
                  {contact.address}
                </p>
              </div>
            </div>

            {/* Box 2: Contact Numbers */}
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl flex gap-4 hover:border-neutral-750 transition-all">
              <div className="p-3 bg-amber-500/10 rounded-xl h-fit text-amber-500">
                <Phone size={22} />
              </div>
              <div>
                <h4 className="text-neutral-350 font-semibold text-sm tracking-wide mb-1 select-none">
                  Instant Reservations Phone
                </h4>
                <div className="space-y-1">
                  <a 
                    href={`tel:${contact.phone}`} 
                    className="block text-amber-400 hover:text-amber-300 font-mono font-bold text-sm sm:text-base transition-colors"
                  >
                    {contact.phone}
                  </a>
                  <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
                    TAP NUMBER TO DIAL DIRECTLY
                  </p>
                </div>
              </div>
            </div>

            {/* Box 3: WhatsApp details */}
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl flex gap-4 hover:border-neutral-750 transition-all">
              <div className="p-3 bg-emerald-500/10 rounded-xl h-fit text-emerald-400">
                <MessageCircle size={22} />
              </div>
              <div>
                <h4 className="text-neutral-350 font-semibold text-sm tracking-wide mb-1 select-none">
                  WhatsApp Support Concierge
                </h4>
                <a 
                  href={`https://wa.me/${contact.whatsapp.replace('+', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-neutral-100 hover:text-emerald-400 font-mono font-semibold text-sm transition-colors block"
                >
                  {contact.whatsapp} (Direct Chat)
                </a>
              </div>
            </div>

            {/* Box 4: Calendar Hours */}
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl flex gap-4 hover:border-neutral-750 transition-all">
              <div className="p-3 bg-amber-500/10 rounded-xl h-fit text-amber-500">
                <Clock size={22} />
              </div>
              <div>
                <h4 className="text-neutral-350 font-semibold text-sm tracking-wide mb-1 select-none">
                  Business Working Hours
                </h4>
                <p className="text-neutral-300 text-xs sm:text-sm select-text">
                  {settings.businessHours}
                </p>
              </div>
            </div>

            {/* Premium Directions Button trigger */}
            <div className="pt-2 select-none">
              <a
                href={contact.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-semibold tracking-wider uppercase rounded-xl hover:from-amber-400 hover:to-amber-500 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-950/20"
              >
                <Navigation size={16} className="animate-pulse" />
                <span>Get G-Maps Directions Now</span>
              </a>
            </div>

          </div>

          {/* Luxury embedded Google map iframe block */}
          <div className="lg:col-span-7 h-96 lg:h-[480px] rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl relative select-none">
            {/* Embedded Google Maps locator iframe focused on Taramandal Gorakhpur Area */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3563.859239857245!2d83.3934335!3d26.716942!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399141be3ec30931%3A0xe7ff8e69ee8dfecf!2sTaramandal%2C%20Gorakhpur%2C%20Uttar%20Pradesh%20273010!5e0!3m2!1sen!2sin!4v1717834592818!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) contrast(110%) brightness(95%) opacity(0.85)" }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Anika Makeover Salon Location"
            />
          </div>

        </div>

      </div>
    </section>
  );
};
