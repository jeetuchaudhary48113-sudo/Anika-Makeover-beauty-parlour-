/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar, Crown, Settings } from 'lucide-react';
import { Settings as SettingsType } from '../types';

interface HeaderProps {
  settings: SettingsType;
  currentTab: 'home' | 'service-detail' | 'admin';
  onChangeTab: (tab: 'home' | 'service-detail' | 'admin', serviceId?: string) => void;
  visualBuilder?: any;
}

export const Header: React.FC<HeaderProps> = ({ settings, currentTab, onChangeTab, visualBuilder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = visualBuilder?.globalSettings?.navMenu 
    ? visualBuilder.globalSettings.navMenu.map((m: any) => ({ label: m.label, href: m.link, tab: 'home' as const }))
    : [
        { label: 'Home', href: '#home', tab: 'home' as const },
        { label: 'About', href: '#about', tab: 'home' as const },
        { label: 'Services', href: '#services', tab: 'home' as const },
        { label: 'Gallery', href: '#gallery', tab: 'home' as const },
        { label: 'Reviews', href: '#reviews', tab: 'home' as const },
        { label: 'Contact', href: '#contact', tab: 'home' as const },
      ];

  const handleNavClick = (tab: 'home' | 'service-detail' | 'admin', href?: string) => {
    setIsOpen(false);
    onChangeTab(tab);
    
    if (tab === 'home' && href) {
      setTimeout(() => {
        const targetId = href.startsWith('#') ? href.slice(1) : href;
        const element = document.getElementById(targetId) || document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-neutral-900/90 backdrop-blur-md border-neutral-800 shadow-lg' 
          : 'bg-neutral-900 border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo / Title */}
          <div 
            onClick={() => handleNavClick('home', '#home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            {visualBuilder?.globalSettings?.logoUrl ? (
              <img 
                src={visualBuilder.globalSettings.logoUrl} 
                alt="Logo" 
                className="w-10 h-10 object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="bg-gradient-to-tr from-amber-500 to-yellow-300 p-1.5 rounded-lg shadow-inner">
                <Crown className="text-neutral-950 w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </div>
            )}
            <div>
              <span className="font-serif font-semibold text-lg sm:text-xl text-neutral-100 tracking-wide block">
                {visualBuilder?.globalSettings?.websiteName || settings.websiteName}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-amber-500 block -mt-1">
                Luxury & Wellness
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-7">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.tab, item.href)}
                className={`text-sm font-medium tracking-wide transition-colors duration-200 cursor-pointer ${
                  currentTab === 'home' 
                    ? 'text-neutral-300 hover:text-amber-400' 
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={() => handleNavClick('admin')}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 cursor-pointer ${
                currentTab === 'admin' 
                  ? 'text-amber-400 font-semibold' 
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Settings size={15} />
              <span>Admin</span>
            </button>
          </div>

          {/* Booking CTA Button (Desktop) */}
          <div className="hidden lg:flex items-center">
            <button
              onClick={() => handleNavClick('home', '#booking')}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 text-sm font-semibold tracking-wider uppercase rounded-full hover:from-amber-400 hover:to-amber-500 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 flex items-center gap-2 shadow-md shadow-amber-950/20 cursor-pointer"
            >
              <Calendar size={15} />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Mobile and Tablet menu button */}
          <div className="flex lg:hidden items-center gap-4">
            <button
              onClick={() => handleNavClick('home', '#booking')}
              className="p-2 bg-amber-500 text-neutral-950 rounded-full hover:scale-105 active:scale-95 transition-all text-xs"
              title="Quick book"
            >
              <Calendar size={16} />
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-neutral-300 hover:text-white focus:outline-none p-1.5"
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile/Tablet Drawer Menu */}
      <div 
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out border-b border-neutral-800 ${
          isOpen ? 'max-h-96 opacity-100 bg-neutral-900' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.tab, item.href)}
              className="block w-full text-left px-3 py-2.5 text-base font-medium text-neutral-300 hover:text-amber-400 hover:bg-neutral-800/50 rounded-lg transition-all duration-200"
            >
              {item.label}
            </button>
          ))}
          
          <button
            onClick={() => handleNavClick('admin')}
            className="flex items-center w-full text-left px-3 py-2.5 text-base font-medium text-neutral-300 hover:text-amber-400 hover:bg-neutral-800/50 rounded-lg transition-all duration-200 gap-2"
          >
            <Settings size={18} className="text-neutral-400 animate-spin-slow" />
            <span>Admin Control Panel</span>
          </button>

          <div className="pt-2">
            <button
              onClick={() => handleNavClick('home', '#booking')}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-semibold uppercase tracking-wider rounded-xl hover:bg-amber-400"
            >
              <Calendar size={18} />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
