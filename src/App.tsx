/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sparkles, Crown } from 'lucide-react';

// Components Imports
import { AnnouncementBar } from './components/AnnouncementBar';
import { WelcomeBanner } from './components/WelcomeBanner';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PromotionalBanners } from './components/PromotionalBanners';
import { AboutAndOwner } from './components/AboutAndOwner';
import { ServicesSection } from './components/ServicesSection';
import { ServiceDetailPage } from './components/ServiceDetailPage';
import { GallerySection } from './components/GallerySection';
import { InstagramReviewsStats } from './components/InstagramReviewsStats';
import { AppointmentForm } from './components/AppointmentForm';
import { ContactMap } from './components/ContactMap';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import { PageSectionSelector } from './components/PageSectionSelector';

// DB Helper APIs
import { 
  getSettings, 
  getContact, 
  getBanners, 
  getOwner, 
  getSocialLinks, 
  getServices, 
  getGallery, 
  getReviews, 
  getOffers,
  getWelcomeBanner,
  getVisualBuilder
} from './lib/db';

// Schema Interfaces
import { 
  Settings, 
  Contact, 
  Banners, 
  Owner, 
  SocialLinks, 
  Service, 
  GalleryItem, 
  Review, 
  Offer,
  WelcomeBanner as WelcomeBannerType,
  VisualBuilderSettings
} from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'service-detail' | 'admin'>('home');
  const [loadingApp, setLoadingApp] = useState(true);

  // Core Dynamic Configurations
  const [settings, setSettings] = useState<Settings | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [banners, setBanners] = useState<Banners | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLinks | null>(null);
  const [welcomeBanner, setWelcomeBanner] = useState<WelcomeBannerType | null>(null);
  const [visualBuilder, setVisualBuilder] = useState<VisualBuilderSettings | null>(null);

  // Dynamic Lists data
  const [services, setServices] = useState<Service[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);

  // Selection states (for details pre-fills)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [preselectedServiceIdForForm, setPreselectedServiceIdForForm] = useState<string | null>(null);

  // Fetch all startup variables
  const loadInitialConfigs = async () => {
    try {
      const dbSettings = await getSettings();
      const dbContact = await getContact();
      const dbBanners = await getBanners();
      const dbOwner = await getOwner();
      const dbSocial = await getSocialLinks();
      const dbWelcomeBanner = await getWelcomeBanner();
      const dbVisualBuilder = await getVisualBuilder();

      const dbServices = await getServices();
      const dbGallery = await getGallery();
      const dbReviews = await getReviews();
      const dbOffers = await getOffers();

      setSettings(dbSettings);
      setContact(dbContact);
      setBanners(dbBanners);
      setOwner(dbOwner);
      setSocialLinks(dbSocial);
      setWelcomeBanner(dbWelcomeBanner);
      setVisualBuilder(dbVisualBuilder);

      setServices(dbServices);
      setGalleryItems(dbGallery);
      setReviews(dbReviews);
      setOffers(dbOffers);
    } catch (error) {
      console.error("Critical error building initial data collections", error);
    } finally {
      setLoadingApp(false);
    }
  };

  useEffect(() => {
    loadInitialConfigs();
  }, []);

  // Update dynamic document Title and SEO based on Admin Configurations
  useEffect(() => {
    if (settings) {
      document.title = settings.metaTitle || settings.websiteName;
      
      // Update meta description
      let metaDescNode = document.querySelector('meta[name="description"]');
      if (!metaDescNode) {
        metaDescNode = document.createElement('meta');
        metaDescNode.setAttribute('name', 'description');
        document.head.appendChild(metaDescNode);
      }
      metaDescNode.setAttribute('content', settings.metaDesc || "Anika Makeover Salon");
    }
  }, [settings]);

  // Handle CTA Navigation Click
  const handleTabChange = (tab: 'home' | 'service-detail' | 'admin', serviceId?: string) => {
    setCurrentTab(tab);
    if (serviceId) {
      setSelectedServiceId(serviceId);
    }
    // Automatically reset scroll state to smooth
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectServiceDetail = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setCurrentTab('service-detail');
  };

  const handleDirectFormPreBook = (serviceId: string) => {
    setPreselectedServiceIdForForm(serviceId);
    setCurrentTab('home');
    
    setTimeout(() => {
      const element = document.getElementById('booking');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  // 1. LOADING SCREEN STATE (GOLD PRELOADER)
  if (loadingApp || !settings || !contact || !banners || !owner || !socialLinks || !welcomeBanner || !visualBuilder) {
    return (
      <div className="bg-neutral-950 text-neutral-100 min-h-screen flex flex-col justify-center items-center gap-6 select-none relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col items-center gap-4">
          <div className="bg-gradient-to-tr from-amber-500 to-yellow-300 p-4 rounded-3xl shadow-inner text-neutral-950 scale-110 animate-pulse relative">
            <Crown size={32} />
            <div className="absolute inset-0 rounded-3xl border-2 border-amber-400 rotate-12 -z-10 animate-spin-slow scale-110 opacity-30" />
          </div>
          <div className="text-center">
            <h1 className="font-serif font-semibold text-lg sm:text-xl tracking-wider text-neutral-100 animate-pulse">
              Anika Makeover Salon
            </h1>
            <p className="text-[10px] text-amber-500 font-mono uppercase tracking-[0.2em] mt-1">
              Curating Exclusive Self-Care
            </p>
          </div>
        </div>

        {/* Dynamic micro spinner */}
        <div className="flex items-center gap-2 mt-4 px-4 py-1.5 bg-neutral-900 border border-neutral-800 rounded-full">
          <Sparkles size={12} className="text-amber-500 animate-spin" />
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
            Tasting Connection Authenticity...
          </span>
        </div>
      </div>
    );
  }

  const selectedServiceObj = services.find(s => s.id === selectedServiceId);

  // 2. PRIMARY MASTER LAYOUT
  return (
    <div className="bg-neutral-950 text-neutral-100 min-h-screen font-sans selection:bg-amber-500 selection:text-neutral-950">
      
      {/* 1.5. Welcome Premium Banner (Disabled/Removed per user request) */}
      {/* {currentTab === 'home' && welcomeBanner && welcomeBanner.visible && (
        <WelcomeBanner banner={welcomeBanner} />
      )} */}

      {/* 2. Global Header Nav */}
      <Header 
        settings={settings} 
        currentTab={currentTab} 
        onChangeTab={handleTabChange} 
        visualBuilder={visualBuilder}
      />

      {/* 3. Sub pages/Tabs state router switches */}
      <main className="min-h-[70vh]">
        
        {/* A. HOME VIEW (COMPLETE MASTER SECTIONS SEQUENCE) */}
        {currentTab === 'home' && (
          <div className="space-y-0">
            {visualBuilder?.sections && visualBuilder.sections.length > 0 ? (
              visualBuilder.sections.map((sec: any) => (
                <PageSectionSelector
                  key={sec.id}
                  section={sec}
                  banners={banners}
                  contact={contact}
                  owner={owner}
                  socialLinks={socialLinks}
                  services={services}
                  galleryItems={galleryItems}
                  reviews={reviews}
                  offers={offers}
                  settings={settings}
                  preselectedServiceIdForForm={preselectedServiceIdForForm}
                  setPreselectedServiceIdForForm={setPreselectedServiceIdForForm}
                  handleTabChange={handleTabChange}
                  handleDirectFormPreBook={handleDirectFormPreBook}
                  handleSelectServiceDetail={handleSelectServiceDetail}
                  HeroComponent={Hero}
                  PromotionalBannersComponent={PromotionalBanners}
                  AboutAndOwnerComponent={AboutAndOwner}
                  ServicesComponent={ServicesSection}
                  GalleryComponent={GallerySection}
                  InstagramReviewsStatsComponent={InstagramReviewsStats}
                  AppointmentFormComponent={AppointmentForm}
                  ContactMapComponent={ContactMap}
                />
              ))
            ) : (
              <>
                {/* Full Screen Premium Banner */}
                <Hero 
                  banners={banners} 
                  contact={contact} 
                  onBookClick={() => handleDirectFormPreBook(services[0]?.id || "")}
                  onServicesClick={() => {
                    const element = document.getElementById('services');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }}
                />

                {/* Promotional Highlights Bento Offers Cards */}
                <PromotionalBanners 
                  banners={banners} 
                  offers={offers} 
                  onBookClick={() => {
                    const element = document.getElementById('booking');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }}
                />

                {/* About Salon Story & Owner Spotlight */}
                <AboutAndOwner owner={owner} />

                {/* Dynamic Services Category Menu grids */}
                <ServicesSection 
                  services={services} 
                  onSelectService={handleSelectServiceDetail} 
                  onBookNow={handleDirectFormPreBook}
                />

                {/* Lookbook Gallery transforms portfolio & Lightbox */}
                <GallerySection galleryItems={galleryItems} />

                {/* Instagram simulation feed, rating reviews cards & Counters */}
                <InstagramReviewsStats 
                  socialLinks={socialLinks} 
                  reviews={reviews} 
                />

                {/* Core Appointment Form scheduler with WhatsApp launcher links */}
                <AppointmentForm 
                  services={services} 
                  contact={contact} 
                  preselectedServiceId={preselectedServiceIdForForm} 
                  onClearPreselected={() => setPreselectedServiceIdForForm(null)}
                />

                {/* Embedded interactive maps coordinate details */}
                <ContactMap contact={contact} settings={settings} />
              </>
            )}
          </div>
        )}

        {/* B. DEDICATED DETAIL PAGE VIEW */}
        {currentTab === 'service-detail' && selectedServiceObj && (
          <ServiceDetailPage 
            service={selectedServiceObj} 
            onBack={() => handleTabChange('home')} 
            onBook={handleDirectFormPreBook} 
          />
        )}

        {/* C. SYSTEM ADMINISTRATION DASHBOARD MODULE */}
        {currentTab === 'admin' && (
          <AdminDashboard 
            initialSettings={settings}
            initialContact={contact}
            initialBanners={banners}
            initialOwner={owner}
            initialSocialLinks={socialLinks}
            initialWelcomeBanner={welcomeBanner}
            initialVisualBuilder={visualBuilder}
            onRefreshData={loadInitialConfigs}
          />
        )}

      </main>

      {/* 4. Infinite Floating sticky WhatsApp button */}
      <div className="fixed bottom-6 right-6 z-40 select-none animate-bounce-slow">
        <a
          href={`https://wa.me/${contact.whatsapp.replace('+', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Instant Support Concierge"
          className="flex items-center justify-center p-4 bg-emerald-600 hover:bg-emerald-500 rounded-full shadow-2xl text-white transform hover:scale-110 active:scale-95 border-2 border-emerald-450 transition-all duration-300 shadow-emerald-500/10"
        >
          <svg 
            viewBox="0 0 24 24" 
            width="28" 
            height="28" 
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-white fill-white"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </a>
      </div>

      {/* 5. Custom Bottom Footer */}
      <Footer 
        contact={contact} 
        settings={settings} 
        socialLinks={socialLinks} 
        onNavigate={(tab) => handleTabChange(tab)} 
        visualBuilder={visualBuilder}
      />

    </div>
  );
}
