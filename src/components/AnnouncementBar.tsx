/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Phone, Clock, MessageCircle } from 'lucide-react';
import { Settings, Contact } from '../types';

interface AnnouncementBarProps {
  settings: Settings;
  contact: Contact;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ settings, contact }) => {
  if (!settings.announcementVisible) return null;

  return (
    <div className="bg-neutral-950 text-neutral-300 py-2 px-4 border-b border-neutral-800 text-xs tracking-wider transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
        {/* Animated text slider */}
        <div className="flex items-center gap-2 overflow-hidden w-full md:w-auto">
          <div className="animate-pulse inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          <p className="font-medium text-amber-100 text-center md:text-left truncate">
            {settings.announcement}
          </p>
        </div>

        {/* Quick details */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-neutral-400">
          <a 
            href={`tel:${contact.phone}`} 
            className="flex items-center gap-1.5 hover:text-white transition-colors duration-200"
          >
            <Phone size={13} className="text-amber-500/80" />
            <span>{contact.phone}</span>
          </a>
          <a 
            href={`https://wa.me/${contact.whatsapp.replace('+', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors duration-200"
          >
            <MessageCircle size={13} className="text-emerald-500" />
            <span>WhatsApp Quick Booking</span>
          </a>
          <div className="hidden sm:flex items-center gap-1.5">
            <Clock size={13} className="text-amber-500/80" />
            <span className="truncate max-w-[200px] md:max-w-none">{settings.businessHours}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
