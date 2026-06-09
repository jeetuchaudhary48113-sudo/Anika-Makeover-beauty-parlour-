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

  // Render height classes
  const heightClass = banner.height === 'tall' 
    ? 'py-20 sm:py-28 md:py-36 lg:py-44 min-h-[340px] sm:min-h-[420px] md:min-h-[500px]' 
    : 'py-14 sm:py-20 md:py-24 lg:py-28 min-h-[220px] sm:min-h-[280px] md:min-h-[340px]';

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
    : 'rgba(0, 0, 0, 0.5)';

  return (
    <div 
      className={`relative w-full overflow-hidden flex items-center justify-center transition-all duration-300 ${heightClass}`}
      id="welcome-announcement-banner"
    >
      {/* 1. BACKGROUND LAYER: Video first, then Image. Dual-layer (un-cropped contained foreground + blurred cover background) */}
      {banner.bgVideo ? (
        <div className="absolute inset-0 w-full h-full select-none pointer-events-none overflow-hidden">
          {/* A. Seamless backing that matches the video colors perfectly to fill margins on widescreen desktops with no blank space */}
          <video
            src={banner.bgVideo}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover filter blur-xl scale-110 opacity-90"
          />
          {/* B. Foreground contained source to ensure 100% visibility of the actual banner layout with zero cropping */}
          <video
            src={banner.bgVideo}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full select-none pointer-events-none overflow-hidden">
          {/* A. Seamless backing that matches the image colors perfectly to fill margins on widescreen desktops with no blank space */}
          <img
            src={banner.bgImage || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=1200"}
            alt=""
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover filter blur-xl scale-110 opacity-90"
          />
          {/* B. Foreground contained source to ensure 100% visibility of the actual banner layout with zero cropping */}
          <img
            src={banner.bgImage || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=1200"}
            alt="Welcome Banner Backdrop"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      )}

      {/* 2. OVERLAY COLOR LAYER */}
      <div 
        className="absolute inset-0 transition-colors duration-300 pointer-events-none" 
        style={{ backgroundColor: overlayBg }}
      />

      {/* 3. CONTENT AREA */}
      <div 
        className="relative z-10 w-full px-6 sm:px-12 md:px-16 lg:px-24 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left max-w-4xl">
          <div className="bg-amber-500/20 p-3.5 rounded-full border border-amber-500/30 text-amber-400 shrink-0 select-none animate-pulse">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 
              className="font-serif font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight leading-tight uppercase"
              style={textStyle}
            >
              {banner.title}
            </h1>
            {banner.subtitle && (
              <p 
                className="text-sm sm:text-base md:text-lg font-light tracking-wide opacity-95 mt-3 max-w-3xl leading-relaxed"
                style={textStyle}
              >
                {banner.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        {banner.buttonText && (
          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            href={banner.buttonLink || '#booking'}
            className="px-8 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-xl"
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
    </div>
  );
};
