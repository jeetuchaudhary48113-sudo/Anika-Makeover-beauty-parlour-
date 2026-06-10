/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { WelcomeBanner as WelcomeBannerType } from '../types';

interface WelcomeBannerProps {
  banner: WelcomeBannerType;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ banner }) => {
  if (!banner || !banner.visible) return null;

  // Let's check if they provided ANY text. If they provided ONLY background content with no text, we display the magnificent Flyer Mode.
  const hasTextContent = !!(banner.title?.trim() || banner.subtitle?.trim() || banner.buttonText?.trim());

  // Apply customizable text color inline
  const textStyle = { color: banner.textColor || '#ffffff' };
  
  // Create overlay background color with opacity
  const hexToRgba = (hex: string, opacity: number) => {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
       cleanHex = cleanHex.split('').map(char => char + char).join('');
    }
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const overlayBg = banner.overlayColor 
    ? (banner.overlayColor.startsWith('#') ? hexToRgba(banner.overlayColor, banner.overlayOpacity ?? 0.5) : banner.overlayColor)
    : 'rgba(10, 10, 10, 0.95)';

  if (!hasTextContent) {
    // ------------------------------------------------------------
    // MODE A: PURE CAMPAIGN GRAPHIC FLYER (No Overlay Text or CTAs)
    // ------------------------------------------------------------
    const bgUrl = banner.bgImage || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=1200";
    
    return (
      <div 
        className="w-full bg-neutral-950 py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8 border-b border-neutral-900" 
        id="welcome-announcement-banner"
      >
        <div className="max-w-7xl mx-auto overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl bg-neutral-900 border border-neutral-850">
          {banner.buttonLink ? (
            <a href={banner.buttonLink} className="block group relative overflow-hidden">
              {banner.bgVideo ? (
                <video
                  src={banner.bgVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                />
              ) : (
                <img
                  src={bgUrl}
                  alt="Welcome campaign flyer"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto max-h-[70vh] object-contain mx-auto group-hover:scale-[1.01] transition-transform duration-500 ease-out"
                />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
            </a>
          ) : (
            <div className="relative overflow-hidden w-full">
              {banner.bgVideo ? (
                <video
                  src={banner.bgVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                />
              ) : (
                <img
                  src={bgUrl}
                  alt="Welcome campaign flyer"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // MODE B: ELEGANT 2-COLUMN CAMPAIGN BLOCK (Title + Text + Button alongside beautiful un-cropped Media Card)
  // ------------------------------------------------------------
  const paddingClass = banner.height === 'tall' 
    ? 'py-16 sm:py-24 md:py-32 px-6 sm:px-12 md:px-16 lg:px-24' 
    : 'py-10 sm:py-16 md:py-20 px-6 sm:px-10 md:px-14 lg:px-20';

  const mediaUrl = banner.bgImage || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=1200";

  return (
    <div 
      className="relative w-full overflow-hidden bg-neutral-950 border-b border-neutral-900"
      id="welcome-announcement-banner"
    >
      {/* Dynamic Overlay background color styling */}
      <div 
        className="absolute inset-0 z-0 bg-neutral-950" 
        style={{ backgroundColor: banner.overlayColor ? hexToRgba(banner.overlayColor, Math.max(0.7, banner.overlayOpacity ?? 0.85)) : undefined }}
      />

      {/* Decorative ambient subtle background glows to make it look premium and fit beautifully */}
      <div className="absolute top-0 left-1/4 w-[250px] h-[250px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className={`relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 md:gap-14 ${paddingClass}`}>
        
        {/* TEXT DETAILS MODULE (Left / Top Column) */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] uppercase tracking-[0.15em] select-none uppercase-alert">
            <Sparkles size={14} className="animate-pulse" />
            <span>Exclusive Spotlight Campaign</span>
          </div>

          <div className="space-y-3">
            <h2 
              className="font-serif font-black text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.1] uppercase drop-shadow-sm"
              style={textStyle}
            >
              {banner.title}
            </h2>
            {banner.subtitle && (
              <p 
                className="text-sm sm:text-base md:text-lg font-light tracking-wide leading-relaxed max-w-xl opacity-90"
                style={textStyle}
              >
                {banner.subtitle}
              </p>
            )}
          </div>

          {/* Action button in standard format */}
          {banner.buttonText && (
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href={banner.buttonLink || '#booking'}
              className="inline-flex px-8 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-bold tracking-widest uppercase transition-all items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer"
              style={{ 
                backgroundColor: banner.buttonBgColor || '#eab308', 
                color: banner.buttonTextColor || '#000000' 
              }}
            >
              <span>{banner.buttonText}</span>
              <ArrowRight size={16} />
            </motion.a>
          )}
        </div>

        {/* OUTSTANDING MEDIA CARD CONTAINER (Right / Bottom Column) */}
        {/* This displays the media completely fully-fitted as a prominent card element with zero cropping or warping */}
        <div className="w-full lg:w-[45%] max-w-[500px] shrink-0">
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl group flex items-center justify-center">
            {banner.bgVideo ? (
              <video
                src={banner.bgVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto object-contain max-h-[300px] sm:max-h-[380px] md:max-h-[440px]"
              />
            ) : (
              <img
                src={mediaUrl}
                alt="Highlight Campaign artwork"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain max-h-[300px] sm:max-h-[380px] md:max-h-[440px] transform group-hover:scale-[1.01] transition-transform duration-500"
              />
            )}
            
            {/* Elegant overlay frame highlight */}
            <div className="absolute inset-0 border border-white/5 rounded-2xl md:rounded-3xl pointer-events-none" />
          </div>
        </div>

      </div>
    </div>
  );
};
