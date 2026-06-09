/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Calendar, ArrowRight, Video, ChevronDown, Check, Star, Play, Music, VolumeX, Mail, Phone, MapPin } from 'lucide-react';
import { WebBuilderSection, WebBuilderButton, Banners, Contact, Owner, SocialLinks, Service, GalleryItem, Review, Offer, Settings } from '../types';

// Let's import our existing elegant templates
import { Hero } from './Hero';
import { PromotionalBanners } from './PromotionalBanners';
import { AboutAndOwner } from './AboutAndOwner';
import { ServicesSection } from './ServicesSection'; // Wait, let's look at folders. It was imported as "./components/ServicesSection" inside App.tsx or "./ServicesSection"? Let's check App.tsx lines 15-22.
// Ah! It is imported as:
// import { Hero } from './components/Hero'; // Oh! App.tsx is in "/src/App.tsx", so the components are in "./components/".
// This means PageSectionSelector inside "/src/components/PageSectionSelector.tsx" can import them relatively as:
// "./Hero", "./PromotionalBanners", etc.

interface PageSectionSelectorProps {
  section: WebBuilderSection;
  banners: Banners;
  contact: Contact;
  owner: Owner;
  socialLinks: SocialLinks;
  services: Service[];
  galleryItems: GalleryItem[];
  reviews: Review[];
  offers: Offer[];
  settings: Settings;
  preselectedServiceIdForForm: string | null;
  setPreselectedServiceIdForForm: (v: string | null) => void;
  handleTabChange: (tab: 'home' | 'service-detail' | 'admin', serviceId?: string) => void;
  handleDirectFormPreBook: (id: string) => void;
  handleSelectServiceDetail: (serviceId: string) => void;

  // Static components to render when matching standard sections
  HeroComponent: React.ComponentType<any>;
  PromotionalBannersComponent: React.ComponentType<any>;
  AboutAndOwnerComponent: React.ComponentType<any>;
  ServicesComponent: React.ComponentType<any>;
  GalleryComponent: React.ComponentType<any>;
  InstagramReviewsStatsComponent: React.ComponentType<any>;
  AppointmentFormComponent: React.ComponentType<any>;
  ContactMapComponent: React.ComponentType<any>;
}

export const PageSectionSelector: React.FC<PageSectionSelectorProps> = ({
  section,
  banners,
  contact,
  owner,
  socialLinks,
  services,
  galleryItems,
  reviews,
  offers,
  settings,
  preselectedServiceIdForForm,
  setPreselectedServiceIdForForm,
  handleTabChange,
  handleDirectFormPreBook,
  handleSelectServiceDetail,

  HeroComponent,
  PromotionalBannersComponent,
  AboutAndOwnerComponent,
  ServicesComponent,
  GalleryComponent,
  InstagramReviewsStatsComponent,
  AppointmentFormComponent,
  ContactMapComponent
}) => {
  // If hidden, render nothing
  if (section.visible === false) return null;

  // Styles mapper helper functions
  const s = section.styles || {};
  const stylesContainer: React.CSSProperties = {
    backgroundColor: s.backgroundColor || 'transparent',
    color: s.textColor || '#ffffff',
    fontFamily: s.fontFamily ? `"${s.fontFamily}", sans-serif` : 'inherit',
  };

  // Convert layout position to tailwind alignments
  const alignmentClass = 
    s.layoutPosition === 'left' ? 'text-left items-start' :
    s.layoutPosition === 'right' ? 'text-right items-end' :
    'text-center items-center';

  // Dynamic Spacers classes
  const spacingClass = `${s.padding || 'py-16 px-6'} ${s.margin || 'my-0'}`;

  // Layout Width Limit Classes
  const widthClass = 
    s.sectionWidth === 'narrow' ? 'max-w-3xl mx-auto' :
    s.sectionWidth === 'normal' ? 'max-w-5xl mx-auto' :
    s.sectionWidth === 'wide' ? 'max-w-7xl mx-auto' :
    'w-full';

  // Rounded Corner Classes
  const roundClass = 
    s.borderRadius === 'none' ? 'rounded-none' :
    s.borderRadius === 'sm' ? 'rounded-sm' :
    s.borderRadius === 'md' ? 'rounded-md' :
    s.borderRadius === 'lg' ? 'rounded-lg' :
    s.borderRadius === 'xl' ? 'rounded-xl' :
    s.borderRadius === '2xl' ? 'rounded-2xl' :
    s.borderRadius === '3xl' ? 'rounded-3xl' :
    s.borderRadius === 'full' ? 'rounded-full' :
    'rounded-2xl';

  // Shadows
  const shadowClass = 
    s.shadow === 'none' ? 'shadow-none' :
    s.shadow === 'sm' ? 'shadow-sm' :
    s.shadow === 'md' ? 'shadow-md' :
    s.shadow === 'lg' ? 'shadow-lg' :
    s.shadow === 'xl' ? 'shadow-xl' :
    s.shadow === '2xl' ? 'shadow-2xl' :
    'shadow-xl';

  // Animation Entrances
  const animationClass = 
    s.animation === 'fade-in' ? 'animate-fadeIn' :
    s.animation === 'slide-up' ? 'animate-slideUp' :
    s.animation === 'scale-up' ? 'animate-scaleUp' :
    '';

  // Hover animations
  const hoverClass = 
    s.hoverEffect === 'lift' ? 'hover:-translate-y-2.5 transition-all duration-300' :
    s.hoverEffect === 'scale' ? 'hover:scale-[1.025] transition-all duration-300' :
    '';

  // Dynamic Button Renderer helper
  const renderButtons = (buttonsList?: WebBuilderButton[]) => {
    if (!buttonsList || buttonsList.length === 0) return null;
    return (
      <div className="flex flex-wrap items-center justify-center gap-3.5 mt-6 w-full">
        {buttonsList.map((btn) => {
          const sizePadding = 
            (btn.size as string) === 'xs' ? 'px-3 py-1.5 text-[10px]' :
            btn.size === 'sm' ? 'px-4 py-2 text-xs' :
            btn.size === 'lg' ? 'px-8 py-4.5 text-sm font-bold' :
            'px-6 py-3.5 text-xs font-semibold';

          return (
            <a
              key={btn.id}
              href={btn.link}
              style={{ backgroundColor: btn.color || '#f59e0b' }}
              className={`${sizePadding} text-neutral-950 uppercase tracking-widest rounded-xl transition-transform hover:scale-[1.04] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 font-bold cursor-pointer shrink-0`}
            >
              <span>{btn.text}</span>
              <ArrowRight size={13} className="opacity-80" />
            </a>
          );
        })}
      </div>
    );
  };

  // ROUTE REDIRECTION SWITCH TO SUPPORT ALL 14 SECTIONS REORDERABLE AT WILL!
  switch (section.type) {
    case 'hero':
      // Support overwriting default Hero background, headers, buttons dynamically if custom edits are supplied
      if (section.content?.title || section.content?.imageUrl || section.content?.videoUrl) {
        return (
          <section 
            id={section.id} 
            style={stylesContainer} 
            className={`relative relative-view min-h-[75vh] sm:min-h-[85vh] flex items-center justify-center overflow-hidden bg-neutral-950 ${spacingClass} ${roundClass} ${shadowClass} ${animationClass} ${hoverClass}`}
          >
            {/* Background Content Image or Video backdrop */}
            <div className="absolute inset-0 z-0">
              {section.content?.videoUrl ? (
                <video 
                  src={section.content.videoUrl} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className={`w-full h-full object-cover opacity-35 scale-102 select-none`}
                  style={{ objectPosition: section.content.imageCropFocus || 'center' }}
                />
              ) : (
                <img 
                  src={section.content?.imageUrl || banners.heroBgImage} 
                  alt="Backdrop visual" 
                  className={`w-full h-full object-cover opacity-35 scale-105 select-none`}
                  style={{ objectPosition: section.content?.imageCropFocus || 'center' }}
                  referrerPolicy="no-referrer"
                />
              )}
              {/* Veneer cover overlay */}
              <div 
                className="absolute inset-0" 
                style={{ 
                  backgroundColor: section.content?.overlayColor || '#000000', 
                  opacity: section.content?.overlayOpacity ?? 0.5 
                }} 
              />
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-neutral-950 to-transparent" />
            </div>

            <div className={`relative z-10 ${widthClass} text-center flex flex-col ${alignmentClass} select-text px-4`}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-text text-[11px] uppercase tracking-[0.2em] mb-5">
                <span className="w-1 px-1 rounded-full bg-amber-400" />
                <span>{section.content?.subtitle || "Gorakhpur's Premium Beauty Experience"}</span>
              </div>

              <h1 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-neutral-100 tracking-tight leading-[1.1] mb-5">
                {section.content?.title || banners.heroHeading}
              </h1>

              {section.content?.description && (
                <p className="max-w-2xl text-neutral-400 text-xs sm:text-sm md:text-base leading-relaxed font-light mb-8 font-sans">
                  {section.content.description}
                </p>
              )}

              {renderButtons(section.content?.buttons)}
            </div>
          </section>
        );
      }
      return (
        <HeroComponent 
          banners={banners} 
          contact={contact} 
          onBookClick={() => handleDirectFormPreBook(services[0]?.id || "")}
          onServicesClick={() => {
            const element = document.getElementById('services');
            if (element) element.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      );

    case 'offers':
      return (
        <div id={section.id}>
          <PromotionalBannersComponent 
            banners={banners} 
            offers={offers} 
            onBookClick={() => {
              const element = document.getElementById('booking');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
      );

    case 'about':
    case 'owner':
      return (
        <div id={section.id}>
          <AboutAndOwnerComponent owner={owner} />
        </div>
      );

    case 'services':
      return (
        <div id={section.id}>
          <ServicesComponent 
            services={services} 
            onSelectService={handleSelectServiceDetail} 
            onBookNow={handleDirectFormPreBook}
          />
        </div>
      );

    case 'gallery':
      return (
        <div id={section.id}>
          <GalleryComponent galleryItems={galleryItems} />
        </div>
      );

    case 'reviews':
    case 'instagram':
      return (
        <div id={section.id}>
          <InstagramReviewsStatsComponent 
            socialLinks={socialLinks} 
            reviews={reviews} 
          />
        </div>
      );

    case 'booking':
      return (
        <div id={section.id}>
          <AppointmentFormComponent 
            services={services} 
            contact={contact} 
            preselectedServiceId={preselectedServiceIdForForm} 
            onClearPreselected={() => setPreselectedServiceIdForForm(null)}
          />
        </div>
      );

    case 'contact':
      return (
        <div id={section.id}>
          <ContactMapComponent contact={contact} settings={settings} />
        </div>
      );

    // 🌟 FULL TEMPLATE LAYOUT BLOCKS FOR HIGH END WEBSITES
    case 'faq':
      return (
        <section 
          id={section.id} 
          style={stylesContainer} 
          className={`relative ${spacingClass} ${roundClass} ${animationClass} ${hoverClass} ${shadowClass}`}
        >
          <div className={widthClass}>
            <div className={`flex flex-col mb-10 ${alignmentClass}`}>
              <span className="p-1 px-3 bg-neutral-900 border border-neutral-800 text-[10px] font-mono rounded text-amber-500 uppercase tracking-widest">{section.content?.subtitle || "Got questions?"}</span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-neutral-100 mt-2">{section.content?.title || "Frequently Asked Questions"}</h2>
              {section.content?.description && <p className="text-xs text-neutral-400 mt-2 font-light max-w-xl text-center">{section.content.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(section.content?.faqItems || []).map((item, idx) => (
                <div key={idx} className="bg-neutral-900/40 p-4 border border-neutral-850 rounded-xl space-y-1.5 hover:border-amber-500/15 duration-300 transition-colors select-text">
                  <h3 className="font-serif font-bold text-sm sm:text-base text-neutral-100">{item.question}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-light font-sans">{item.answer}</p>
                </div>
              ))}
            </div>

            {renderButtons(section.content?.buttons)}
          </div>
        </section>
      );

    case 'pricing':
      return (
        <section 
          id={section.id} 
          style={stylesContainer} 
          className={`relative ${spacingClass} ${roundClass} ${animationClass} ${hoverClass} ${shadowClass}`}
        >
          <div className={widthClass}>
            <div className={`flex flex-col mb-10 ${alignmentClass}`}>
              <span className="p-1 px-3 bg-neutral-900 border border-neutral-800 text-[10px] font-mono rounded text-amber-500 uppercase tracking-widest">{section.content?.subtitle || "Best beauty combos"}</span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-neutral-100 mt-2">{section.content?.title || "Exclusive Luxury Pricing Bundles"}</h2>
              {section.content?.description && <p className="text-xs text-neutral-400 mt-2 font-light max-w-xl text-center">{section.content.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(section.content?.pricingItems || []).map((item, idx) => (
                <div key={idx} className="bg-neutral-900/60 p-5 rounded-2xl border border-neutral-805 flex flex-col justify-between hover:border-amber-500/20 transition-all group select-text">
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500">Tier #{idx+1}</span>
                    <h4 className="font-serif font-bold text-lg text-neutral-100 group-hover:text-amber-400 transition-colors">{item.title}</h4>
                    <div className="flex items-baseline gap-1.5 py-1.5 border-b border-neutral-850">
                      <span className="text-2xl sm:text-3xl font-bold font-mono text-neutral-150">{item.price}</span>
                      <span className="text-[10px] text-neutral-500 font-light font-sans">/ combo pkg</span>
                    </div>
                    {item.description && <p className="text-xs text-neutral-400 leading-relaxed font-light font-sans">{item.description}</p>}
                    
                    <ul className="space-y-2 pt-2">
                      {(item.features || []).map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-xs text-neutral-350">
                          <Check size={11} className="text-amber-500 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleDirectFormPreBook(services[0]?.id || "")}
                    className="w-full mt-6 py-2 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 border border-neutral-800 hover:border-amber-500 text-xs text-neutral-300 font-semibold rounded-xl text-center cursor-pointer transition-all uppercase tracking-wider"
                  >
                    Select combopack
                  </button>
                </div>
              ))}
            </div>

            {renderButtons(section.content?.buttons)}
          </div>
        </section>
      );

    case 'video':
      return (
        <section 
          id={section.id} 
          style={stylesContainer} 
          className={`relative overflow-hidden ${spacingClass} ${roundClass} ${animationClass} ${hoverClass} ${shadowClass}`}
        >
          <div className={widthClass}>
            <div className="relative aspect-video rounded-3xl overflow-hidden group bg-neutral-950 border border-neutral-850">
              {section.content?.videoUrl ? (
                <video 
                  src={section.content.videoUrl} 
                  controls 
                  muted 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-550 select-none">
                  <Play size={40} className="text-amber-500 animate-pulse" />
                  <span className="text-xs uppercase font-mono text-neutral-400">Salon Story Video Cover placeholder</span>
                </div>
              )}
            </div>

            <div className={`flex flex-col mt-6 ${alignmentClass} select-text`}>
              <h3 className="font-serif font-bold text-xl text-neutral-150 mt-1">{section.content?.title || "Behind the transformations"}</h3>
              {section.content?.description && <p className="text-xs text-neutral-400 mt-1 font-light max-w-xl font-sans text-center">{section.content.description}</p>}
            </div>

            {renderButtons(section.content?.buttons)}
          </div>
        </section>
      );

    case 'custom':
    default:
      return (
        <section 
          id={section.id} 
          style={stylesContainer} 
          className={`relative ${spacingClass} ${roundClass} ${animationClass} ${hoverClass} ${shadowClass}`}
        >
          <div className={`${widthClass} flex flex-col ${alignmentClass} select-text`}>
            {section.content?.subtitle && (
              <span className="p-0.5 px-2 bg-neutral-900 border border-neutral-800 text-[9px] font-mono rounded text-amber-500 uppercase tracking-widest mb-2 inline-block">
                {section.content.subtitle}
              </span>
            )}
            
            {section.content?.title && (
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-neutral-100 mb-4 tracking-wide leading-tight">
                {section.content.title}
              </h2>
            )}

            {section.content?.description && (
              <p className="max-w-3xl text-xs sm:text-sm text-neutral-400 leading-relaxed font-light mb-6 font-sans">
                {section.content.description}
              </p>
            )}

            {/* Custom Background Image if present */}
            {section.content?.imageUrl && (
              <div className="w-full h-64 sm:h-96 my-4 rounded-2xl overflow-hidden border border-neutral-850 select-none">
                <img 
                  src={section.content.imageUrl} 
                  alt="Custom presentation illustration" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Markdown rendered body */}
            {section.content?.bodyMarkdown && (
              <div className="w-full text-left font-sans text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-4xl prose prose-invert py-4 select-text">
                {section.content.bodyMarkdown.split('\n').map((para, pIdx) => {
                  if (para.startsWith('## ')) {
                    return <h3 key={pIdx} className="font-serif font-bold text-lg sm:text-xl text-neutral-100 mt-5 mb-2.5">{para.replace('## ', '')}</h3>;
                  }
                  if (para.startsWith('# ')) {
                    return <h2 key={pIdx} className="font-serif font-bold text-xl sm:text-2xl text-amber-500 mt-6 mb-3">{para.replace('# ', '')}</h2>;
                  }
                  if (para.trim().startsWith('- ')) {
                    return (
                      <div key={pIdx} className="flex items-center gap-2 text-neutral-300 pl-4 py-1">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
                        <span>{para.replace('- ', '').trim()}</span>
                      </div>
                    );
                  }
                  return para.trim() !== "" ? <p key={pIdx} className="mb-4 text-neutral-350">{para}</p> : null;
                })}
              </div>
            )}

            {renderButtons(section.content?.buttons)}
          </div>
        </section>
      );
  }
};
