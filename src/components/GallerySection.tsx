/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Eye, X, ChevronLeft, ChevronRight, Split } from 'lucide-react';
import { GalleryItem } from '../types';

interface GallerySectionProps {
  galleryItems: GalleryItem[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ galleryItems }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'bridal' | 'hair' | 'makeup' | 'transformation'>('all');
  const [selectedItemIdx, setSelectedItemIdx] = useState<number | null>(null);
  const [showBefore, setShowBefore] = useState<{ [id: string]: boolean }>({});

  const filterTabs = [
    { label: 'All Showcase', val: 'all' as const },
    { label: 'Bridal Portraitures', val: 'bridal' as const },
    { label: 'Hair Sculpting', val: 'hair' as const },
    { label: 'Royal Makeups', val: 'makeup' as const },
    { label: 'Before & After', val: 'transformation' as const },
  ];

  const filteredItems = galleryItems.filter(item => {
    if (activeCategory === 'all') return true;
    return item.category.toLowerCase() === activeCategory.toLowerCase();
  });

  const toggleBeforeAfter = (id: string) => {
    setShowBefore(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenLightbox = (item: GalleryItem) => {
    const idxInFiltered = filteredItems.findIndex(x => x.id === item.id);
    if (idxInFiltered !== -1) {
      setSelectedItemIdx(idxInFiltered);
    }
  };

  const handleCloseLightbox = () => {
    setSelectedItemIdx(null);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedItemIdx !== null && selectedItemIdx > 0) {
      setSelectedItemIdx(selectedItemIdx - 1);
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedItemIdx !== null && selectedItemIdx < filteredItems.length - 1) {
      setSelectedItemIdx(selectedItemIdx + 1);
    }
  };

  const currentItem = selectedItemIdx !== null ? filteredItems[selectedItemIdx] : null;

  return (
    <section id="gallery" className="bg-neutral-900 border-b border-neutral-950 text-neutral-100 py-20 sm:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-xs uppercase tracking-widest mb-3">
            <Sparkles size={12} className="animate-pulse" />
            <span>Salon Lookbook</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight text-neutral-100">
            Transformation Gallery & Real Portfolio
          </h2>
          <div className="w-16 h-[2.5px] bg-amber-500 mx-auto mt-4" />
          <p className="mt-4 text-neutral-400 text-sm sm:text-base max-w-xl mx-auto font-light">
            Unretouched beautiful photographs of our real guest makeovers, hair curations, and facial glows in 2026.
          </p>
        </div>

        {/* Categories Tab selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 sm:mb-16">
          {filterTabs.map((tab) => (
            <button
              key={tab.val}
              onClick={() => setActiveCategory(tab.val)}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase border transition-all duration-300 cursor-pointer ${
                activeCategory === tab.val
                  ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-lg scale-105'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Gallery Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isBA = item.isBeforeAfter && item.beforeImage;
            const viewingBefore = isBA && !!showBefore[item.id];

            return (
              <div 
                key={item.id}
                className="group relative bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden hover:border-neutral-800 transition-all duration-300 flex flex-col"
              >
                {/* Image panel */}
                <div className="aspect-[4/5] relative overflow-hidden bg-neutral-900 shadow-md">
                  <img 
                    src={viewingBefore ? item.beforeImage : item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover origin-center transition-transform duration-500 group-hover:scale-[1.02]"
                    onClick={() => handleOpenLightbox(item)}
                  />

                  {/* Dark transparent fade */}
                  <div className="absolute inset-0 bg-neutral-950/20 group-hover:bg-neutral-950/40 transition-colors pointer-events-none" />

                  {/* Before / After toggle badge if transformed */}
                  {isBA && (
                    <div className="absolute top-4 left-4 z-10 flex gap-1 items-center select-none">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBeforeAfter(item.id);
                        }}
                        className="px-3 py-1.5 bg-neutral-950/90 hover:bg-amber-500 hover:text-neutral-950 backdrop-blur-md rounded-lg text-[10px] text-amber-500 font-code font-bold uppercase tracking-wider border border-neutral-800 flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                      >
                        <Split size={12} />
                        <span>{viewingBefore ? "Showing: Before" : "Showing: After"}</span>
                      </button>
                    </div>
                  )}

                  {/* Category Pill Tag Overlay inside image */}
                  <span className="absolute bottom-4 right-4 z-10 px-2 sm:px-3 py-1 bg-neutral-950/80 backdrop-blur-sm rounded-lg text-[9px] text-neutral-400 font-semibold uppercase tracking-widest border border-neutral-900/60 pointer-events-none">
                    {item.category}
                  </span>

                  {/* Eye hover trigger zoom */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-950/10 pointer-events-none">
                    <div className="p-3 bg-amber-500 text-neutral-950 rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform">
                      <Eye size={18} />
                    </div>
                  </div>
                </div>

                {/* Narrative display */}
                <div className="p-4 bg-neutral-950/80">
                  <h4 className="font-serif font-semibold text-neutral-100 tracking-wide text-sm truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10px] uppercase font-mono text-neutral-500 tracking-widest mt-1">
                    {isBA ? "Transformation Series" : `${item.category} model portrait`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Lightbox pop up Overlay Modal */}
      {selectedItemIdx !== null && currentItem && (
        <div 
          className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-lg flex flex-col justify-between items-center py-6 px-4"
          onClick={handleCloseLightbox}
        >
          {/* Header Controls */}
          <div className="w-full max-w-5xl flex items-center justify-between">
            <div className="space-y-1 text-left">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-amber-500">
                Lookbook Entry {selectedItemIdx + 1} of {filteredItems.length}
              </span>
              <h3 className="font-serif font-bold text-neutral-100 text-base sm:text-lg">
                {currentItem.title}
              </h3>
            </div>
            <button 
              onClick={handleCloseLightbox}
              className="p-2.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Core Image panel with controls */}
          <div className="w-full max-w-4xl max-h-[70vh] flex items-center justify-between relative gap-2">
            
            {/* Left Button */}
            <button
              onClick={handlePrevImage}
              disabled={selectedItemIdx === 0}
              className={`p-3 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer ${
                selectedItemIdx === 0 ? 'opacity-20 cursor-not-allowed' : ''
              }`}
            >
              <ChevronLeft size={22} />
            </button>

            {/* Target showcase image */}
            <div 
              className="max-w-[75%] max-h-[65vh] rounded-2xl overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={currentItem.image} 
                alt={currentItem.title} 
                className="max-w-full max-h-[65vh] object-contain mx-auto"
              />
              {currentItem.isBeforeAfter && currentItem.beforeImage && (
                <div className="absolute inset-x-0 bottom-0 bg-neutral-900/90 text-[11px] p-2 text-center text-neutral-300 font-mono">
                  Before-After transform. Tap/click on cards inside gallery portal to see individual transitions.
                </div>
              )}
            </div>

            {/* Right Button */}
            <button
              onClick={handleNextImage}
              disabled={selectedItemIdx === filteredItems.length - 1}
              className={`p-3 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer ${
                selectedItemIdx === filteredItems.length - 1 ? 'opacity-20 cursor-not-allowed' : ''
              }`}
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Quick instructions footer */}
          <div className="text-[11px] text-neutral-500 font-mono uppercase tracking-widest text-center">
            Tap anywhere else to dismiss lookup portal
          </div>

        </div>
      )}

    </section>
  );
};
