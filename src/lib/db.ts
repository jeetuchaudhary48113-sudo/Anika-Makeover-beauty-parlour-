/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth, isMockFirebase } from './firebase';
import { 
  Service, 
  Appointment, 
  GalleryItem, 
  Review, 
  Banners, 
  Owner, 
  Settings, 
  Contact, 
  SocialLinks, 
  Offer,
  WelcomeBanner,
  HeroBanner,
  InstagramSettings,
  InstagramPost,
  InstagramVideo,
  InstagramReel
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const isPermissionError = 
    error?.code === 'permission-denied' || 
    (error instanceof Error && (
      error.message?.toLowerCase().includes('permission') || 
      error.message?.toLowerCase().includes('insufficient')
    ));

  if (isPermissionError) {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error (Permission): ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  } else {
    console.error('Firestore Error: ', error);
    throw error;
  }
}

// ==========================================
// PREMIUM INITIAL DEFAULTS FOR THE SALON
// ==========================================

const DEFAULT_SETTINGS: Settings = {
  websiteName: "Anika Makeover Salon",
  announcement: "✨ Get 20% Off on Premium Bridal Bookings! Use Code: ANIKABRIDAL20 at Checkout. ✨",
  announcementVisible: true,
  metaTitle: "Anika Makeover Salon - Premium Luxury Beauty parlour in Gorakhpur",
  metaDesc: "Discover Gorakhpur's finest makeover experience. Bridal grooming, luxury facials, styling and wellness from styling icon Menka. Book your appointment now.",
  businessHours: "Open Daily: 10:00 AM - 08:30 PM (Sunday Closed for pre-bookings only)"
};

const DEFAULT_CONTACT: Contact = {
  phone: "+918922933940",
  whatsapp: "+918922933940",
  address: "Budh Vihar Part-C, Near By Pani Ki Tanki, Gaighat Road, Taramandal, Gorakhpur - 273010",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Anika+Makeover+Salon+Budh+Vihar+Part+C+Gaighat+Road+Taramandal+Gorakhpur",
  directionsUrl: "https://www.google.com/maps/search/?api=1&query=Anika+Makeover+Salon+Budh+Vihar+Part+C+Gaighat+Road+Taramandal+Gorakhpur"
};

const DEFAULT_SOCIAL: SocialLinks = {
  instagram: "https://www.instagram.com/anikamakeover45",
  googleReviewsUrl: "https://www.google.com/maps/search/?api=1&query=Anika+Makeover+Salon+Budh+Vihar+Part+C+Gaighat+Road+Taramandal+Gorakhpur"
};

const DEFAULT_OWNER: Owner = {
  name: "Menka Singh",
  experience: "12+ Years of Luxury Styling",
  photo: "/src/assets/images/regenerated_image_1780922025921.jpg",
  biography: "Menka Singh is a verified high-end artist and beauty professional with over a decade of hands-on experience in transforming bridal portraits and global modern hairstyles. Renowned for her delicate and customized visual look matching, she established Anika Makeover Salon in Gorakhpur to cultivate a brand where self-care is elevated to absolute art.",
  message: "Designing hair, makeup, and skin routines shouldn't just be a treatment—it's an exploration of your premium authentic beauty. Our mission at Anika Makeover Salon is to make you walk out feeling unmatched, confident, and stunningly powerful."
};

const DEFAULT_BANNERS: Banners = {
  heroHeading: "Anika Makeover Salon",
  heroSubheading: "Where Luxury Meets Beauty & Elegant Styling",
  heroBgImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80",
  promoBridalTitle: "Luxury Royal Bridal Makeup Packages",
  promoBridalDesc: "HD makeup, Airbrush luxury, premium imported makeup kits customized for your unique skin tone in 2026.",
  promoBridalImage: "https://images.unsplash.com/photo-1487412720507-e7ab37653c6f?auto=format&fit=crop&w=800&q=80",
  promoHairTitle: "Revitalize Hair Transformation",
  promoHairDesc: "Professional hair spas, deep keratin nourishment, and rich structural coloring to completely amplify your hair.",
  promoHairImage: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80",
  promoPackageTitle: "Seasonal Premium Beauty Combos",
  promoPackageDesc: "Enjoy our handpicked facial skincare, cleanup, manicures, and complete grooming packages at optimized pricing.",
  promoPackageImage: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80",
  
  // Custom premium Hero buttons values
  heroBtnAppointmentText: "Book Appointment",
  heroBtnAppointmentLink: "#booking",
  heroBtnWhatsAppText: "WhatsApp",
  heroBtnWhatsAppLink: "",
  heroBtnInstagramText: "Instagram",
  heroBtnInstagramLink: ""
};

const DEFAULT_SERVICES: Service[] = [
  {
    id: "hair-cut",
    name: "Luxury Signature Hair Cut",
    subtitle: "Custom designer shapes by top stylists",
    description: "Includes professional consultant assessment, soothing hair wash, detailed custom hair styling shaping, and deep blowout curation.",
    benefits: "Custom face contouring, healthier ends, high premium volume",
    price: 650,
    image: "https://images.unsplash.com/photo-1605497746444-ac9da58d440a?auto=format&fit=crop&w=600&q=80",
    category: "Hair",
    duration: "45 Mins"
  },
  {
    id: "hair-styling",
    name: "Hollywood Hair Styling & Blowout",
    subtitle: "Grit and curl masterpiece styling",
    description: "Whether you require rich soft loose curls, elegant professional high bun, or sleek poker-straight premium glass finish hair.",
    benefits: "Long-lasting thermal protection wrap, incredible gloss texture",
    price: 800,
    image: "https://images.unsplash.com/photo-1595476108010-b4d1f20dd315?auto=format&fit=crop&w=600&q=80",
    category: "Hair",
    duration: "40 Mins"
  },
  {
    id: "hair-color",
    name: "Couture Hair Coloring",
    subtitle: "Rich balayage and global premium tints",
    description: "Using safe zero-ammonia imported color collections to lift, shadow, and tint. Perfectly tailored to match your profile.",
    benefits: "Vibrant custom shine, deeply hydrated strands, complete grey coverage",
    price: 2500,
    image: "https://images.unsplash.com/photo-1620331702200-a94a0ca82b13?auto=format&fit=crop&w=600&q=80",
    category: "Hair",
    duration: "120 Mins"
  },
  {
    id: "hair-spa",
    name: "Nourishing Deep Hair Spa",
    subtitle: "Intense moisture infusion recovery therapy",
    description: "Our signature hair therapy using premium steam active proteins to revitalize brittle, frizzy, or dull hair fibres completely.",
    benefits: "Anti-frizz luxury control, scalp hydration massage, dandruff reduction",
    price: 1200,
    image: "https://images.unsplash.com/photo-1522337360788-8b13df793f1a?auto=format&fit=crop&w=600&q=80",
    category: "Hair",
    duration: "60 Mins"
  },
  {
    id: "keratin",
    name: "Intense Keratin & Smoothening Treatment",
    subtitle: "Ultimate smooth frizz-free silky shield",
    description: "Premium alignment formula locks essential keratin proteins into the cellular shaft of your hair for lasting high-end gloss and flow.",
    benefits: "Up to 5 months super silk protection, 50% faster drying times, sleek bounce",
    price: 4999,
    image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80",
    category: "Hair",
    duration: "150 Mins"
  },
  {
    id: "facial",
    name: "24K Gold Luxury Facial",
    subtitle: "Luminescent premium anti-aging facial",
    description: "Unveils instant radiant luminosity using direct gold ions, deep luxury collagen sheet masks, and professional lymphatic face massage.",
    benefits: "Deep wrinkle smoothing, intense detox luxury glow, cellular renewal boost",
    price: 1800,
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80",
    category: "Skin",
    duration: "75 Mins"
  },
  {
    id: "cleanup",
    name: "Detox Cleansing & Cleanup",
    subtitle: "Acne defence and charcoal pore extraction",
    description: "A customized refreshing cleanup with salicylic steam therapy, ultrasound ultrasonic pore refining, and calming botanical hydration packs.",
    benefits: "De-congested fresh skin, blackhead zero clearance, velvety soft skin profile",
    price: 850,
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80",
    category: "Skin",
    duration: "45 Mins"
  },
  {
    id: "bridal-makeup",
    name: "Premium Signature Bridal Makeup",
    subtitle: "Luxury HD & Special Airbrush masterpiece",
    description: "Complete royal bridal package with custom style consultations, high-end international primer foundations, and water-resistant elegance.",
    benefits: "Longwear 16HR durability, photo-ready layout, matches jewelry accents",
    price: 15000,
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
    category: "Makeup",
    duration: "180 Mins"
  },
  {
    id: "party-makeup",
    name: "Glow & Shimmer Party Makeup",
    subtitle: "Festive, reception, and bridesmaid radiance",
    description: "Achieve the ultimate premium guest look. Focused skin strobe primers, high-end defined eye liners, and stunning premium lip sculpting.",
    benefits: "Flawless matching under artificial hall lighting, elegant visual highlight",
    price: 3500,
    image: "https://images.unsplash.com/photo-1522337360788-8b13df793f1a?auto=format&fit=crop&w=600&q=80",
    category: "Makeup",
    duration: "90 Mins"
  },
  {
    id: "manicure",
    name: "Elite Hand Spa & Manicure",
    subtitle: "Nirvana hydrating therapy and gel polish",
    description: "Soothing dead skin salt scrubs, detailed cuticle care massage, customized luxury essential oil butter mask with premium gel pigment.",
    benefits: "De-stressed hands, anti-dark spots treatment, stronger beautifully shaped nails",
    price: 900,
    image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=600&q=80",
    category: "Wellness",
    duration: "50 Mins"
  },
  {
    id: "pedicure",
    name: "Heal & Soft Foot Spa Pedicure",
    subtitle: "Cracked heel botanical rejuvenation",
    description: "Warm mineral bubble bath with organic detox salts, professional volcanic pumice brushing, mint oils deep massage, and beautiful polish.",
    benefits: "Relaxed feet meridians, total callous softening, premium clean toes",
    price: 1100,
    image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=600&q=80",
    category: "Wellness",
    duration: "55 Mins"
  },
  {
    id: "waxing",
    name: "Luxury Rica White Chocolate Waxing",
    subtitle: "Pain-free hydrating structural waxing",
    description: "Using world's finest Italian Rica waxing melts. Nourished with milk and cocoa butter to prevent red bumps and promote silky smooth touch.",
    benefits: "No sticky residue, tan relief active, deeply moisturized pre/post-care",
    price: 1400,
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80",
    category: "Wellness",
    duration: "60 Mins"
  }
];

const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Royal North-Indian Traditional Wedding",
    category: "bridal",
    image: "https://images.unsplash.com/photo-1610030469668-9253339a91a8?auto=format&fit=crop&w=600&q=80",
    isBeforeAfter: false
  },
  {
    id: "gal-2",
    title: "Rich Balayage & Structured Smooth Waves",
    category: "hair",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80",
    isBeforeAfter: false
  },
  {
    id: "gal-3",
    title: "Smokey Glam Dramatic Eye & Glow Lip",
    category: "makeup",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80",
    isBeforeAfter: false
  },
  {
    id: "gal-4",
    title: "Premium Facial Cleansing Brightening",
    category: "transformation",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80",
    beforeImage: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80",
    isBeforeAfter: true
  },
  {
    id: "gal-5",
    title: "Modern Soft Shimmer Prom Bridal",
    category: "bridal",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
    isBeforeAfter: false
  },
  {
    id: "gal-6",
    title: "Smooth Keratin Straight Soften Glow",
    category: "transformation",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80",
    beforeImage: "https://images.unsplash.com/photo-1605497746444-ac9da58d440a?auto=format&fit=crop&w=600&q=80",
    isBeforeAfter: true
  }
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "rev-1",
    name: "Priyanka Mishra",
    rating: 5,
    text: "Menka is literally the most professional bridal artist in Gorakhpur! She designed my wedding look so elegantly. Absolutely stunning HD makeup and hair styling. Everyone was complementing it!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    createdAt: "2026-05-15"
  },
  {
    id: "rev-2",
    name: "Sneha Rawat",
    rating: 5,
    text: "Got my keratin treatment with extra discount. The hair feels incredibly silky and super easy to manage. The staff is polite, and the interior looks absolutely elite! Highly recommended.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    createdAt: "2026-05-28"
  },
  {
    id: "rev-3",
    name: "Anjali Gupta",
    rating: 5,
    text: "The 24k Gold Luxury Facial is amazing. Immediate de-tan and glow. They gave me exceptional attention. Best place near Taramandal, Gorakhpur.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    createdAt: "2026-06-02"
  }
];

const DEFAULT_OFFERS: Offer[] = [
  {
    id: "off-1",
    title: "Grand Bridal Special",
    description: "Get flat 20% off on all royal bridal glow makeups and accessories setups.",
    discountCode: "ANIKABRIDAL20",
    discountPercentage: 20,
    imageUrl: "https://images.unsplash.com/photo-1610030469668-9253339a91a8?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "off-2",
    title: "Monsoon Beauty Bundle",
    description: "Combine premium Gold Facial and Hydra Hair Spa to save 15% immediately.",
    discountCode: "MONSOON15",
    discountPercentage: 15,
    imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=400&q=80"
  }
];

// ==========================================
// RESILIENT DATA INTERACTION LAYER
// ==========================================

function getLocalStorage<T>(key: string, initialValue: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    }
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Error reading key ${key} from localStorage, using default.`, error);
    return initialValue;
  }
}

function setLocalStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving key ${key} to localStorage.`, error);
  }
}

// 1. Settings (Global Config)
export async function getSettings(): Promise<Settings> {
  if (isMockFirebase) {
    return getLocalStorage<Settings>('anika_settings', DEFAULT_SETTINGS);
  }
  try {
    const docRef = doc(db, 'settings', 'global');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Settings;
    } else {
      try {
        await setDoc(docRef, DEFAULT_SETTINGS);
      } catch (writeErr) {
        console.warn("Seeding settings/global skipped (user is likely unauthenticated):", writeErr);
      }
      return DEFAULT_SETTINGS;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'settings/global');
    console.warn("Firestore error on settings load, falling back to LocalStorage.", error);
    return getLocalStorage<Settings>('anika_settings', DEFAULT_SETTINGS);
  }
}

export async function updateSettings(settings: Settings): Promise<void> {
  setLocalStorage<Settings>('anika_settings', settings);
  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'settings/global');
    }
  }
}

// 2. Contact info
export async function getContact(): Promise<Contact> {
  if (isMockFirebase) {
    return getLocalStorage<Contact>('anika_contact', DEFAULT_CONTACT);
  }
  try {
    const docRef = doc(db, 'contact', 'info');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Contact;
    } else {
      try {
        await setDoc(docRef, DEFAULT_CONTACT);
      } catch (writeErr) {
        console.warn("Seeding contact/info skipped (user is likely unauthenticated):", writeErr);
      }
      return DEFAULT_CONTACT;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'contact/info');
    console.warn("Firestore contact load failed.", error);
    return getLocalStorage<Contact>('anika_contact', DEFAULT_CONTACT);
  }
}

export async function updateContact(contact: Contact): Promise<void> {
  setLocalStorage<Contact>('anika_contact', contact);
  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, 'contact', 'info'), contact);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'contact/info');
    }
  }
}

// 3. Social links
export async function getSocialLinks(): Promise<SocialLinks> {
  if (isMockFirebase) {
    return getLocalStorage<SocialLinks>('anika_social', DEFAULT_SOCIAL);
  }
  try {
    const docRef = doc(db, 'socialLinks', 'main');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SocialLinks;
    } else {
      try {
        await setDoc(docRef, DEFAULT_SOCIAL);
      } catch (writeErr) {
        console.warn("Seeding socialLinks/main skipped (user is likely unauthenticated):", writeErr);
      }
      return DEFAULT_SOCIAL;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'socialLinks/main');
    console.warn("Firestore social links load failed.", error);
    return getLocalStorage<SocialLinks>('anika_social', DEFAULT_SOCIAL);
  }
}

export async function updateSocialLinks(social: SocialLinks): Promise<void> {
  setLocalStorage<SocialLinks>('anika_social', social);
  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, 'socialLinks', 'main'), social);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'socialLinks/main');
    }
  }
}

// 4. Owner Info
export async function getOwner(): Promise<Owner> {
  const oldUnsplashPhoto = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80";
  const newLocalPhoto = "/src/assets/images/regenerated_image_1780922025921.jpg";

  if (isMockFirebase) {
    const data = getLocalStorage<Owner>('anika_owner', DEFAULT_OWNER);
    if (data.photo === oldUnsplashPhoto) {
      data.photo = newLocalPhoto;
      setLocalStorage<Owner>('anika_owner', data);
    }
    return data;
  }
  try {
    const docRef = doc(db, 'owner', 'info');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as Owner;
      if (data.photo === oldUnsplashPhoto) {
        data.photo = newLocalPhoto;
        try {
          await setDoc(docRef, data);
        } catch (writeErr) {
          console.warn("Auto-updating owner photo on Firestore skipped:", writeErr);
        }
      }
      return data;
    } else {
      try {
        await setDoc(docRef, DEFAULT_OWNER);
      } catch (writeErr) {
        console.warn("Seeding owner/info skipped (user is likely unauthenticated):", writeErr);
      }
      return DEFAULT_OWNER;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'owner/info');
    const data = getLocalStorage<Owner>('anika_owner', DEFAULT_OWNER);
    if (data.photo === oldUnsplashPhoto) {
      data.photo = newLocalPhoto;
      setLocalStorage<Owner>('anika_owner', data);
    }
    return data;
  }
}

export async function updateOwner(owner: Owner): Promise<void> {
  setLocalStorage<Owner>('anika_owner', owner);
  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, 'owner', 'info'), owner);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'owner/info');
    }
  }
}

// 5. Banners
export async function getBanners(): Promise<Banners> {
  if (isMockFirebase) {
    return getLocalStorage<Banners>('anika_banners', DEFAULT_BANNERS);
  }
  try {
    const docRef = doc(db, 'banners', 'main');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Banners;
    } else {
      try {
        await setDoc(docRef, DEFAULT_BANNERS);
      } catch (writeErr) {
        console.warn("Seeding banners/main skipped (user is likely unauthenticated):", writeErr);
      }
      return DEFAULT_BANNERS;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'banners/main');
    return getLocalStorage<Banners>('anika_banners', DEFAULT_BANNERS);
  }
}

export async function updateBanners(banners: Banners): Promise<void> {
  setLocalStorage<Banners>('anika_banners', banners);
  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, 'banners', 'main'), banners);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'banners/main');
    }
  }
}

// 6. Services list
export async function getServices(): Promise<Service[]> {
  if (isMockFirebase) {
    return getLocalStorage<Service[]>('anika_services', DEFAULT_SERVICES);
  }
  try {
    const querySnapshot = await getDocs(collection(db, 'services'));
    const hasBeenSeededLocally = localStorage.getItem('anika_services_seeded') === 'true';
    if (querySnapshot.empty && !hasBeenSeededLocally) {
      localStorage.setItem('anika_services_seeded', 'true');
      // Seed services
      for (const s of DEFAULT_SERVICES) {
        try {
          await setDoc(doc(db, 'services', s.id), s);
        } catch (writeErr) {
          console.warn(`Seeding services/${s.id} skipped (user is likely unauthenticated):`, writeErr);
        }
      }
      setLocalStorage<Service[]>('anika_services', DEFAULT_SERVICES);
      return DEFAULT_SERVICES;
    }
    const services: Service[] = [];
    querySnapshot.forEach((docSnap) => {
      services.push({ ...(docSnap.data() as Service), id: docSnap.id });
    });
    localStorage.setItem('anika_services_seeded', 'true');
    setLocalStorage<Service[]>('anika_services', services);
    return services;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'services');
    return getLocalStorage<Service[]>('anika_services', DEFAULT_SERVICES);
  }
}

export async function addService(service: Omit<Service, 'id'> & { id?: string }): Promise<void> {
  const finalId = service.id || `service-${Date.now()}`;
  const finalService = { ...service, id: finalId } as Service;
  
  const current = getLocalStorage<Service[]>('anika_services', DEFAULT_SERVICES);
  setLocalStorage<Service[]>('anika_services', [...current, finalService]);
  
  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, 'services', finalId), finalService);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `services/${finalId}`);
    }
  }
}

export async function updateService(service: Service): Promise<void> {
  const current = getLocalStorage<Service[]>('anika_services', DEFAULT_SERVICES);
  const updated = current.map(item => item.id === service.id ? service : item);
  setLocalStorage<Service[]>('anika_services', updated);
  
  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, 'services', service.id), service);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `services/${service.id}`);
    }
  }
}

export async function deleteService(id: string): Promise<void> {
  const current = getLocalStorage<Service[]>('anika_services', DEFAULT_SERVICES);
  const filtered = current.filter(item => item.id !== id);
  setLocalStorage<Service[]>('anika_services', filtered);
  
  if (!isMockFirebase) {
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `services/${id}`);
    }
  }
}

// 7. Gallery
export async function getGallery(): Promise<GalleryItem[]> {
  if (isMockFirebase) {
    return getLocalStorage<GalleryItem[]>('anika_gallery', DEFAULT_GALLERY);
  }
  try {
    const snap = await getDocs(collection(db, 'gallery'));
    const hasBeenSeededLocally = localStorage.getItem('anika_gallery_seeded') === 'true';
    if (snap.empty && !hasBeenSeededLocally) {
      localStorage.setItem('anika_gallery_seeded', 'true');
      for (const item of DEFAULT_GALLERY) {
        try {
          await setDoc(doc(db, 'gallery', item.id), item);
        } catch (writeErr) {
          console.warn(`Seeding gallery/${item.id} skipped (user is likely unauthenticated):`, writeErr);
        }
      }
      setLocalStorage<GalleryItem[]>('anika_gallery', DEFAULT_GALLERY);
      return DEFAULT_GALLERY;
    }
    const gallery: GalleryItem[] = [];
    snap.forEach((docSnap) => {
      gallery.push({ ...(docSnap.data() as GalleryItem), id: docSnap.id });
    });
    localStorage.setItem('anika_gallery_seeded', 'true');
    setLocalStorage<GalleryItem[]>('anika_gallery', gallery);
    return gallery;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'gallery');
    return getLocalStorage<GalleryItem[]>('anika_gallery', DEFAULT_GALLERY);
  }
}

export async function addGalleryItem(item: Omit<GalleryItem, 'id'> & { id?: string }): Promise<void> {
  const finalId = item.id || `gal-${Date.now()}`;
  const finalItem = { ...item, id: finalId } as GalleryItem;
  
  const current = getLocalStorage<GalleryItem[]>('anika_gallery', DEFAULT_GALLERY);
  setLocalStorage<GalleryItem[]>('anika_gallery', [...current, finalItem]);
  
  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, 'gallery', finalId), finalItem);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `gallery/${finalId}`);
    }
  }
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const current = getLocalStorage<GalleryItem[]>('anika_gallery', DEFAULT_GALLERY);
  const filtered = current.filter(item => item.id !== id);
  setLocalStorage<GalleryItem[]>('anika_gallery', filtered);
  
  if (!isMockFirebase) {
    try {
      await deleteDoc(doc(db, 'gallery', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `gallery/${id}`);
    }
  }
}

// 8. Reviews
export async function getReviews(): Promise<Review[]> {
  if (isMockFirebase) {
    return getLocalStorage<Review[]>('anika_reviews', DEFAULT_REVIEWS);
  }
  try {
    const snap = await getDocs(collection(db, 'reviews'));
    const hasBeenSeededLocally = localStorage.getItem('anika_reviews_seeded') === 'true';
    if (snap.empty && !hasBeenSeededLocally) {
      localStorage.setItem('anika_reviews_seeded', 'true');
      for (const item of DEFAULT_REVIEWS) {
        try {
          await setDoc(doc(db, 'reviews', item.id), item);
        } catch (writeErr) {
          console.warn(`Seeding reviews/${item.id} skipped (user is likely unauthenticated):`, writeErr);
        }
      }
      setLocalStorage<Review[]>('anika_reviews', DEFAULT_REVIEWS);
      return DEFAULT_REVIEWS;
    }
    const reviews: Review[] = [];
    snap.forEach((docSnap) => {
      reviews.push({ ...(docSnap.data() as Review), id: docSnap.id });
    });
    localStorage.setItem('anika_reviews_seeded', 'true');
    setLocalStorage<Review[]>('anika_reviews', reviews);
    return reviews;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'reviews');
    return getLocalStorage<Review[]>('anika_reviews', DEFAULT_REVIEWS);
  }
}

export async function addReview(review: Omit<Review, 'id'> & { id?: string }): Promise<void> {
  const finalId = review.id || `rev-${Date.now()}`;
  const finalReview = { ...review, id: finalId } as Review;
  
  const current = getLocalStorage<Review[]>('anika_reviews', DEFAULT_REVIEWS);
  setLocalStorage<Review[]>('anika_reviews', [...current, finalReview]);
  
  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, 'reviews', finalId), finalReview);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `reviews/${finalId}`);
    }
  }
}

export async function deleteReview(id: string): Promise<void> {
  const current = getLocalStorage<Review[]>('anika_reviews', DEFAULT_REVIEWS);
  const filtered = current.filter(item => item.id !== id);
  setLocalStorage<Review[]>('anika_reviews', filtered);
  
  if (!isMockFirebase) {
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `reviews/${id}`);
    }
  }
}

// 9. Offers
export async function getOffers(): Promise<Offer[]> {
  if (isMockFirebase) {
    return getLocalStorage<Offer[]>('anika_offers', DEFAULT_OFFERS);
  }
  try {
    const snap = await getDocs(collection(db, 'offers'));
    const hasBeenSeededLocally = localStorage.getItem('anika_offers_seeded') === 'true';
    if (snap.empty && !hasBeenSeededLocally) {
      localStorage.setItem('anika_offers_seeded', 'true');
      for (const item of DEFAULT_OFFERS) {
        try {
          await setDoc(doc(db, 'offers', item.id), item);
        } catch (writeErr) {
          console.warn(`Seeding offers/${item.id} skipped (user is likely unauthenticated):`, writeErr);
        }
      }
      setLocalStorage<Offer[]>('anika_offers', DEFAULT_OFFERS);
      return DEFAULT_OFFERS;
    }
    const offers: Offer[] = [];
    snap.forEach((docSnap) => {
      offers.push({ ...(docSnap.data() as Offer), id: docSnap.id });
    });
    localStorage.setItem('anika_offers_seeded', 'true');
    setLocalStorage<Offer[]>('anika_offers', offers);
    return offers;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'offers');
    return getLocalStorage<Offer[]>('anika_offers', DEFAULT_OFFERS);
  }
}

export async function addOffer(offer: Omit<Offer, 'id'> & { id?: string }): Promise<void> {
  const finalId = offer.id || `off-${Date.now()}`;
  const finalOffer = { ...offer, id: finalId } as Offer;
  
  const current = getLocalStorage<Offer[]>('anika_offers', DEFAULT_OFFERS);
  setLocalStorage<Offer[]>('anika_offers', [...current, finalOffer]);
  
  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, 'offers', finalId), finalOffer);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `offers/${finalId}`);
    }
  }
}

export async function deleteOffer(id: string): Promise<void> {
  const current = getLocalStorage<Offer[]>('anika_offers', DEFAULT_OFFERS);
  const filtered = current.filter(item => item.id !== id);
  setLocalStorage<Offer[]>('anika_offers', filtered);
  
  if (!isMockFirebase) {
    try {
      await deleteDoc(doc(db, 'offers', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `offers/${id}`);
    }
  }
}

// 10. Appointments booking and reading
export async function getAppointments(): Promise<Appointment[]> {
  if (isMockFirebase) {
    return getLocalStorage<Appointment[]>('anika_appointments', []);
  }
  try {
    const snap = await getDocs(collection(db, 'appointments'));
    const appointments: Appointment[] = [];
    snap.forEach((docSnap) => {
      appointments.push({ ...(docSnap.data() as Appointment), id: docSnap.id });
    });
    // Sort reverse chronological
    return appointments.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'appointments');
    return getLocalStorage<Appointment[]>('anika_appointments', []);
  }
}

export async function addAppointment(appointment: Omit<Appointment, 'id'>): Promise<string> {
  const finalId = `appt-${Date.now()}`;
  const finalAppt = { ...appointment, id: finalId } as Appointment;
  
  const current = getLocalStorage<Appointment[]>('anika_appointments', []);
  setLocalStorage<Appointment[]>('anika_appointments', [finalAppt, ...current]);
  
  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, 'appointments', finalId), finalAppt);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `appointments/${finalId}`);
    }
  }
  return finalId;
}

export async function updateAppointmentStatus(id: string, status: 'pending' | 'accepted' | 'rejected'): Promise<void> {
  const current = getLocalStorage<Appointment[]>('anika_appointments', []);
  const updated = current.map(item => item.id === id ? { ...item, status } as Appointment : item);
  setLocalStorage<Appointment[]>('anika_appointments', updated);
  
  if (!isMockFirebase) {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `appointments/${id}`);
    }
  }
}

export async function deleteAppointment(id: string): Promise<void> {
  const current = getLocalStorage<Appointment[]>('anika_appointments', []);
  const filtered = current.filter(item => item.id !== id);
  setLocalStorage<Appointment[]>('anika_appointments', filtered);
  
  if (!isMockFirebase) {
    try {
      await deleteDoc(doc(db, 'appointments', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `appointments/${id}`);
    }
  }
}

// 11. Welcome Banner & Visual Builder Setup
import { VisualBuilderSettings, WebBuilderSection } from '../types';

export const DEFAULT_BUILDER_SECTIONS: WebBuilderSection[] = [
  {
    id: 'sec-hero',
    type: 'hero',
    name: 'Hero Section',
    visible: true,
    styles: {
      backgroundColor: '#0a0a0a',
      textColor: '#ffffff',
      fontFamily: 'Space Grotesk',
      fontSize: 'normal',
      fontWeight: 'normal',
      sectionWidth: 'full',
      sectionHeight: 'tall',
      padding: 'py-20 px-6',
      margin: 'my-0',
      borderRadius: '2xl',
      shadow: 'xl',
      animation: 'fade-in',
      hoverEffect: 'lift',
      layoutPosition: 'center'
    },
    content: {
      title: 'Anika Makeover Salon',
      subtitle: 'Where Luxury Meets Beauty & Elegant Styling',
      description: 'Gorakhpur\'s premier styling destination for brides and beauty aficionados.',
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80',
      overlayColor: '#000000',
      overlayOpacity: 0.6,
      buttons: [
        { id: 'btn2', text: 'Schedule Royal Styling', color: '#f59e0b', size: 'lg', icon: 'sparkles', link: '#booking' }
      ]
    }
  },
  {
    id: 'sec-offers',
    type: 'offers',
    name: 'Combo Offers Section',
    visible: true,
    styles: {
      backgroundColor: '#121212',
      textColor: '#ffffff',
      fontFamily: 'Space Grotesk',
      fontSize: 'normal',
      fontWeight: 'normal',
      sectionWidth: 'wide',
      sectionHeight: 'medium',
      padding: 'py-16 px-6',
      margin: 'my-0',
      borderRadius: '2xl',
      shadow: 'lg',
      animation: 'slide-up',
      hoverEffect: 'scale',
      layoutPosition: 'center'
    },
    content: {
      title: 'Curation & Highlights',
      subtitle: 'Exquisite Signature Treatments',
      description: 'Hand-picked beauty rituals combined to provide spectacular transformations.'
    }
  },
  {
    id: 'sec-about',
    type: 'about',
    name: 'About Section',
    visible: true,
    styles: {
      backgroundColor: '#0a0a0a',
      textColor: '#ffffff',
      fontFamily: 'Inter',
      fontSize: 'normal',
      fontWeight: 'normal',
      sectionWidth: 'wide',
      sectionHeight: 'medium',
      padding: 'py-16 px-6',
      margin: 'my-0',
      borderRadius: '2xl',
      shadow: 'none',
      animation: 'fade-in',
      hoverEffect: 'none',
      layoutPosition: 'center'
    },
    content: {
      title: 'The Artisan Identity',
      subtitle: 'Curating Power & Fine Beauty',
      description: 'Menka Singh is a verified high-end artist and beauty professional with over a decade of hands-on experience in transforming bridal portraits and global modern hairstyles.'
    }
  },
  {
    id: 'sec-services',
    type: 'services',
    name: 'Services Directory Section',
    visible: true,
    styles: {
      backgroundColor: '#121212',
      textColor: '#ffffff',
      fontFamily: 'Space Grotesk',
      fontSize: 'normal',
      fontWeight: 'normal',
      sectionWidth: 'wide',
      sectionHeight: 'medium',
      padding: 'py-16 px-6',
      margin: 'my-0',
      borderRadius: '3xl',
      shadow: 'xl',
      animation: 'fade-in',
      hoverEffect: 'lift',
      layoutPosition: 'center'
    },
    content: {
      title: 'The Treatment Menu',
      subtitle: 'Sought-After Luxury Solutions'
    }
  },
  {
    id: 'sec-gallery',
    type: 'gallery',
    name: 'Gallery Portfolio Section',
    visible: true,
    styles: {
      backgroundColor: '#0a0a0a',
      textColor: '#ffffff',
      fontFamily: 'Inter',
      fontSize: 'normal',
      fontWeight: 'normal',
      sectionWidth: 'wide',
      sectionHeight: 'medium',
      padding: 'py-16 px-6',
      margin: 'my-0',
      borderRadius: '2xl',
      shadow: 'lg',
      animation: 'fade-in',
      hoverEffect: 'none',
      layoutPosition: 'center'
    },
    content: {
      title: 'The Lookbook Vault',
      subtitle: 'Witness Flawless Glow Transformations'
    }
  },
  {
    id: 'sec-reviews',
    type: 'reviews',
    name: 'Reviews Section',
    visible: true,
    styles: {
      backgroundColor: '#121212',
      textColor: '#ffffff',
      fontFamily: 'Space Grotesk',
      fontSize: 'normal',
      fontWeight: 'normal',
      sectionWidth: 'wide',
      sectionHeight: 'medium',
      padding: 'py-16 px-6',
      margin: 'my-0',
      borderRadius: '2xl',
      shadow: 'lg',
      animation: 'slide-up',
      hoverEffect: 'lift',
      layoutPosition: 'center'
    },
    content: {
      title: 'Praise & Testimonials',
      subtitle: 'Shared Experiences of Our Esteemed Guests'
    }
  },
  {
    id: 'sec-instagram',
    type: 'instagram',
    name: 'Instagram Section',
    visible: true,
    styles: {
      backgroundColor: '#0a0a0a',
      textColor: '#ffffff',
      fontFamily: 'Inter',
      fontSize: 'normal',
      fontWeight: 'normal',
      sectionWidth: 'wide',
      sectionHeight: 'medium',
      padding: 'py-12 px-6',
      margin: 'my-0',
      borderRadius: '2xl',
      shadow: 'lg',
      animation: 'scale-up',
      hoverEffect: 'scale',
      layoutPosition: 'center'
    },
    content: {
      title: 'Instagram Social Spotlights',
      subtitle: '@AnikaMakeoverSalon.Gorakhpur'
    }
  },
  {
    id: 'sec-video',
    type: 'video',
    name: 'Video Showcase Section',
    visible: true,
    styles: {
      backgroundColor: '#0a0a0a',
      textColor: '#ffffff',
      fontFamily: 'Space Grotesk',
      fontSize: 'normal',
      fontWeight: 'normal',
      sectionWidth: 'wide',
      sectionHeight: 'medium',
      padding: 'py-12 px-6',
      margin: 'my-4',
      borderRadius: '2xl',
      shadow: 'xl',
      animation: 'fade-in',
      hoverEffect: 'none',
      layoutPosition: 'center'
    },
    content: {
      title: 'Royal Spa Video Walkthrough',
      subtitle: 'Step Inside our Beauty Sanctuary',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-beauty-treatment-in-a-salon-40431-large.mp4',
      videoAutoplay: true,
      videoMute: true,
      videoLoop: true
    }
  },
  {
    id: 'sec-faq',
    type: 'faq',
    name: 'FAQ Accordion Section',
    visible: true,
    styles: {
      backgroundColor: '#121212',
      textColor: '#ffffff',
      fontFamily: 'Inter',
      fontSize: 'normal',
      fontWeight: 'normal',
      sectionWidth: 'normal',
      sectionHeight: 'medium',
      padding: 'py-16 px-6',
      margin: 'my-4',
      borderRadius: '2xl',
      shadow: 'xl',
      animation: 'fade-in',
      hoverEffect: 'none',
      layoutPosition: 'center'
    },
    content: {
      title: 'Frequently Asked Questions',
      subtitle: 'Clear answers on reservations, safety rules and pricing customizations.',
      faqItems: [
        { question: 'What are your bridal booking guidelines?', answer: 'We recommend booking bridal makeover slots at least 2 to 4 months in advance. A 50% booking deposit is standard to secure dates.' },
        { question: 'What beauty lines/skin brands do you use?', answer: 'We strictly employ luxury, certified non-comedogenic cosmetics from MAC, Huda Beauty, Kryolan, and Estee Lauder to safeguard your delicate skin.' }
      ]
    }
  },
  {
    id: 'sec-pricing',
    type: 'pricing',
    name: 'Pricing Tier Section',
    visible: true,
    styles: {
      backgroundColor: '#0a0a0a',
      textColor: '#ffffff',
      fontFamily: 'Space Grotesk',
      fontSize: 'normal',
      fontWeight: 'normal',
      sectionWidth: 'wide',
      sectionHeight: 'medium',
      padding: 'py-16 px-6',
      margin: 'my-4',
      borderRadius: '3xl',
      shadow: 'xl',
      animation: 'slide-up',
      hoverEffect: 'lift',
      layoutPosition: 'center'
    },
    content: {
      title: 'Elegant Makeover Packages',
      subtitle: 'Transparent luxury pricing catering to royalty look demands',
      pricingItems: [
        { title: 'Standard Luxury Hairstyle & Shine', price: '₹2,499', description: 'Advanced scalp massage, hair volume conditioning & custom look styling.', features: ['Direct consultation', 'Keratin hydration wash', 'Blowdry & curls styling'] },
        { title: 'Super Bridal Sovereignty HD', price: '₹14,999', description: 'Our highest rated premium bridal program encompassing makeup, draping & helper.', features: ['HD Airbrush Makeup', 'Deluxe designer lehenga draping', 'Faux lashes & accessories styling', '1 complimentary look trial session'] }
      ]
    }
  },
  {
    id: 'sec-custom',
    type: 'custom',
    name: 'Custom Sections Creator',
    visible: true,
    styles: {
      backgroundColor: '#121212',
      textColor: '#ffffff',
      fontFamily: 'Space Grotesk',
      fontSize: 'normal',
      fontWeight: 'normal',
      sectionWidth: 'normal',
      sectionHeight: 'medium',
      padding: 'py-16 px-12',
      margin: 'my-4',
      borderRadius: '3xl',
      shadow: '2xl',
      animation: 'scale-up',
      hoverEffect: 'scale',
      layoutPosition: 'left'
    },
    content: {
      title: 'Custom Sanctuary Private Experience',
      subtitle: 'Private Styling Suites Specially Crafted',
      bodyMarkdown: 'At Anika Makeover Salon, privacy and comfort are our absolute goals. We offer private styling chambers equipped with warm ambient lights, aromatherapy, and private lounges to enable high-class bridal party experiences without external sounds or disruptions.',
      imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      buttons: [
        { id: 'btn3', text: 'Enquire Availability on WhatsApp', color: '#10b981', size: 'md', icon: 'phone', link: 'https://wa.me/917309999999' }
      ]
    }
  },
  {
    id: 'sec-booking',
    type: 'booking',
    name: 'Booking Integration Section',
    visible: true,
    styles: {
      backgroundColor: '#0a0a0a',
      textColor: '#ffffff',
      fontFamily: 'Space Grotesk',
      fontSize: 'normal',
      fontWeight: 'normal',
      sectionWidth: 'wide',
      sectionHeight: 'medium',
      padding: 'py-16 px-6',
      margin: 'my-0',
      borderRadius: '2xl',
      shadow: 'xl',
      animation: 'fade-in',
      hoverEffect: 'none',
      layoutPosition: 'center'
    },
    content: {
      title: 'Curate Your Appointment',
      subtitle: 'Exquisite Private Styling Suites Await'
    }
  },
  {
    id: 'sec-contact',
    type: 'contact',
    name: 'Contact Map Location Section',
    visible: true,
    styles: {
      backgroundColor: '#121212',
      textColor: '#ffffff',
      fontFamily: 'Inter',
      fontSize: 'normal',
      fontWeight: 'normal',
      sectionWidth: 'full',
      sectionHeight: 'medium',
      padding: 'py-12 px-6',
      margin: 'my-0',
      borderRadius: 'none',
      shadow: 'none',
      animation: 'fade-in',
      hoverEffect: 'none',
      layoutPosition: 'center'
    },
    content: {
      title: 'Visit The Sanctuary',
      subtitle: 'Budh Vihar Part-C, Near By Pani Ki Tanki, Gaighat Road, Taramandal, Gorakhpur'
    }
  }
];

export const DEFAULT_WELCOME_BANNER: WelcomeBanner = {
  visible: true,
  title: "Transform Your Beauty With Anika's Expert Care",
  subtitle: "Luxury Makeovers • Bridal Royalty Services • Custom Hair & Glow Therapy",
  bgImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80",
  bgVideo: "",
  buttonText: "Claim Monsoon Offer",
  buttonLink: "#booking",
  height: "short",
  overlayColor: "#050505",
  overlayOpacity: 0.5,
  textColor: "#ffffff",
  buttonBgColor: "#eab308",
  buttonTextColor: "#000000"
};

export const DEFAULT_HERO_BANNER: HeroBanner = {
  heroBgImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80",
  heroHeading: "Anika Makeover Salon",
  heroSubheading: "Elevate Your Natural Radiance & Beauty",
  heroBtnAppointmentText: "Book Appointment",
  heroBtnAppointmentLink: "#booking",
  heroBtnWhatsAppText: "WhatsApp",
  heroBtnWhatsAppLink: "",
  heroBtnInstagramText: "Instagram",
  heroBtnInstagramLink: ""
};

export const DEFAULT_VISUAL_BUILDER: VisualBuilderSettings = {
  sectionsText: {
    hero: {
      heading: "Anika Makeover Salon",
      subheading: "Where Luxury Meets Beauty & Elegant Styling",
      buttonText: "Schedule Royal Styling",
      buttonLink: "#booking"
    },
    promotions: {
      heading: "Curation & Highlights",
      subheading: "Exquisite Signature Treatments"
    },
    owner: {
      heading: "The Artisan Identity",
      subheading: "Curating Power & Fine Beauty",
      ownerName: "Menka Singh",
      ownerTitle: "Beauty Director",
      ownerBio: "Menka Singh is a verified high-end artist and beauty professional with over a decade of hands-on experience in transforming bridal portraits and global modern hairstyles. Renowned for her delicate and customized visual look matching, she established Anika Makeover Salon in Gorakhpur to cultivate a brand where self-care is elevated to absolute art.",
      ownerMsg: "Designing hair, makeup, and skin routines shouldn't just be a treatment—it's an exploration of your premium authentic beauty. Our mission at Anika Makeover Salon is to make you walk out feeling unmatched, confident, and stunningly powerful."
    },
    services: {
      heading: "The Treatment Menu",
      subheading: "Sought-After Luxury Solutions"
    },
    gallery: {
      heading: "The Lookbook Vault",
      subheading: "Witness Flawless Glow Transformations"
    },
    reviews: {
      heading: "Praise & Testimonials",
      subheading: "Shared Experiences of Our Esteemed Guests"
    },
    booking: {
      heading: "Curate Your Appointment",
      subheading: "Exquisite Private Styling Suites Await",
      buttonText: "Register Consultation"
    },
    contact: {
      heading: "Visit The Sanctuary",
      subheading: "Budh Vihar Part-C, Near By Pani Ki Tanki, Gaighat Road, Taramandal, Gorakhpur"
    },
    footer: {
      footerText: "Gorakhpur\'s premiere styling house. Personalized bridal transforms, premium aesthetic designs, and deep skin wellness therapies driven by craft.",
      copyrightText: "© 2026 Anika Makeover. All Sovereign Rights Reserved."
    }
  },
  visibility: {
    welcomeBanner: true,
    announcementBar: true,
    hero: true,
    promotions: true,
    owner: true,
    services: true,
    gallery: true,
    reviews: true,
    booking: true,
    contact: true,
    footer: true,
  },
  styles: {
    fontHeader: "Space Grotesk",
    fontBody: "Inter",
    colorBg: "#0a0a0a",
    colorCard: "#121212", 
    colorTextPrimary: "#ffffff",
    colorTextSecondary: "#a3a3a3",
    colorAccent: "#f59e0b",
    colorButtonBg: "#f59e0b",
    colorButtonText: "#000000",
    borderRadius: '2xl',
    shadow: 'xl',
    spacingSize: 'comfortable',
    buttonStyle: 'solid',
    hoverStyle: 'lift',
    enableAnimations: true,
    animationSpeed: 'normal',
    heroHeight: 'large'
  },
  globalSettings: {
    websiteName: "Anika Makeover Salon",
    logoUrl: "",
    faviconUrl: "",
    themePrimary: "#f59e0b",
    themeSecondary: "#000000",
    typographyHeader: "Space Grotesk",
    typographyBody: "Inter",
    footerText: "Gorakhpur's premiere styling house. Personalized bridal transforms, premium aesthetic designs, and deep skin wellness therapies driven by craft.",
    copyrightText: "© 2026 Anika Makeover. All Sovereign Rights Reserved.",
    metaTitle: "Anika Makeover Salon | Gorakhpur's Luxe Bridal & Hairstyle Destination",
    metaDesc: "Anika Makeover Salon in Gorakhpur offers exclusive bridal makeup, hair styling, skin services, and premium care.",
    navMenu: [
      { id: 'nav1', label: 'Home', link: '#home' },
      { id: 'nav2', label: 'Services', link: '#services' },
      { id: 'nav3', label: 'About', link: '#about' },
      { id: 'nav4', label: 'Gallery', link: '#gallery' },
      { id: 'nav5', label: 'Reviews', link: '#reviews' },
      { id: 'nav6', label: 'Book Consultation', link: '#booking' }
    ]
  },
  mediaLibrary: [
    { id: 'm1', name: 'Premium Hair Spa Therapy', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', type: 'image', size: '254 KB', createdAt: '2026-06-08' },
    { id: 'm2', name: 'Bridal Makeover Elegance', url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80', type: 'image', size: '341 KB', createdAt: '2026-06-08' },
    { id: 'm3', name: 'Luxe Skin Wellness Glow', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80', type: 'image', size: '198 KB', createdAt: '2026-06-08' },
    { id: 'm4', name: 'Sample Promotional Video B-Roll', url: 'https://assets.mixkit.co/videos/preview/mixkit-beauty-treatment-in-a-salon-40431-large.mp4', type: 'video', size: '4.8 MB', createdAt: '2026-06-08' }
  ],
  sections: DEFAULT_BUILDER_SECTIONS
};

export async function getWelcomeBanner(): Promise<WelcomeBanner> {
  if (isMockFirebase) {
    return getLocalStorage<WelcomeBanner>('anika_welcome_banner', DEFAULT_WELCOME_BANNER);
  }
  try {
    const docRef = doc(db, 'welcomeBanner', 'main');
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      try {
        await setDoc(docRef, DEFAULT_WELCOME_BANNER);
      } catch (writeErr) {
        console.warn("Seeding welcomeBanner/main skipped:", writeErr);
      }
      return DEFAULT_WELCOME_BANNER;
    }
    return { ...DEFAULT_WELCOME_BANNER, ...snap.data() } as WelcomeBanner;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'welcomeBanner/main');
    return getLocalStorage<WelcomeBanner>('anika_welcome_banner', DEFAULT_WELCOME_BANNER);
  }
}

export async function updateWelcomeBanner(banner: WelcomeBanner): Promise<void> {
  setLocalStorage<WelcomeBanner>('anika_welcome_banner', banner);
  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, 'welcomeBanner', 'main'), banner);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'welcomeBanner/main');
    }
  }
}

export async function getHeroBanner(): Promise<HeroBanner> {
  if (isMockFirebase) {
    return getLocalStorage<HeroBanner>('anika_hero_banner', DEFAULT_HERO_BANNER);
  }
  try {
    const docRef = doc(db, 'heroBanner', 'main');
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      try {
        await setDoc(docRef, DEFAULT_HERO_BANNER);
      } catch (writeErr) {
        console.warn("Seeding heroBanner/main skipped:", writeErr);
      }
      return DEFAULT_HERO_BANNER;
    }
    return { ...DEFAULT_HERO_BANNER, ...snap.data() } as HeroBanner;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'heroBanner/main');
    return getLocalStorage<HeroBanner>('anika_hero_banner', DEFAULT_HERO_BANNER);
  }
}

export async function updateHeroBanner(banner: HeroBanner): Promise<void> {
  setLocalStorage<HeroBanner>('anika_hero_banner', banner);
  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, 'heroBanner', 'main'), banner);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'heroBanner/main');
    }
  }
}

export async function getVisualBuilder(): Promise<VisualBuilderSettings> {
  if (isMockFirebase) {
    return getLocalStorage<VisualBuilderSettings>('anika_visual_builder', DEFAULT_VISUAL_BUILDER);
  }
  try {
    const docRef = doc(db, 'settings', 'visualBuilder');
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      try {
        await setDoc(docRef, DEFAULT_VISUAL_BUILDER);
      } catch (writeErr) {
        console.warn("Seeding settings/visualBuilder skipped:", writeErr);
      }
      return DEFAULT_VISUAL_BUILDER;
    }
    const data = snap.data();
    // Deep merge to ensure all sections structure is present
    return {
      sectionsText: { ...DEFAULT_VISUAL_BUILDER.sectionsText, ...(data.sectionsText || {}) },
      visibility: { ...DEFAULT_VISUAL_BUILDER.visibility, ...(data.visibility || {}) },
      styles: { ...DEFAULT_VISUAL_BUILDER.styles, ...(data.styles || {}) },
      globalSettings: { ...DEFAULT_VISUAL_BUILDER.globalSettings, ...(data.globalSettings || {}) },
      mediaLibrary: data.mediaLibrary || DEFAULT_VISUAL_BUILDER.mediaLibrary,
      sections: data.sections || DEFAULT_VISUAL_BUILDER.sections
    } as VisualBuilderSettings;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'settings/visualBuilder');
    return getLocalStorage<VisualBuilderSettings>('anika_visual_builder', DEFAULT_VISUAL_BUILDER);
  }
}

export async function updateVisualBuilder(cfg: VisualBuilderSettings): Promise<void> {
  setLocalStorage<VisualBuilderSettings>('anika_visual_builder', cfg);
  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, 'settings', 'visualBuilder'), cfg);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'settings/visualBuilder');
    }
  }
}

export async function getAdminPasswordHash(): Promise<string> {
  const defaultHash = 'b2c560e37831084040b8e7ad0b98a39e79b4b3d85491c71984a52a9c81fa5303'; // Correct SHA-256 for MenkaSingh1525
  const oldIncorrectHash = 'b4d3f3f58a36c5356ffc59a5d3f231e3d001eb70428d0859a85bc0fc8cf4418f'; // Faulty representation
  
  if (isMockFirebase) {
    const currentLocal = getLocalStorage<string>('anika_admin_hash', defaultHash);
    if (currentLocal === oldIncorrectHash) {
      setLocalStorage<string>('anika_admin_hash', defaultHash);
      return defaultHash;
    }
    return currentLocal;
  }
  try {
    const docRef = doc(db, 'settings', 'adminAuth');
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      try {
        await setDoc(docRef, { hash: defaultHash });
      } catch (writeErr) {
        console.warn("Seeding settings/adminAuth skipped:", writeErr);
      }
      return defaultHash;
    }
    const storedHash = snap.data().hash || defaultHash;
    if (storedHash === oldIncorrectHash) {
      // Correct existing stored old hash on-the-fly to prevent lockouts
      try {
        await setDoc(docRef, { hash: defaultHash });
      } catch (writeErr) {
        console.warn("Seeding settings/adminAuth update skipped:", writeErr);
      }
      return defaultHash;
    }
    return storedHash;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'settings/adminAuth');
    const currentLocal = getLocalStorage<string>('anika_admin_hash', defaultHash);
    if (currentLocal === oldIncorrectHash) {
      setLocalStorage<string>('anika_admin_hash', defaultHash);
      return defaultHash;
    }
    return currentLocal;
  }
}

export async function updateAdminPasswordHash(newHash: string): Promise<void> {
  setLocalStorage<string>('anika_admin_hash', newHash);
  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, 'settings', 'adminAuth'), { hash: newHash });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'settings/adminAuth');
    }
  }
}

// ==========================================
// INSTAGRAM MANAGER PERSISTENCE SERVICES
// ==========================================

const DEFAULT_INSTAGRAM_SETTINGS: InstagramSettings = {
  profileUrl: "https://instagram.com/anikamakeover45",
  followButtonLink: "https://instagram.com/anikamakeover45",
  username: "anikamakeover45",
  heading: "Join Our Visual Instagram Journey",
  description: "Live Feed Showcase"
};

const DEFAULT_INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: "ig-1",
    image: "https://images.unsplash.com/photo-1610030469668-9253339a91a8?auto=format&fit=crop&w=400&q=80",
    title: "Elegant Hair Styling",
    likes: "1,420",
    comments: "105",
    order: 1,
    visible: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "ig-2",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=400&q=80",
    title: "Flawless Airbrush Base Makeup",
    likes: "985",
    comments: "64",
    order: 2,
    visible: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "ig-3",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400&q=80",
    title: "Classic Bridal Portrait",
    likes: "2,110",
    comments: "250",
    order: 3,
    visible: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "ig-4",
    image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=400&q=80",
    title: "Glitter Eyeshadow detailing",
    likes: "1,150",
    comments: "88",
    order: 4,
    visible: true,
    createdAt: new Date().toISOString()
  }
];

export async function getInstagramSettings(): Promise<InstagramSettings> {
  if (isMockFirebase) {
    return getLocalStorage<InstagramSettings>('anika_instagram_settings', DEFAULT_INSTAGRAM_SETTINGS);
  }
  try {
    const docRef = doc(db, 'instagramSettings', 'main');
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      try {
        await setDoc(docRef, DEFAULT_INSTAGRAM_SETTINGS);
      } catch (writeErr) {
        console.warn("Seeding instagramSettings/main skipped:", writeErr);
      }
      return DEFAULT_INSTAGRAM_SETTINGS;
    }
    return { ...DEFAULT_INSTAGRAM_SETTINGS, ...snap.data() } as InstagramSettings;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'instagramSettings/main');
    return getLocalStorage<InstagramSettings>('anika_instagram_settings', DEFAULT_INSTAGRAM_SETTINGS);
  }
}

export async function updateInstagramSettings(settings: InstagramSettings): Promise<void> {
  setLocalStorage<InstagramSettings>('anika_instagram_settings', settings);
  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, 'instagramSettings', 'main'), settings);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'instagramSettings/main');
    }
  }
}

export async function getInstagramPosts(): Promise<InstagramPost[]> {
  if (isMockFirebase) {
    const local = getLocalStorage<InstagramPost[]>('anika_instagram_posts', DEFAULT_INSTAGRAM_POSTS);
    return local.sort((a, b) => a.order - b.order);
  }
  try {
    const snap = await getDocs(collection(db, 'instagramPosts'));
    const hasBeenSeededLocally = localStorage.getItem('anika_instagram_posts_seeded') === 'true';
    if (snap.empty && !hasBeenSeededLocally) {
      localStorage.setItem('anika_instagram_posts_seeded', 'true');
      for (const item of DEFAULT_INSTAGRAM_POSTS) {
        try {
          await setDoc(doc(db, 'instagramPosts', item.id), item);
        } catch (writeErr) {
          console.warn(`Seeding instagramPosts/${item.id} skipped:`, writeErr);
        }
      }
      setLocalStorage<InstagramPost[]>('anika_instagram_posts', DEFAULT_INSTAGRAM_POSTS);
      return DEFAULT_INSTAGRAM_POSTS;
    }
    const posts: InstagramPost[] = [];
    snap.forEach((docSnap) => {
      posts.push({ ...(docSnap.data() as InstagramPost), id: docSnap.id });
    });
    localStorage.setItem('anika_instagram_posts_seeded', 'true');
    const sorted = posts.sort((a, b) => a.order - b.order);
    setLocalStorage<InstagramPost[]>('anika_instagram_posts', sorted);
    return sorted;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'instagramPosts');
    return getLocalStorage<InstagramPost[]>('anika_instagram_posts', DEFAULT_INSTAGRAM_POSTS).sort((a, b) => a.order - b.order);
  }
}

export async function saveInstagramPost(post: InstagramPost): Promise<void> {
  const current = await getInstagramPosts();
  const existingIdx = current.findIndex(p => p.id === post.id);
  let updated: InstagramPost[];
  if (existingIdx > -1) {
    updated = current.map(p => p.id === post.id ? post : p);
  } else {
    updated = [...current, post];
  }
  setLocalStorage<InstagramPost[]>('anika_instagram_posts', updated);

  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, 'instagramPosts', post.id), post);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `instagramPosts/${post.id}`);
    }
  }
}

export async function deleteInstagramPost(id: string): Promise<void> {
  const current = await getInstagramPosts();
  const updated = current.filter(p => p.id !== id);
  setLocalStorage<InstagramPost[]>('anika_instagram_posts', updated);

  if (!isMockFirebase) {
    try {
      await deleteDoc(doc(db, 'instagramPosts', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `instagramPosts/${id}`);
    }
  }
}

export async function reorderInstagramPosts(posts: InstagramPost[]): Promise<void> {
  const ordered = posts.map((p, idx) => ({ ...p, order: idx + 1 }));
  setLocalStorage<InstagramPost[]>('anika_instagram_posts', ordered);

  if (!isMockFirebase) {
    for (const post of ordered) {
      try {
        await setDoc(doc(db, 'instagramPosts', post.id), post);
      } catch (e) {
        console.error(`Failed to update order for post ${post.id}:`, e);
      }
    }
  }
}

export async function getInstagramVideos(): Promise<InstagramVideo[]> {
  if (isMockFirebase) {
    return getLocalStorage<InstagramVideo[]>('anika_instagram_videos', []);
  }
  try {
    const snap = await getDocs(collection(db, 'instagramVideos'));
    const videos: InstagramVideo[] = [];
    snap.forEach((docSnap) => {
      videos.push({ ...(docSnap.data() as InstagramVideo), id: docSnap.id });
    });
    setLocalStorage<InstagramVideo[]>('anika_instagram_videos', videos);
    return videos;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'instagramVideos');
    return getLocalStorage<InstagramVideo[]>('anika_instagram_videos', []);
  }
}

export async function saveInstagramVideo(video: InstagramVideo): Promise<void> {
  const current = await getInstagramVideos();
  const existingIdx = current.findIndex(v => v.id === video.id);
  let updated: InstagramVideo[];
  if (existingIdx > -1) {
    updated = current.map(v => v.id === video.id ? video : v);
  } else {
    updated = [...current, video];
  }
  setLocalStorage<InstagramVideo[]>('anika_instagram_videos', updated);

  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, 'instagramVideos', video.id), video);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `instagramVideos/${video.id}`);
    }
  }
}

export async function deleteInstagramVideo(id: string): Promise<void> {
  const current = await getInstagramVideos();
  const updated = current.filter(v => v.id !== id);
  setLocalStorage<InstagramVideo[]>('anika_instagram_videos', updated);

  if (!isMockFirebase) {
    try {
      await deleteDoc(doc(db, 'instagramVideos', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `instagramVideos/${id}`);
    }
  }
}

export async function getInstagramReels(): Promise<InstagramReel[]> {
  if (isMockFirebase) {
    return getLocalStorage<InstagramReel[]>('anika_instagram_reels', []);
  }
  try {
    const snap = await getDocs(collection(db, 'instagramReels'));
    const reels: InstagramReel[] = [];
    snap.forEach((docSnap) => {
      reels.push({ ...(docSnap.data() as InstagramReel), id: docSnap.id });
    });
    setLocalStorage<InstagramReel[]>('anika_instagram_reels', reels);
    return reels;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'instagramReels');
    return getLocalStorage<InstagramReel[]>('anika_instagram_reels', []);
  }
}

export async function saveInstagramReel(reel: InstagramReel): Promise<void> {
  const current = await getInstagramReels();
  const existingIdx = current.findIndex(r => r.id === reel.id);
  let updated: InstagramReel[];
  if (existingIdx > -1) {
    updated = current.map(r => r.id === reel.id ? reel : r);
  } else {
    updated = [...current, reel];
  }
  setLocalStorage<InstagramReel[]>('anika_instagram_reels', updated);

  if (!isMockFirebase) {
    try {
      await setDoc(doc(db, 'instagramReels', reel.id), reel);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `instagramReels/${reel.id}`);
    }
  }
}

export async function deleteInstagramReel(id: string): Promise<void> {
  const current = await getInstagramReels();
  const updated = current.filter(r => r.id !== id);
  setLocalStorage<InstagramReel[]>('anika_instagram_reels', updated);

  if (!isMockFirebase) {
    try {
      await deleteDoc(doc(db, 'instagramReels', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `instagramReels/${id}`);
    }
  }
}


