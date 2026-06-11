/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Service {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  benefits: string; // Comma separated or list
  price: number;
  image: string;
  category: string;
  duration: string;
}

export interface Appointment {
  id?: string;
  fullName: string;
  phone: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  notes: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'bridal' | 'hair' | 'makeup' | 'transformation';
  image: string;
  beforeImage?: string;
  isBeforeAfter: boolean;
  createdAt?: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  avatar: string;
  createdAt: string;
}

export interface Banners {
  heroHeading: string;
  heroSubheading: string;
  heroBgImage: string;
  promoBridalTitle: string;
  promoBridalDesc: string;
  promoBridalImage: string;
  promoHairTitle: string;
  promoHairDesc: string;
  promoHairImage: string;
  promoPackageTitle: string;
  promoPackageDesc: string;
  promoPackageImage: string;
  
  // Custom premium Hero buttons (editable in Admin Dashboard)
  heroBtnAppointmentText?: string;
  heroBtnAppointmentLink?: string;
  heroBtnWhatsAppText?: string;
  heroBtnWhatsAppLink?: string;
  heroBtnInstagramText?: string;
  heroBtnInstagramLink?: string;
}

export interface Owner {
  name: string;
  experience: string;
  photo: string;
  biography: string;
  message: string;
}

export interface Settings {
  websiteName: string;
  announcement: string;
  announcementVisible: boolean;
  metaTitle: string;
  metaDesc: string;
  businessHours: string;
}

export interface Contact {
  phone: string;
  whatsapp: string;
  address: string;
  mapsUrl: string;
  directionsUrl: string;
}

export interface SocialLinks {
  googleReviewsUrl: string;
  instagram: string;
}

export interface HeroBanner {
  heroBgImage: string;
  heroHeading: string;
  heroSubheading: string;
  heroBtnAppointmentText: string;
  heroBtnAppointmentLink: string;
  heroBtnWhatsAppText: string;
  heroBtnWhatsAppLink: string;
  heroBtnInstagramText: string;
  heroBtnInstagramLink: string;
}

export interface WelcomeBanner {
  visible: boolean;
  title: string;
  subtitle: string;
  bgImage: string;
  bgVideo: string;
  buttonText: string;
  buttonLink: string;
  height: string; // e.g., 'short' | 'tall'
  overlayColor: string; 
  overlayOpacity: number;
  textColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
}

export interface VisualBuilderSettings {
  sectionsText: {
    hero: { heading: string; subheading: string; buttonText: string; buttonLink: string };
    promotions: { heading: string; subheading: string };
    owner: { heading: string; subheading: string; ownerName: string; ownerTitle: string; ownerBio: string; ownerMsg: string };
    services: { heading: string; subheading: string };
    gallery: { heading: string; subheading: string };
    reviews: { heading: string; subheading: string };
    booking: { heading: string; subheading: string; buttonText: string };
    contact: { heading: string; subheading: string };
    footer: { footerText: string; copyrightText: string };
  };
  visibility: {
    welcomeBanner: boolean;
    announcementBar: boolean;
    hero: boolean;
    promotions: boolean;
    owner: boolean;
    services: boolean;
    gallery: boolean;
    reviews: boolean;
    booking: boolean;
    contact: boolean;
    footer: boolean;
  };
  styles: {
    fontHeader: string;
    fontBody: string;
    colorBg: string;
    colorCard: string;
    colorTextPrimary: string;
    colorTextSecondary: string;
    colorAccent: string;
    colorButtonBg: string;
    colorButtonText: string;
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
    shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    spacingSize: 'cozy' | 'comfortable' | 'spacious';
    buttonStyle: 'solid' | 'outline' | 'rounded';
    hoverStyle: 'lift' | 'scale' | 'glow' | 'none';
    enableAnimations: boolean;
    animationSpeed: 'slow' | 'normal' | 'fast';
    heroHeight: 'small' | 'medium' | 'large' | 'viewport';
  };
  globalSettings?: {
    websiteName: string;
    logoUrl: string;
    faviconUrl: string;
    themePrimary: string;
    themeSecondary: string;
    typographyHeader: string;
    typographyBody: string;
    footerText: string;
    copyrightText: string;
    metaTitle: string;
    metaDesc: string;
    navMenu: Array<{ id: string; label: string; link: string }>;
  };
  mediaLibrary?: Array<{
    id: string;
    name: string;
    url: string;
    type: 'image' | 'video' | 'document' | 'logo' | 'banner';
    size?: string;
    createdAt?: string;
  }>;
  sections?: WebBuilderSection[];
}

export interface WebBuilderButton {
  id: string;
  text: string;
  color: string;
  size: 'sm' | 'md' | 'lg';
  icon: string;
  link: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface WebBuilderSection {
  id: string;
  type: 'banner' | 'hero' | 'about' | 'owner' | 'services' | 'gallery' | 'reviews' | 'contact' | 'instagram' | 'video' | 'faq' | 'pricing' | 'offers' | 'custom' | 'booking';
  name: string;
  visible: boolean;
  layoutDevice?: 'desktop' | 'tablet' | 'mobile';
  responsiveSettings?: {
    mobile?: { padding?: string; fontSize?: string; sectionHeight?: string };
    tablet?: { padding?: string; fontSize?: string; sectionHeight?: string };
    desktop?: { padding?: string; fontSize?: string; sectionHeight?: string };
  };
  styles: {
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    sectionWidth: 'narrow' | 'normal' | 'wide' | 'full';
    sectionHeight: 'short' | 'medium' | 'tall' | 'full-screen';
    padding: string; // e.g. 'py-12 px-6', 'py-6 px-4' etc.
    margin: string; // e.g. 'my-0', 'my-4' etc.
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
    shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    animation: 'fade-in' | 'slide-up' | 'scale-up' | 'none';
    hoverEffect: 'lift' | 'scale' | 'none';
    layoutPosition: 'center' | 'left' | 'right';
  };
  content: {
    title?: string;
    subtitle?: string;
    description?: string;
    bodyMarkdown?: string;
    imageUrl?: string;
    videoUrl?: string;
    videoAutoplay?: boolean;
    videoMute?: boolean;
    videoLoop?: boolean;
    imagePosition?: 'center' | 'left' | 'right' | 'top' | 'bottom';
    cropZoom?: number;
    cropX?: number;
    cropY?: number;
    overlayColor?: string;
    overlayOpacity?: number;
    buttons?: WebBuilderButton[];
    faqItems?: Array<{ question: string; answer: string }>;
    pricingItems?: Array<{ title: string; price: string; description: string; features: string[] }>;
  };
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discountCode: string;
  discountPercentage: number;
  imageUrl: string;
}

export interface InstagramSettings {
  profileUrl: string;
  followButtonLink: string;
  username: string;
  heading: string;
  description: string;
}

export interface InstagramPost {
  id: string;
  image: string;
  title: string;
  likes: string;
  comments: string;
  order: number;
  visible: boolean;
  createdAt: string;
}

export interface InstagramVideo {
  id: string;
  video: string;
  title: string;
  createdAt: string;
}

export interface InstagramReel {
  id: string;
  video: string;
  title: string;
  description: string;
  createdAt: string;
}


