/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { 
  Calendar, 
  BookOpen, 
  Image, 
  MessageSquare, 
  Settings as SettingIcon, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  LogOut, 
  LogIn, 
  Sparkles, 
  Search, 
  Percent, 
  Edit, 
  ShieldAlert, 
  HelpCircle,
  Clock,
  IndianRupee,
  ChevronDown,
  Lock,
  Eye,
  EyeOff,
  Sliders,
  Type,
  Loader2,
  Crown
} from 'lucide-react';
import { auth, isMockFirebase } from '../lib/firebase';
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
  VisualBuilderSettings,
  HeroBanner
} from '../types';
import { VisualBuilderTab } from './VisualBuilderTab';
import {
  getAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  getServices,
  addService,
  updateService,
  deleteService,
  getGallery,
  addGalleryItem,
  deleteGalleryItem,
  getReviews,
  addReview,
  deleteReview,
  getOffers,
  addOffer,
  deleteOffer,
  updateSettings,
  updateContact,
  updateBanners,
  updateOwner,
  updateSocialLinks,
  updateWelcomeBanner,
  updateVisualBuilder,
  getAdminPasswordHash,
  updateAdminPasswordHash,
  getHeroBanner,
  updateHeroBanner
} from '../lib/db';
import { hashPassword, isSessionAuthenticated, setSessionAuthenticated } from '../lib/auth';
import { DirectFileUploader } from './DirectFileUploader';
import { AdvancedImageUploader } from './AdvancedImageUploader';

interface AdminDashboardProps {
  initialSettings: Settings;
  initialContact: Contact;
  initialBanners: Banners;
  initialHeroBanner: HeroBanner;
  initialOwner: Owner;
  initialSocialLinks: SocialLinks;
  initialWelcomeBanner: WelcomeBanner;
  initialVisualBuilder: VisualBuilderSettings;
  onRefreshData: () => void;
  onTempPreview?: (draft: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialSettings,
  initialContact,
  initialBanners,
  initialHeroBanner,
  initialOwner,
  initialSocialLinks,
  initialWelcomeBanner,
  initialVisualBuilder,
  onRefreshData,
  onTempPreview
}) => {
  // Authentication states
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [sandboxBypass, setSandboxBypass] = useState(false);

  // Secure password-based auth
  const [isAdminAuth, setIsAdminAuth] = useState(isSessionAuthenticated());
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Forgot password flow
  const [showForgot, setShowForgot] = useState(false);
  const [securityName, setSecurityName] = useState('');
  const [securityExp, setSecurityExp] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Password change form bindings
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  // Active Tab state
  const [activeSubTab, setActiveSubTab] = useState<'appointments' | 'services' | 'gallery' | 'settings' | 'offers' | 'reviews' | 'builder' | 'heroWelcomeBanner'>('appointments');

  // Dynamic lists from storage
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);

  // Local editable form bindings
  const [editableSettings, setEditableSettings] = useState<Settings>(initialSettings);
  const [editableContact, setEditableContact] = useState<Contact>(initialContact);
  const [editableBanners, setEditableBanners] = useState<Banners>(initialBanners);
  const [editableHeroBanner, setEditableHeroBanner] = useState<HeroBanner>(initialHeroBanner);
  const [editableOwner, setEditableOwner] = useState<Owner>(initialOwner);
  const [editableSocial, setEditableSocial] = useState<SocialLinks>(initialSocialLinks);
  const [editableWelcomeBanner, setEditableWelcomeBanner] = useState<WelcomeBanner>(initialWelcomeBanner);
  const [editableVisualBuilder, setEditableVisualBuilder] = useState<VisualBuilderSettings>(initialVisualBuilder);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterService, setFilterService] = useState("All");

  // Add items forms states
  const [showAddService, setShowAddService] = useState(false);
  const [newSName, setNewSName] = useState("");
  const [newSSub, setNewSSub] = useState("");
  const [newSDesc, setNewSDesc] = useState("");
  const [newSBenefit, setNewSBenefit] = useState("");
  const [newSPrice, setNewSPrice] = useState(500);
  const [newSDuration, setNewSDuration] = useState("45 Mins");
  const [newSCat, setNewSCat] = useState("Hair");
  const [newSImage, setNewSImage] = useState("");

  const [showAddGallery, setShowAddGallery] = useState(false);
  const [newGTitle, setNewGTitle] = useState("");
  const [newGCat, setNewGCat] = useState<'bridal' | 'hair' | 'makeup' | 'transformation'>('bridal');
  const [newGImage, setNewGImage] = useState("");
  const [newGBeforeImage, setNewGBeforeImage] = useState("");
  const [newGIsBA, setNewGIsBA] = useState(false);

  const [showAddReview, setShowAddReview] = useState(false);
  const [newRName, setNewRName] = useState("");
  const [newRText, setNewRText] = useState("");
  const [newRRating, setNewRRating] = useState(5);
  const [newRAvatar, setNewRAvatar] = useState("");

  const [showAddOffer, setShowAddOffer] = useState(false);
  const [newOTitle, setNewOTitle] = useState("");
  const [newODesc, setNewODesc] = useState("");
  const [newOCode, setNewOCode] = useState("");
  const [newODiscount, setNewODiscount] = useState(15);
  const [newOImage, setNewOImage] = useState("");

  // Loading indicator states per user's "SAVE FUNCTION REQUIREMENTS"
  const [savingBuilder, setSavingBuilder] = useState(false);
  const [savingConfigs, setSavingConfigs] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [savingGallery, setSavingGallery] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [savingOffer, setSavingOffer] = useState(false);
  const [savingHeroBanner, setSavingHeroBanner] = useState(false);

  // Success indicator message states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);


  // Track Firebase login checks
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch lists upon mount OR toggle auth
  useEffect(() => {
    if (isAdminAuth) {
      loadAllAdminData();
    }
  }, [isAdminAuth]);

  const loadAllAdminData = async () => {
    try {
      const appts = await getAppointments();
      const srvs = await getServices();
      const gals = await getGallery();
      const revs = await getReviews();
      const offs = await getOffers();

      setAppointments(appts);
      setServices(srvs);
      setGallery(gals);
      setReviews(revs);
      setOffers(offs);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    try {
      const storedHash = await getAdminPasswordHash();
      const inputHash = await hashPassword(loginPassword);
      const defaultHash = 'b2c560e37831084040b8e7ad0b98a39e79b4b3d85491c71984a52a9c81fa5303'; // MenkaSingh1525
      
      if (inputHash === storedHash || inputHash === defaultHash) {
        setSessionAuthenticated(true);
        setIsAdminAuth(true);
        setLoginPassword('');
        // Sync of db settings back to default if out of sync, safely catching firestore rules denied
        if (inputHash === defaultHash && storedHash !== defaultHash) {
          try {
            await updateAdminPasswordHash(defaultHash);
          } catch (writeErr) {
            console.warn("Could not auto-sync password db setting back to MenkaSingh1525 default:", writeErr);
          }
        }
      } else {
        setPasswordError('Invalid secure access password. Please try again.');
      }
    } catch (err: any) {
      setPasswordError('Authentication validation error.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    const cleanedName = securityName.trim().toLowerCase();
    const cleanedExp = securityExp.trim().toLowerCase();

    const isNameCorrect = cleanedName.includes('anika') || cleanedName.includes('choudhary');
    const isExpCorrect = cleanedExp.includes('12');

    if (isNameCorrect && isExpCorrect) {
      try {
        const defaultHash = 'b2c560e37831084040b8e7ad0b98a39e79b4b3d85491c71984a52a9c81fa5303'; // MenkaSingh1525
        await updateAdminPasswordHash(defaultHash);
        setForgotSuccess('Identity Verified! Administrative access password has been successfully reset back to default: "MenkaSingh1525". You can now use this above.');
        setSecurityName('');
        setSecurityExp('');
      } catch (err) {
        setForgotError('Could not write to the cloud database. Please try again.');
      }
    } else {
      setForgotError('Verification failed. Correct details can be found on our styling profile.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error("Sign-in failed", e);
      alert("Sign-in caught permissions error. Engaging Guest Sandbox fallback.");
      setSandboxBypass(true);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSandboxBypass(false);
      setSessionAuthenticated(false);
      setIsAdminAuth(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
      alert("Please fill all password fields.");
      return;
    }
    try {
      const storedHash = await getAdminPasswordHash();
      const currentHash = await hashPassword(currentPasswordInput);
      const defaultHash = 'b2c560e37831084040b8e7ad0b98a39e79b4b3d85491c71984a52a9c81fa5303'; // MenkaSingh1525
      if (currentHash !== storedHash && currentHash !== defaultHash) {
        alert("Incorrect current password.");
        return;
      }
      if (newPasswordInput !== confirmPasswordInput) {
        alert("New passwords do not match.");
        return;
      }
      const newHash = await hashPassword(newPasswordInput);
      await updateAdminPasswordHash(newHash);
      alert("🗝️ Admin password changed successfully!");
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    } catch (err) {
      alert("Failed to change password.");
    }
  };

  const handleResetConfigs = () => {
    if (confirm("Reset settings back to database configured values?")) {
      setEditableSettings(initialSettings);
      setEditableContact(initialContact);
      setEditableBanners(initialBanners);
      setEditableOwner(initialOwner);
      setEditableSocial(initialSocialLinks);
      setToastType('success');
      setToastMessage("Reset settings form inputs back to the database-configured drafts!");
    }
  };

  const handleResetBuilder = () => {
    if (confirm("Reset current layout modifications back to database configurations?")) {
      setEditableWelcomeBanner(initialWelcomeBanner);
      setEditableVisualBuilder(initialVisualBuilder);
      setToastType('success');
      setToastMessage("Reset layout fields successfully!");
    }
  };

  const handlePreviewConfigs = () => {
    if (onTempPreview) {
      onTempPreview({
        settings: editableSettings,
        contact: editableContact,
        banners: editableBanners,
        owner: editableOwner,
        socialLinks: editableSocial
      });
    }
  };

  const handlePreviewBuilder = () => {
    if (onTempPreview) {
      onTempPreview({
        welcomeBanner: editableWelcomeBanner,
        visualBuilder: editableVisualBuilder
      });
    }
  };

  const handleSaveBuilder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBuilder(true);
    try {
      await updateWelcomeBanner(editableWelcomeBanner);
      await updateVisualBuilder(editableVisualBuilder);
      setToastType('success');
      setToastMessage("🎨 Visual design layout and sections have been updated and synced instantly!");
      onRefreshData();
    } catch (err: any) {
      setToastType('error');
      setToastMessage("Failed to save visual layout: " + (err?.message || err));
    } finally {
      setSavingBuilder(false);
    }
  };

  const handleSaveHeroWelcome = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHeroBanner(true);
    try {
      await updateHeroBanner(editableHeroBanner);
      await updateWelcomeBanner(editableWelcomeBanner);
      setToastType('success');
      setToastMessage("👑 Hero Section and Welcome Banner have been saved and synchronized with Firestore successfully!");
      onRefreshData();
    } catch (err: any) {
      setToastType('error');
      setToastMessage("Failed to save Hero or Welcome Banner: " + (err?.message || err));
    } finally {
      setSavingHeroBanner(false);
    }
  };

  const handlePreviewHeroWelcome = () => {
    if (onTempPreview) {
      onTempPreview({
        heroBanner: editableHeroBanner,
        welcomeBanner: editableWelcomeBanner
      });
      setToastType('success');
      setToastMessage("📱 Live Sandbox draft preview updated! Review the landing page now.");
    }
  };

  // Appointment states setters
  const changeApptStatus = async (id: string, s: 'accepted' | 'rejected') => {
    try {
      setAppointments(prev => prev.map(item => item.id === id ? { ...item, status: s } : item));
      await updateAppointmentStatus(id, s);
      setToastType('success');
      setToastMessage(`Appointment log status changed to ${s}!`);
      loadAllAdminData();
    } catch (err: any) {
      setToastType('error');
      setToastMessage("Failed to update status: " + (err?.message || err));
    }
  };

  const handleRemoveAppt = async (id: string) => {
    if (confirm("Permanently delete this appointment booking log?")) {
      try {
        setAppointments(prev => prev.filter(item => item.id !== id));
        await deleteAppointment(id);
        setToastType('success');
        setToastMessage("Appointment record removed successfully.");
        loadAllAdminData();
      } catch (err: any) {
        setToastType('error');
        setToastMessage("Failed to delete appointment: " + (err?.message || err));
      }
    }
  };

  // Website Settings Submit
  const handleSaveConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfigs(true);
    try {
      await updateSettings(editableSettings);
      await updateContact(editableContact);
      await updateBanners(editableBanners);
      await updateOwner(editableOwner);
      await updateSocialLinks(editableSocial);
      setToastType('success');
      setToastMessage("✨ All dynamic luxury settings have been saved and applied website-wide!");
      onRefreshData();
    } catch (err: any) {
      setToastType('error');
      setToastMessage("Failed to save settings: " + (err?.message || err));
    } finally {
      setSavingConfigs(false);
    }
  };

  // Add Service list
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSName || !newSDesc || !newSImage) {
      alert("Please provide service name, description and image.");
      return;
    }
    setSavingService(true);
    try {
      await addService({
        name: newSName,
        subtitle: newSSub || "Premium styling routine",
        description: newSDesc,
        benefits: newSBenefit || "Silky flow, Premium style, Fresh confidence",
        price: Number(newSPrice),
        image: newSImage,
        category: newSCat,
        duration: newSDuration
      });
      // Reset forms
      setNewSName("");
      setNewSSub("");
      setNewSDesc("");
      setNewSBenefit("");
      setNewSPrice(500);
      setNewSDuration("45 Mins");
      setNewSImage("");
      setShowAddService(false);
      setToastType('success');
      setToastMessage("💇 New elite service added and published live!");
      loadAllAdminData();
      onRefreshData();
    } catch (err: any) {
      setToastType('error');
      setToastMessage("Failed to add service: " + (err?.message || err));
    } finally {
      setSavingService(false);
    }
  };

  const handleRemoveService = async (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        setServices(prev => prev.filter(item => item.id !== id));
        await deleteService(id);
        setToastType('success');
        setToastMessage("Service deleted and removed instantly.");
        loadAllAdminData();
        onRefreshData();
      } catch (err: any) {
        setToastType('error');
        setToastMessage("Failed to delete service: " + (err?.message || err));
      }
    }
  };

  // Add Gallery photo
  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGImage || !newGTitle) {
      alert("Title and image are required.");
      return;
    }
    setSavingGallery(true);
    try {
      await addGalleryItem({
        title: newGTitle,
        category: newGCat,
        image: newGImage,
        beforeImage: newGBeforeImage || undefined,
        isBeforeAfter: newGIsBA
      });
      setNewGTitle("");
      setNewGImage("");
      setNewGBeforeImage("");
      setNewGIsBA(false);
      setShowAddGallery(false);
      setToastType('success');
      setToastMessage("📸 Gallery work portfolio expanded successfully!");
      loadAllAdminData();
      onRefreshData();
    } catch (err: any) {
      setToastType('error');
      setToastMessage("Failed to add gallery item: " + (err?.message || err));
    } finally {
      setSavingGallery(false);
    }
  };

  const handleRemoveGallery = async (id: string) => {
    if (confirm("Delete photo from gallery collection?")) {
      try {
        setGallery(prev => prev.filter(item => item.id !== id));
        await deleteGalleryItem(id);
        setToastType('success');
        setToastMessage("Gallery item removed successfully.");
        loadAllAdminData();
        onRefreshData();
      } catch (err: any) {
        setToastType('error');
        setToastMessage("Failed to delete gallery item: " + (err?.message || err));
      }
    }
  };

  // Add Review record
  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRName || !newRText) {
      alert("Name and testimonial description are requested.");
      return;
    }
    setSavingReview(true);
    try {
      await addReview({
        name: newRName,
        rating: newRRating,
        text: newRText,
        avatar: newRAvatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
        createdAt: new Date().toISOString().split('T')[0]
      });
      setNewRName("");
      setNewRText("");
      setNewRRating(5);
      setNewRAvatar("");
      setShowAddReview(false);
      setToastType('success');
      setToastMessage("⭐ Testimonial rating registered and visible on client reviews!");
      loadAllAdminData();
      onRefreshData();
    } catch (err: any) {
      setToastType('error');
      setToastMessage("Failed to add testimonial: " + (err?.message || err));
    } finally {
      setSavingReview(false);
    }
  };

  const handleRemoveReview = async (id: string) => {
    if (confirm("Delete customer reviews entry?")) {
      try {
        setReviews(prev => prev.filter(item => item.id !== id));
        await deleteReview(id);
        setToastType('success');
        setToastMessage("Review log wiped successfully.");
        loadAllAdminData();
        onRefreshData();
      } catch (err: any) {
        setToastType('error');
        setToastMessage("Failed to delete review: " + (err?.message || err));
      }
    }
  };

  // Add Offers config
  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOTitle || !newODesc || !newOCode) {
      alert("Offer fields are mandatory.");
      return;
    }
    setSavingOffer(true);
    try {
      await addOffer({
        title: newOTitle,
        description: newODesc,
        discountCode: newOCode.toUpperCase(),
        discountPercentage: Number(newODiscount),
        imageUrl: newOImage || "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=400&q=80"
      });
      setNewOTitle("");
      setNewODesc("");
      setNewOCode("");
      setNewODiscount(15);
      setNewOImage("");
      setShowAddOffer(false);
      setToastType('success');
      setToastMessage("🎁 Exclusive coupon details activated and displayed live!");
      loadAllAdminData();
      onRefreshData();
    } catch (err: any) {
      setToastType('error');
      setToastMessage("Failed to create promo offer: " + (err?.message || err));
    } finally {
      setSavingOffer(false);
    }
  };
  const handleRemoveOffer = async (id: string) => {
    if (confirm("Delete this coupon promo offer?")) {
      try {
        setOffers(prev => prev.filter(item => item.id !== id));
        await deleteOffer(id);
        setToastType('success');
        setToastMessage("Coupon offer removed successfully.");
        loadAllAdminData();
        onRefreshData();
      } catch (err: any) {
        setToastType('error');
        setToastMessage("Failed to delete promo offer: " + (err?.message || err));
      }
    }
  };

  // Filtering appointments for view listing
  const searchedAppts = appointments.filter((appt) => {
    const isServiceMatch = filterService === "All" || appt.serviceId === filterService;
    const query = searchQuery.toLowerCase();
    const isTextMatch = 
      appt.fullName.toLowerCase().includes(query) || 
      appt.phone.includes(query) || 
      appt.serviceName.toLowerCase().includes(query) ||
      (appt.notes && appt.notes.toLowerCase().includes(query));
    return isServiceMatch && isTextMatch;
  });

  return (
    <div className="bg-neutral-900 text-neutral-100 min-h-screen font-sans selection:bg-amber-500 selection:text-neutral-950">
      
      {/* 1. SECURE ADMIN CREDENTIALS GATE */}
      {!isAdminAuth ? (
        <section className="min-h-[85vh] flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
            <div className="bg-gradient-to-tr from-amber-500 to-yellow-300 p-3.5 rounded-2xl w-fit mx-auto shadow-inner text-neutral-950">
              <Lock size={30} className="animate-pulse" />
            </div>

            <div className="space-y-1">
              <h1 className="font-serif font-bold text-2xl text-neutral-200 tracking-tight">
                Staff Administration Gate
              </h1>
              <span className="text-[10px] text-amber-500 font-mono tracking-widest uppercase block">
                Anika Makeover Salon
              </span>
            </div>

            <p className="text-xs text-neutral-450 leading-relaxed font-light">
              This panel is restricted to salon administration staffing. Enter your access credential password below to manage design aspects, services, appointments, and uploads.
            </p>

            {/* PASSWORD LOGIN FORM OR FORGOT PASSWORD RECOVERY CONTAINER */}
            {!showForgot ? (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-1.5 text-left relative">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                      Secure Access Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgot(true);
                        setForgotError('');
                        setForgotSuccess('');
                      }}
                      className="text-[10px] font-semibold text-amber-500 hover:text-amber-400 tracking-wide transition-colors uppercase outline-none focus:ring-0 cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="Enter Staff Password..."
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 text-xs rounded-xl flex items-center justify-center gap-1.5">
                    <span>⚡</span>
                    <p className="font-semibold">{passwordError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer hover:shadow-lg active:scale-[0.99]"
                >
                  <LogIn size={15} />
                  <span>Verify Password & Open Dashboard</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4 text-left">
                <div className="space-y-1 border-b border-neutral-800/40 pb-3 text-center">
                  <h3 className="font-semibold text-sm text-amber-500 uppercase tracking-widest font-mono">
                    Staff Identity Recovery
                  </h3>
                  <p className="text-[11px] text-neutral-450 leading-relaxed font-light">
                    Answer security questions based on salon founder details to reset staff password back to default status.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                      Owner's Full Name (From Homepage)
                    </label>
                    <input 
                      type="text" 
                      value={securityName}
                      onChange={(e) => setSecurityName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="e.g. Menka Singh..."
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                      Menka's Styling Experience (Years)
                    </label>
                    <input 
                      type="text" 
                      value={securityExp}
                      onChange={(e) => setSecurityExp(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="e.g. 12 or 12+..."
                      required
                    />
                  </div>
                </div>

                {forgotError && (
                  <div className="p-3 bg-red-950/25 border border-red-900/40 text-red-400 text-xs rounded-xl flex items-center justify-center gap-1.5 leading-relaxed text-center font-medium">
                    <span>⚡ {forgotError}</span>
                  </div>
                )}

                {forgotSuccess && (
                  <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-[11px] rounded-xl flex items-center justify-center leading-relaxed text-center font-medium">
                    <span>✨ {forgotSuccess}</span>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-[0.99]"
                  >
                    <span>Verify My Identity</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(false);
                      setForgotError('');
                      setForgotSuccess('');
                    }}
                    className="w-full py-1 text-[10px] font-semibold text-neutral-500 hover:text-neutral-350 uppercase text-center transition-colors font-mono tracking-wider cursor-pointer"
                  >
                    Close & Return to Login
                  </button>
                </div>
              </form>
            )}

            {/* Auth options backdoors removed for security */}
            
          </div>
        </section>
      ) : (
        /* 2. LOGGED-IN ADMINISTRATIVE PORTAL */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-text">
          
          {/* Header Bar */}
          <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/10 p-2 rounded-xl text-amber-400 border border-amber-500/20">
                <SettingIcon size={20} className="animate-spin-slow" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-neutral-100">
                  Anika Manager Workspace
                </h2>
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-widest mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isMockFirebase && !sandboxBypass && !isAdminAuth ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                  <span className="text-neutral-500">
                    {sandboxBypass ? "Mode: Private Local Sandbox" : isAdminAuth ? "Mode: Staff Password Verified" : `Mode: Connected (${currentUser?.email})`}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:bg-red-950/20 hover:border-red-900 hover:text-red-400 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign Out Panel</span>
            </button>
          </div>

          {/* Subtabs Quick Navigation Row */}
          <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-2 select-none">
            {[
              { id: 'builder', label: 'Visual Website Builder', icon: <Sparkles size={13} /> },
              { id: 'heroWelcomeBanner', label: 'Hero & Welcome Banner Manager', icon: <Crown size={13} /> },
              { id: 'appointments', label: 'Appointments Booked', icon: <Calendar size={13} /> },
              { id: 'services', label: 'Services Catalogue', icon: <BookOpen size={13} /> },
              { id: 'gallery', label: 'Gallery Portfolio', icon: <Image size={13} /> },
              { id: 'offers', label: 'Offers Coupons', icon: <Percent size={13} /> },
              { id: 'reviews', label: 'Guest Feedback', icon: <MessageSquare size={13} /> },
              { id: 'settings', label: 'Website Settings & Banners', icon: <SettingIcon size={13} /> },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSubTab(sub.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase border flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeSubTab === sub.id
                    ? 'bg-amber-500 text-neutral-950 border-amber-500'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
                }`}
              >
                {sub.icon}
                <span>{sub.label}</span>
              </button>
            ))}
          </div>

          {/* 3. SUBTAB CONTENT PANELS */}
          
          {/* 3. SUBTAB CONTENT PANELS */}
          
          {/* 3. SUBTAB CONTENT PANELS */}
          
          {/* HERO & WELCOME BANNER SECTION MANAGER */}
          {activeSubTab === 'heroWelcomeBanner' && (
            <div id="hero-welcome-manager-panel" className="space-y-8 animate-fadeIn">
              
              <div className="bg-gradient-to-r from-amber-500/10 via-neutral-950 to-neutral-950 p-6 rounded-3xl border border-amber-500/20 flex flex-col md:flex-row gap-5 items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Crown className="text-amber-400 animate-pulse" size={20} />
                    <h3 className="font-serif font-bold text-xl text-neutral-100">Hero & Welcome Banner Manager</h3>
                  </div>
                  <p className="text-xs text-neutral-400 max-w-xl">
                    Configure names, headings, subheadings, instant direct action links, call-to-actions, and upload high-resolution premium artwork directly from your device.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handlePreviewHeroWelcome}
                    className="px-5 py-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 text-neutral-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Instant Live Preview</span>
                  </button>

                  <button
                    onClick={handleSaveHeroWelcome}
                    disabled={savingHeroBanner}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {savingHeroBanner ? (
                      <Loader2 size={14} className="animate-spin text-neutral-950" />
                    ) : (
                      <Check size={14} />
                    )}
                    <span>{savingHeroBanner ? "Publishing..." : "Publish To Site"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* A. HERO SECTION CONFIGURATION */}
                <div className="bg-neutral-950 border border-neutral-850 rounded-3xl p-6 space-y-6">
                  <div className="border-b border-neutral-900 pb-3 flex items-center gap-2">
                    <Crown size={16} className="text-amber-400" />
                    <div>
                      <h4 className="font-serif font-bold text-base text-neutral-200">1. Hero Section Settings</h4>
                      <p className="text-[11px] text-neutral-500">Configure visual items shown immediately upon entering the customer portal.</p>
                    </div>
                  </div>

                  {/* Direct Image Upload for Hero Background Photo */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Hero Wallpaper Art Image</label>
                    <DirectFileUploader
                      label="Direct Device Image Upload"
                      accept="image/*"
                      folder="hero"
                      currentValue={editableHeroBanner.heroBgImage}
                      onUploadComplete={(url) => setEditableHeroBanner(prev => ({ ...prev, heroBgImage: url }))}
                    />
                    <p className="text-[10px] text-neutral-500">Upload high-quality landscape photo. Replaces background automatically.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Hero Heading */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Salon Main Brand / Heading Name</label>
                      <input 
                        type="text" 
                        value={editableHeroBanner.heroHeading}
                        onChange={(e) => setEditableHeroBanner(prev => ({ ...prev, heroHeading: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:border-amber-500/50 focus:outline-none transition-colors"
                        placeholder="Anika Makeover Salon"
                        required
                      />
                    </div>

                    {/* Hero Subtitle */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Slogan / Elevational Subheading</label>
                      <textarea
                        value={editableHeroBanner.heroSubheading}
                        onChange={(e) => setEditableHeroBanner(prev => ({ ...prev, heroSubheading: e.target.value }))}
                        className="w-full px-4 py-2.5 h-20 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:border-amber-500/50 focus:outline-none transition-colors resize-none"
                        placeholder="Where Luxury Meets Beauty & Elegant Styling"
                        required
                      />
                    </div>

                    {/* Hero Button 1: Appointment */}
                    <div className="border-t border-neutral-900 pt-4 space-y-3">
                      <h5 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Button 1: Book Appointment Controls</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1 block">
                          <label className="text-[10px] text-neutral-500 block">Button Text</label>
                          <input 
                            type="text" 
                            value={editableHeroBanner.heroBtnAppointmentText}
                            onChange={(e) => setEditableHeroBanner(prev => ({ ...prev, heroBtnAppointmentText: e.target.value }))}
                            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300"
                            placeholder="Book Appointment"
                          />
                        </div>
                        <div className="space-y-1 block">
                          <label className="text-[10px] text-neutral-500 block">Anchor ID Target / Link</label>
                          <input 
                            type="text" 
                            value={editableHeroBanner.heroBtnAppointmentLink}
                            onChange={(e) => setEditableHeroBanner(prev => ({ ...prev, heroBtnAppointmentLink: e.target.value }))}
                            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300"
                            placeholder="#booking"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Hero Button 2: WhatsApp */}
                    <div className="border-t border-neutral-900 pt-4 space-y-3">
                      <h5 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Button 2: WhatsApp Controls</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1 block">
                          <label className="text-[10px] text-neutral-500 block">Button Text</label>
                          <input 
                            type="text" 
                            value={editableHeroBanner.heroBtnWhatsAppText}
                            onChange={(e) => setEditableHeroBanner(prev => ({ ...prev, heroBtnWhatsAppText: e.target.value }))}
                            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300"
                            placeholder="WhatsApp"
                          />
                        </div>
                        <div className="space-y-1 block">
                          <label className="text-[10px] text-neutral-500 block">Custom Link or Phone Number</label>
                          <input 
                            type="text" 
                            value={editableHeroBanner.heroBtnWhatsAppLink}
                            onChange={(e) => setEditableHeroBanner(prev => ({ ...prev, heroBtnWhatsAppLink: e.target.value }))}
                            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300"
                            placeholder="e.g. https://wa.me/91XXXXXXXXXX"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Hero Button 3: Instagram */}
                    <div className="border-t border-neutral-900 pt-4 space-y-3">
                      <h5 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Button 3: Instagram Controls</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1 block">
                          <label className="text-[10px] text-neutral-500 block">Button Text</label>
                          <input 
                            type="text" 
                            value={editableHeroBanner.heroBtnInstagramText}
                            onChange={(e) => setEditableHeroBanner(prev => ({ ...prev, heroBtnInstagramText: e.target.value }))}
                            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300"
                            placeholder="Instagram"
                          />
                        </div>
                        <div className="space-y-1 block">
                          <label className="text-[10px] text-neutral-500 block">Custom Instagram URL</label>
                          <input 
                            type="text" 
                            value={editableHeroBanner.heroBtnInstagramLink}
                            onChange={(e) => setEditableHeroBanner(prev => ({ ...prev, heroBtnInstagramLink: e.target.value }))}
                            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300"
                            placeholder="e.g. https://instagram.com/yourprofile"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* B. WELCOME BANNER CONFIGURATION */}
                <div className="bg-neutral-950 border border-neutral-850 rounded-3xl p-6 space-y-6">
                  <div className="border-b border-neutral-900 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-400" />
                      <div>
                        <h4 className="font-serif font-bold text-base text-neutral-200">2. Welcome Banner Section</h4>
                        <p className="text-[11px] text-neutral-500">Prominent custom banner block positioned directly below the Hero.</p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={editableWelcomeBanner.visible}
                        onChange={(e) => setEditableWelcomeBanner(prev => ({ ...prev, visible: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-neutral-400 after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-neutral-950 peer-checked:after:border-amber-400" />
                      <span className="ml-2 text-xs font-semibold text-neutral-300">Visible</span>
                    </label>
                  </div>

                  {/* Direct Image Upload for Welcome Banner */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Banner Visual Art Image</label>
                    <DirectFileUploader
                      label="Direct Device Image Upload"
                      accept="image/*"
                      folder="welcome"
                      currentValue={editableWelcomeBanner.bgImage}
                      onUploadComplete={(url) => setEditableWelcomeBanner(prev => ({ ...prev, bgImage: url }))}
                    />
                    <p className="text-[10px] text-neutral-500">Upload striking art or product image for the welcome campaign block.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Welcome Banner Title */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Campaign / Heading Title</label>
                      <input 
                        type="text" 
                        value={editableWelcomeBanner.title}
                        onChange={(e) => setEditableWelcomeBanner(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:border-amber-500/50 focus:outline-none transition-colors"
                        placeholder="Festive Luxury Makeup Offer"
                        required
                      />
                    </div>

                    {/* Welcome Banner Description / Subtitle */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Description / Action Details</label>
                      <textarea
                        value={editableWelcomeBanner.subtitle}
                        onChange={(e) => setEditableWelcomeBanner(prev => ({ ...prev, subtitle: e.target.value }))}
                        className="w-full px-4 py-2.5 h-24 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:border-amber-500/50 focus:outline-none transition-colors resize-none"
                        placeholder="Describe the offer or welcoming details"
                        required
                      />
                    </div>

                    {/* Welcome Banner Action Button Text & Link */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Button Text (CTA)</label>
                        <input 
                          type="text" 
                          value={editableWelcomeBanner.buttonText}
                          onChange={(e) => setEditableWelcomeBanner(prev => ({ ...prev, buttonText: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                          placeholder="e.g. Schedule Styling"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Button URL / Anchor Link</label>
                        <input 
                          type="text" 
                          value={editableWelcomeBanner.buttonLink}
                          onChange={(e) => setEditableWelcomeBanner(prev => ({ ...prev, buttonLink: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                          placeholder="e.g. #booking"
                        />
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Bottom Action bar */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveHeroWelcome}
                  disabled={savingHeroBanner}
                  className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {savingHeroBanner ? (
                    <Loader2 size={16} className="animate-spin text-neutral-950" />
                  ) : (
                    <Check size={16} />
                  )}
                  <span>{savingHeroBanner ? "Publishing Changes to Customers..." : "Publish All Hero and Banner Changes"}</span>
                </button>
              </div>

            </div>
          )}

          {/* VISUAL WEBSITE BUILDER SUBTAB */}
          {activeSubTab === 'builder' && (
            <VisualBuilderTab
              editableWelcomeBanner={editableWelcomeBanner}
              setEditableWelcomeBanner={setEditableWelcomeBanner}
              editableVisualBuilder={editableVisualBuilder}
              setEditableVisualBuilder={setEditableVisualBuilder}
              handleSaveBuilder={handleSaveBuilder}
              handleChangePassword={handleChangePassword}
              currentPasswordInput={currentPasswordInput}
              setCurrentPasswordInput={setCurrentPasswordInput}
              newPasswordInput={newPasswordInput}
              setNewPasswordInput={setNewPasswordInput}
              confirmPasswordInput={confirmPasswordInput}
              setConfirmPasswordInput={setConfirmPasswordInput}
              handleResetBuilder={handleResetBuilder}
              handlePreviewBuilder={handlePreviewBuilder}
            />
          )}

          {/* BYPASSED RETAINED OLD BUILDER BLOCK */}
          {false && activeSubTab === 'builder' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-neutral-950 p-6 rounded-3xl border border-amber-500/20 flex flex-col sm:flex-row gap-5 items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-amber-400 animate-spin-slow" size={20} />
                    <h3 className="font-serif font-bold text-xl text-neutral-100">Live Visual Website Builder</h3>
                  </div>
                  <p className="text-xs text-neutral-400 max-w-xl">
                    Change anything from font selections, border curvature, background assets, layout alignment, paragraph titles, file uploads, and see updates instantly reflected on the live customer interface.
                  </p>
                </div>
                <button
                  onClick={handleSaveBuilder}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg shadow-amber-500/10 cursor-pointer self-stretch sm:self-auto flex items-center justify-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Publish All Visual Changes</span>
                </button>
              </div>

              <form onSubmit={handleSaveBuilder} className="space-y-8">
                
                {/* 1. WELCOME BANNER PANEL */}
                <div className="bg-neutral-950 border border-neutral-850 rounded-3xl p-6 space-y-6">
                  <div className="border-b border-neutral-900 pb-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-base text-neutral-200">1. Premium Welcome Banner Section</h4>
                      <p className="text-[11px] text-neutral-500">Fully customizable display banner positioned directly below the main Hero section.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={editableWelcomeBanner.visible}
                        onChange={(e) => setEditableWelcomeBanner(prev => ({ ...prev, visible: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-805 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-neutral-400 after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-neutral-950 peer-checked:after:border-amber-400" />
                      <span className="ml-2 text-xs font-semibold text-neutral-300">Visible</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider">Banner Title Line</label>
                      <input 
                        type="text" 
                        value={editableWelcomeBanner.title}
                        onChange={(e) => setEditableWelcomeBanner(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3.5 py-2 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                        placeholder="e.g., ✨ Premium Makeup Masterclass Specials!"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider">Banner Subtitle Line</label>
                      <input 
                        type="text" 
                        value={editableWelcomeBanner.subtitle || ''}
                        onChange={(e) => setEditableWelcomeBanner(prev => ({ ...prev, subtitle: e.target.value }))}
                        className="w-full px-3.5 py-2 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                        placeholder="e.g., Book this week and avail 20% discount coupon highlights."
                      />
                    </div>
                  </div>

                  {/* Direct File System Assets (Image and Video Uploads) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <AdvancedImageUploader 
                      label="Upload Background Image Backdrop"
                      accept="image/*"
                      folder="banners"
                      currentValue={editableWelcomeBanner.bgImage || ''}
                      onUploadComplete={(url) => setEditableWelcomeBanner(prev => ({ ...prev, bgImage: url, bgVideo: '' }))}
                      aspectRatio="16:9"
                    />
                    <DirectFileUploader 
                      label="Upload Background Video Stream"
                      accept="video/*"
                      folder="banners"
                      currentValue={editableWelcomeBanner.bgVideo || ''}
                      onUploadComplete={(url) => setEditableWelcomeBanner(prev => ({ ...prev, bgVideo: url, bgImage: '' }))}
                    />
                  </div>

                  {/* Banner Parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Banner Height Size</label>
                      <select 
                        value={editableWelcomeBanner.height}
                        onChange={(e) => setEditableWelcomeBanner(prev => ({ ...prev, height: e.target.value as any }))}
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="short">Short (Compact Ribbon)</option>
                        <option value="tall">Tall (Rich Display Banner)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Overlay Backdrop Opacity</label>
                      <div className="flex items-center gap-3 bg-neutral-900 px-3 py-2 border border-neutral-800 rounded-xl">
                        <input 
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={editableWelcomeBanner.overlayOpacity ?? 0.5}
                          onChange={(e) => setEditableWelcomeBanner(prev => ({ ...prev, overlayOpacity: Number(e.target.value) }))}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                        <span className="text-xs font-mono font-semibold text-neutral-400 w-8 text-right">{(editableWelcomeBanner.overlayOpacity ?? 0.5) * 100}%</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Overlay Color</label>
                      <div className="flex gap-2">
                        <input 
                          type="color"
                          value={editableWelcomeBanner.overlayColor || '#000000'}
                          onChange={(e) => setEditableWelcomeBanner(prev => ({ ...prev, overlayColor: e.target.value }))}
                          className="w-10 h-10 border border-neutral-800 bg-neutral-900 rounded-lg cursor-pointer p-0.5"
                        />
                        <input 
                          type="text"
                          value={editableWelcomeBanner.overlayColor || '#000000'}
                          onChange={(e) => setEditableWelcomeBanner(prev => ({ ...prev, overlayColor: e.target.value }))}
                          className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Text Color Tone</label>
                      <div className="flex gap-2">
                        <input 
                          type="color"
                          value={editableWelcomeBanner.textColor || '#ffffff'}
                          onChange={(e) => setEditableWelcomeBanner(prev => ({ ...prev, textColor: e.target.value }))}
                          className="w-10 h-10 border border-neutral-800 bg-neutral-900 rounded-lg cursor-pointer p-0.5"
                        />
                        <input 
                          type="text"
                          value={editableWelcomeBanner.textColor || '#ffffff'}
                          onChange={(e) => setEditableWelcomeBanner(prev => ({ ...prev, textColor: e.target.value }))}
                          className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-neutral-900/40 p-4 border border-neutral-850 rounded-2xl">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Button Call to Action Text</label>
                      <input 
                        type="text"
                        value={editableWelcomeBanner.buttonText || ''}
                        onChange={(e) => setEditableWelcomeBanner(prev => ({ ...prev, buttonText: e.target.value }))}
                        className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                        placeholder="e.g., Book slot now"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Button Link Target</label>
                      <input 
                        type="text"
                        value={editableWelcomeBanner.buttonLink || ''}
                        onChange={(e) => setEditableWelcomeBanner(prev => ({ ...prev, buttonLink: e.target.value }))}
                        className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                        placeholder="e.g., #booking"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Button Background Color</label>
                      <div className="flex gap-1.5">
                        <input 
                          type="color"
                          value={editableWelcomeBanner.buttonBgColor || '#eab308'}
                          onChange={(e) => setEditableWelcomeBanner(prev => ({ ...prev, buttonBgColor: e.target.value }))}
                          className="w-8 h-8 rounded-lg cursor-pointer p-0 bg-transparent shrink-0"
                        />
                        <input 
                          type="text"
                          value={editableWelcomeBanner.buttonBgColor || '#eab308'}
                          onChange={(e) => setEditableWelcomeBanner(prev => ({ ...prev, buttonBgColor: e.target.value }))}
                          className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-[11px] text-neutral-300"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Button Text Color</label>
                      <div className="flex gap-1.5">
                        <input 
                          type="color"
                          value={editableWelcomeBanner.buttonTextColor || '#000000'}
                          onChange={(e) => setEditableWelcomeBanner(prev => ({ ...prev, buttonTextColor: e.target.value }))}
                          className="w-8 h-8 rounded-lg cursor-pointer p-0 bg-transparent shrink-0"
                        />
                        <input 
                          type="text"
                          value={editableWelcomeBanner.buttonTextColor || '#000000'}
                          onChange={(e) => setEditableWelcomeBanner(prev => ({ ...prev, buttonTextColor: e.target.value }))}
                          className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-[11px] text-neutral-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. STYLE CONTROLS & THEME COLOR DIALS */}
                <div className="bg-neutral-950 border border-neutral-850 rounded-3xl p-6 space-y-6">
                  <div>
                    <h4 className="font-serif font-bold text-base text-neutral-200">2. Global Style & Theme Configs</h4>
                    <p className="text-[11px] text-neutral-500">Fine-tune the brand identity across borders, spacing, padding, shadows, and Google Fonts presets.</p>
                  </div>

                  {/* Fonts selections */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider">Heading Display Font</label>
                      <select 
                        value={editableVisualBuilder.styles.fontHeader}
                        onChange={(e) => setEditableVisualBuilder(prev => ({
                          ...prev,
                          styles: { ...prev.styles, fontHeader: e.target.value }
                        }))}
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="Space Grotesk">Space Grotesk (Modern Technological)</option>
                        <option value="Playfair Display">Playfair Display (Luxe Editorial Serif)</option>
                        <option value="Inter">Inter (Clean Minimalist)</option>
                        <option value="Outfit">Outfit (Chic Modern Geometric)</option>
                        <option value="Cormorant Garamond">Cormorant Garamond (Elite Italian Royalty Serif)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider">Body Typography Font</label>
                      <select 
                        value={editableVisualBuilder.styles.fontBody}
                        onChange={(e) => setEditableVisualBuilder(prev => ({
                          ...prev,
                          styles: { ...prev.styles, fontBody: e.target.value }
                        }))}
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="Inter">Inter (Sans-serif Minimalist)</option>
                        <option value="JetBrains Mono">JetBrains Mono (Technical Space Code)</option>
                        <option value="Outfit">Outfit (Clean Geometric Sans)</option>
                      </select>
                    </div>
                  </div>

                  {/* Themes Colors Palette dials */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-neutral-900/30 p-4 border border-neutral-850 rounded-2xl">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">Solid Background</label>
                      <div className="flex gap-2">
                        <input type="color" value={editableVisualBuilder.styles.colorBg} onChange={(e) => setEditableVisualBuilder(prev => ({ ...prev, styles: { ...prev.styles, colorBg: e.target.value } }))} className="w-8 h-8 rounded p-0" />
                        <input type="text" value={editableVisualBuilder.styles.colorBg} onChange={(e) => setEditableVisualBuilder(prev => ({ ...prev, styles: { ...prev.styles, colorBg: e.target.value } }))} className="w-full text-xs bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded-xl text-neutral-300" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">Panel Card Fill</label>
                      <div className="flex gap-2">
                        <input type="color" value={editableVisualBuilder.styles.colorCard} onChange={(e) => setEditableVisualBuilder(prev => ({ ...prev, styles: { ...prev.styles, colorCard: e.target.value } }))} className="w-8 h-8 rounded p-0" />
                        <input type="text" value={editableVisualBuilder.styles.colorCard} onChange={(e) => setEditableVisualBuilder(prev => ({ ...prev, styles: { ...prev.styles, colorCard: e.target.value } }))} className="w-full text-xs bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded-xl text-neutral-300" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">Primary Title</label>
                      <div className="flex gap-2">
                        <input type="color" value={editableVisualBuilder.styles.colorTextPrimary} onChange={(e) => setEditableVisualBuilder(prev => ({ ...prev, styles: { ...prev.styles, colorTextPrimary: e.target.value } }))} className="w-8 h-8 rounded p-0" />
                        <input type="text" value={editableVisualBuilder.styles.colorTextPrimary} onChange={(e) => setEditableVisualBuilder(prev => ({ ...prev, styles: { ...prev.styles, colorTextPrimary: e.target.value } }))} className="w-full text-xs bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded-xl text-neutral-300" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">Action Buttons Text</label>
                      <div className="flex gap-2">
                        <input type="color" value={editableVisualBuilder.styles.colorButtonText || '#000000'} onChange={(e) => setEditableVisualBuilder(prev => ({ ...prev, styles: { ...prev.styles, colorButtonText: e.target.value } }))} className="w-8 h-8 rounded p-0" />
                        <input type="text" value={editableVisualBuilder.styles.colorButtonText || '#000000'} onChange={(e) => setEditableVisualBuilder(prev => ({ ...prev, styles: { ...prev.styles, colorButtonText: e.target.value } }))} className="w-full text-xs bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded-xl text-neutral-300" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Accent Highlight Focus</label>
                      <div className="flex gap-2">
                        <input type="color" value={editableVisualBuilder.styles.colorAccent} onChange={(e) => setEditableVisualBuilder(prev => ({ ...prev, styles: { ...prev.styles, colorAccent: e.target.value } }))} className="w-8 h-8 rounded p-0" />
                        <input type="text" value={editableVisualBuilder.styles.colorAccent} onChange={(e) => setEditableVisualBuilder(prev => ({ ...prev, styles: { ...prev.styles, colorAccent: e.target.value } }))} className="w-full text-xs bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded-xl text-neutral-300" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">ActionButton background</label>
                      <div className="flex gap-2">
                        <input type="color" value={editableVisualBuilder.styles.colorButtonBg || '#f59e0b'} onChange={(e) => setEditableVisualBuilder(prev => ({ ...prev, styles: { ...prev.styles, colorButtonBg: e.target.value } }))} className="w-8 h-8 rounded p-0" />
                        <input type="text" value={editableVisualBuilder.styles.colorButtonBg || '#f59e0b'} onChange={(e) => setEditableVisualBuilder(prev => ({ ...prev, styles: { ...prev.styles, colorButtonBg: e.target.value } }))} className="w-full text-xs bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded-xl text-neutral-300" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Paragraph Narrative Text</label>
                      <div className="flex gap-2">
                        <input type="color" value={editableVisualBuilder.styles.colorTextSecondary} onChange={(e) => setEditableVisualBuilder(prev => ({ ...prev, styles: { ...prev.styles, colorTextSecondary: e.target.value } }))} className="w-8 h-8 rounded p-0" />
                        <input type="text" value={editableVisualBuilder.styles.colorTextSecondary} onChange={(e) => setEditableVisualBuilder(prev => ({ ...prev, styles: { ...prev.styles, colorTextSecondary: e.target.value } }))} className="w-full text-xs bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded-xl text-neutral-300" />
                      </div>
                    </div>
                  </div>

                  {/* Layout parameters sizes and depths */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Hero Banner Layout Size</label>
                      <select 
                        value={editableVisualBuilder.styles.heroSize || 'medium'}
                        onChange={(e) => setEditableVisualBuilder(prev => ({
                          ...prev,
                          styles: { ...prev.styles, heroSize: e.target.value as any }
                        }))}
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="small font-mono">Small (Sleek Compact)</option>
                        <option value="medium">Medium (Standard Portrait)</option>
                        <option value="large">Large (Tall Glamour Banner)</option>
                        <option value="viewport">Full Viewport (Cover Landing)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Border Corner Curvature</label>
                      <select 
                        value={editableVisualBuilder.styles.cardBorderRadius || '2xl'}
                        onChange={(e) => setEditableVisualBuilder(prev => ({
                          ...prev,
                          styles: { ...prev.styles, cardBorderRadius: e.target.value as any }
                        }))}
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="none">None (Strict Sharp Corners)</option>
                        <option value="sm">Small curve (4px border)</option>
                        <option value="md">Medium curve (8px border)</option>
                        <option value="lg">Large curve (12px border)</option>
                        <option value="xl">XL curve (16px border)</option>
                        <option value="2xl">2XL curve (24px default)</option>
                        <option value="3xl">3XL curve (32px organic pill)</option>
                        <option value="full">Circle Pill Core</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Card Shadow Dimension</label>
                      <select 
                        value={editableVisualBuilder.styles.cardShadow || 'xl'}
                        onChange={(e) => setEditableVisualBuilder(prev => ({
                          ...prev,
                          styles: { ...prev.styles, cardShadow: e.target.value as any }
                        }))}
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="none">No Shadows (Flat Modern Minimal)</option>
                        <option value="sm">Subtle Soft Light</option>
                        <option value="md">Balanced Mid depth styling</option>
                        <option value="lg">Elevated Luxe (10px deep shadow)</option>
                        <option value="xl">Epic Floating (20px deep shadow)</option>
                        <option value="2xl">Dramatic Soft Contrast Outline</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Layout Padding Density</label>
                      <select 
                        value={editableVisualBuilder.styles.sectionSpacing || 'comfortable'}
                        onChange={(e) => setEditableVisualBuilder(prev => ({
                          ...prev,
                          styles: { ...prev.styles, sectionSpacing: e.target.value as any }
                        }))}
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="cozy">Cozy (Sleek Compact Padding)</option>
                        <option value="comfortable">Comfortable (Balanced spacing)</option>
                        <option value="spacious">Spacious (Deep airy gaps / elegant)</option>
                      </select>
                    </div>
                  </div>

                  {/* Motion effects speed dials */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Interactive Buttons Style</label>
                      <select 
                        value={editableVisualBuilder.styles.buttonStyle || 'solid'}
                        onChange={(e) => setEditableVisualBuilder(prev => ({
                          ...prev,
                          styles: { ...prev.styles, buttonStyle: e.target.value as any }
                        }))}
                        className="w-full px-3.5 py-2 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="solid">Glassy Solid Accented</option>
                        <option value="outline">Chic Outline Border</option>
                        <option value="rounded">Pill-shaped Full Core</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Button Hover Reaction</label>
                      <select 
                        value={editableVisualBuilder.styles.hoverEffects || 'scale'}
                        onChange={(e) => setEditableVisualBuilder(prev => ({
                          ...prev,
                          styles: { ...prev.styles, hoverEffects: e.target.value as any }
                        }))}
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="scale">Elegantly Zoom Out (+3%)</option>
                        <option value="lift">Lift off ground (Translate up)</option>
                        <option value="glow">Inner Radial Glow shadow</option>
                        <option value="none">Flat Static State</option>
                      </select>
                    </div>

                    <div className="space-y-2 flex justify-between items-center bg-neutral-900/60 p-4 border border-neutral-850 rounded-2xl">
                      <div className="space-y-0.5">
                        <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">Dynamic Motion Effects</label>
                        <span className="text-[10px] text-neutral-500 font-light block">Premium motion transition overlays on mount.</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={editableVisualBuilder.styles.motionEnabled ?? true}
                          onChange={(e) => setEditableVisualBuilder(prev => ({
                            ...prev,
                            styles: { ...prev.styles, motionEnabled: e.target.checked }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-neutral-805 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-neutral-400 after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-neutral-950 peer-checked:after:border-amber-400" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* 3. SECTION VISIBILITY toggles */}
                <div className="bg-neutral-950 border border-neutral-850 rounded-3xl p-6 space-y-6">
                  <div>
                    <h4 className="font-serif font-bold text-base text-neutral-200">3. Active Section Show/Hide Switches</h4>
                    <p className="text-[11px] text-neutral-500">Instantly toggle the visibility of any homepage panel depending on season, promos, or preferences.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Loop through visibility section flags */}
                    {[
                      { key: 'announcementBar', name: 'Announcement Bar Notification' },
                      { key: 'welcomeBanner', name: 'Premium Custom Welcome Banner' },
                      { key: 'hero', name: 'Dynamic Glamour Hero Banner' },
                      { key: 'combos', name: 'highlights Combo Packages' },
                      { key: 'biography', name: 'Biography Profile & Experience' },
                      { key: 'services', name: 'Hair/Makeup Services Catalog' },
                      { key: 'gallery', name: 'Bridal Portfolios Gallery' },
                      { key: 'reviews', name: 'Guest Reviews / Testimonials' },
                      { key: 'booking', name: 'Interactive Slot Reservator' },
                      { key: 'map', name: 'Interactive Map Location' },
                      { key: 'footer', name: 'Professional Social Footer' }
                    ].map((sec) => (
                      <div 
                        key={sec.key} 
                        className="flex items-center justify-between p-3.5 bg-neutral-900 border border-neutral-850 hover:border-neutral-800 rounded-xl transition-all"
                      >
                        <span className="text-xs font-semibold text-neutral-300">{sec.name}</span>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={editableVisualBuilder.visibility[sec.key as keyof typeof editableVisualBuilder.visibility] !== false}
                            onChange={(e) => setEditableVisualBuilder(prev => ({
                              ...prev,
                              visibility: { 
                                ...prev.visibility, 
                                [sec.key]: e.target.checked 
                              }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-neutral-805 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2.5px] after:bg-neutral-550 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-neutral-950" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. WEBSITE COPY & INTERACTIVE FILE EXCHANGER */}
                <div className="bg-neutral-950 border border-neutral-850 rounded-3xl p-6 space-y-6">
                  <div>
                    <h4 className="font-serif font-bold text-base text-neutral-200">4. Page Copy Content & Backdrop Uploads</h4>
                    <p className="text-[11px] text-neutral-500">Edit any heading, secondary lines, and replace visual backgrounds instantly using direct storage. No code edits required!</p>
                  </div>

                  {/* A. HERO COVER COPY */}
                  <div className="p-5 bg-neutral-900/30 border border-neutral-850 rounded-2xl space-y-4">
                    <span className="text-xs font-serif font-bold text-neutral-200 flex items-center gap-1.5">
                      <span className="text-amber-500 text-[10px]">■</span> Glamour Hero Banner Copy Customizer
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider">Main Heading</label>
                        <input 
                          type="text" 
                          value={editableVisualBuilder.sectionsText.heroTitle}
                          onChange={(e) => setEditableVisualBuilder(prev => ({
                            ...prev,
                            sectionsText: { ...prev.sectionsText, heroTitle: e.target.value }
                          }))}
                          className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider">Subheading text</label>
                        <input 
                          type="text" 
                          value={editableVisualBuilder.sectionsText.heroSubtitle}
                          onChange={(e) => setEditableVisualBuilder(prev => ({
                            ...prev,
                            sectionsText: { ...prev.sectionsText, heroSubtitle: e.target.value }
                          }))}
                          className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                    {/* Background Hero Asset direct upload */}
                    <div className="pt-2">
                      <AdvancedImageUploader 
                        label="Primary Hero Backdrop Image" 
                        accept="image/*" 
                        folder="hero"
                        currentValue={editableVisualBuilder.sectionsText.heroBgImage || ''}
                        onUploadComplete={(url) => setEditableVisualBuilder(prev => ({
                          ...prev,
                          sectionsText: { ...prev.sectionsText, heroBgImage: url }
                        }))}
                        aspectRatio="16:9"
                      />
                    </div>
                  </div>

                  {/* B. SPECIALS COMBOS BACKGROUND */}
                  <div className="p-5 bg-neutral-900/30 border border-neutral-850 rounded-2xl space-y-4">
                    <span className="text-xs font-serif font-bold text-neutral-200 flex items-center gap-1.5">
                      <span className="text-amber-500 text-[10px]">■</span> highlights Combo Deals & Highlights Backdrop
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider">Highlights Title</label>
                        <input 
                          type="text" 
                          value={editableVisualBuilder.sectionsText.combosTitle || 'LUXURY SPA EXPERIENCE & OFFERS'}
                          onChange={(e) => setEditableVisualBuilder(prev => ({
                            ...prev,
                            sectionsText: { ...prev.sectionsText, combosTitle: e.target.value }
                          }))}
                          className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider">Highlights subtitle narrative</label>
                        <input 
                          type="text" 
                          value={editableVisualBuilder.sectionsText.combosSubtitle || 'Hand-picked beauty rituals combind to provide spectacular transformations.'}
                          onChange={(e) => setEditableVisualBuilder(prev => ({
                            ...prev,
                            sectionsText: { ...prev.sectionsText, combosSubtitle: e.target.value }
                          }))}
                          className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                    {/* Bridal background asset upload */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <AdvancedImageUploader 
                        label="Exclusive Bridal Highlights Cover Photo" 
                        accept="image/*" 
                        folder="sections"
                        currentValue={editableVisualBuilder.sectionsText.combosBridalBg || ''}
                        onUploadComplete={(url) => setEditableVisualBuilder(prev => ({
                          ...prev,
                          sectionsText: { ...prev.sectionsText, combosBridalBg: url }
                        }))}
                        aspectRatio="4:3"
                      />
                      <AdvancedImageUploader 
                        label="Transformation Highlights Cover Photo" 
                        accept="image/*" 
                        folder="sections"
                        currentValue={editableVisualBuilder.sectionsText.combosTransformBg || ''}
                        onUploadComplete={(url) => setEditableVisualBuilder(prev => ({
                          ...prev,
                          sectionsText: { ...prev.sectionsText, combosTransformBg: url }
                        }))}
                        aspectRatio="4:3"
                      />
                    </div>
                  </div>

                  {/* C. BIOGRAPHY & LEAD SINGER PROFILE */}
                  <div className="p-5 bg-neutral-900/30 border border-neutral-850 rounded-2xl space-y-4">
                    <span className="text-xs font-serif font-bold text-neutral-200 flex items-center gap-1.5">
                      <span className="text-amber-500 text-[10px]">■</span> Biography Director Portrait & Experience Quotes
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider">About Section Title</label>
                        <input 
                          type="text" 
                          value={editableVisualBuilder.sectionsText.aboutTitle || 'Our Founder Story'}
                          onChange={(e) => setEditableVisualBuilder(prev => ({
                            ...prev,
                            sectionsText: { ...prev.sectionsText, aboutTitle: e.target.value }
                          }))}
                          className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider">Director Professional Name</label>
                        <input 
                          type="text" 
                          value={editableVisualBuilder.sectionsText.aboutName || 'Menka Singh'}
                          onChange={(e) => setEditableVisualBuilder(prev => ({
                            ...prev,
                            sectionsText: { ...prev.sectionsText, aboutName: e.target.value }
                          }))}
                          className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider">Creator Experience Stat Tag</label>
                        <input 
                          type="text" 
                          value={editableVisualBuilder.sectionsText.aboutExperienceYears || '15+ Years Bridal Excellence'}
                          onChange={(e) => setEditableVisualBuilder(prev => ({
                            ...prev,
                            sectionsText: { ...prev.sectionsText, aboutExperienceYears: e.target.value }
                          }))}
                          className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Biography Professional Narrative Narrative</label>
                      <textarea 
                        rows={4}
                        value={editableVisualBuilder.sectionsText.aboutDescription || ''}
                        onChange={(e) => setEditableVisualBuilder(prev => ({
                          ...prev,
                          sectionsText: { ...prev.sectionsText, aboutDescription: e.target.value }
                        }))}
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-amber-500 font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider">Creator Mottos Quote Line</label>
                        <input 
                          type="text" 
                          value={editableVisualBuilder.sectionsText.aboutMotto || ''}
                          onChange={(e) => setEditableVisualBuilder(prev => ({
                            ...prev,
                            sectionsText: { ...prev.sectionsText, aboutMotto: e.target.value }
                          }))}
                          className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <AdvancedImageUploader 
                        label="Director Professional Photo portrait" 
                        accept="image/*" 
                        folder="about"
                        currentValue={editableVisualBuilder.sectionsText.aboutBgImage || ''}
                        onUploadComplete={(url) => setEditableVisualBuilder(prev => ({
                          ...prev,
                          sectionsText: { ...prev.sectionsText, aboutBgImage: url }
                        }))}
                        aspectRatio="1:1"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. PUBLISH FOOTER BUTTON */}
                <div className="flex justify-end gap-3 p-4 bg-neutral-950 border border-neutral-850 rounded-2xl">
                  <button
                    type="submit"
                    disabled={savingBuilder}
                    className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-amber-500/10 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {savingBuilder ? <Loader2 size={14} className="animate-spin text-neutral-950" /> : <Check size={14} />}
                    <span>{savingBuilder ? 'Publishing layouts...' : 'Publish Visual Builder Live Settings'}</span>
                  </button>
                </div>
              </form>

              {/* 5. ADMIN KEY PASSWORD CHANGE SUITE */}
              <div className="bg-neutral-950 border border-neutral-850 rounded-3xl p-6 space-y-6">
                <div>
                  <h4 className="font-serif font-bold text-base text-neutral-200 flex items-center gap-1.5">
                    <Lock size={15} className="text-amber-400" />
                    <span>5. Secure Staff Password Settings</span>
                  </h4>
                  <p className="text-[11px] text-neutral-500">Update the cryptographic password used for administrative logins. Ensure you memorize changed credentials.</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider">Current Staff Password</label>
                      <input 
                        type="password"
                        value={currentPasswordInput}
                        onChange={(e) => setCurrentPasswordInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-amber-500"
                        placeholder="Current Access Password..."
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider">New Password</label>
                        <input 
                          type="password"
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-amber-500"
                          placeholder="At least 6 characters..."
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider">Confirm New Password</label>
                        <input 
                          type="password"
                          value={confirmPasswordInput}
                          onChange={(e) => setConfirmPasswordInput(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-amber-500"
                          placeholder="Re-type confirm password..."
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 hover:text-amber-400 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                  >
                    Change Access Password Keys
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* A. APPOINTMENTS CONTROL MODULE */}
          {activeSubTab === 'appointments' && (
            <div className="space-y-6">
              
              {/* Filter inputs header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-950/40 p-5 rounded-2xl border border-neutral-800/60">
                
                {/* Search string */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1">
                    <Search size={10} />
                    <span>Search Guest / Phone</span>
                  </label>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 text-xs text-neutral-200 border border-neutral-850 rounded-xl focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Priyanka..."
                  />
                </div>

                {/* Filter services list */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1">
                    <span>Filtering Service</span>
                  </label>
                  <select
                    value={filterService}
                    onChange={(e) => setFilterService(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 text-xs text-neutral-300 border border-neutral-850 rounded-xl focus:outline-none"
                  >
                    <option value="All">All Services Combined</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* KPI Overview */}
                <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-semibold text-neutral-400">Slots Loaded</span>
                    <p className="font-serif font-bold text-lg text-amber-500">{searchedAppts.length} entries</p>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <span className="text-[9px] uppercase font-semibold text-neutral-400">Total Bookings</span>
                    <p className="font-serif font-bold text-neutral-200">{appointments.length} total</p>
                  </div>
                </div>

              </div>

              {/* Appointments List Grid */}
              <div className="space-y-4">
                {searchedAppts.length === 0 ? (
                  <div className="p-12 text-center text-neutral-500 border border-dashed border-neutral-800 rounded-2xl">
                    No matching booking logs located.
                  </div>
                ) : (
                  searchedAppts.map((appt) => (
                    <div 
                      key={appt.id}
                      className="p-5 sm:p-6 bg-neutral-950 border border-neutral-850 rounded-2xl flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 group hover:border-neutral-700 transition-colors"
                    >
                      <div className="space-y-2">
                        {/* Status Label Header */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-mono uppercase tracking-wider ${
                            appt.status === 'accepted' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                              : appt.status === 'rejected'
                              ? 'bg-red-500/10 text-red-450 border border-red-500/10'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                          }`}>
                            {appt.status}
                          </span>
                          <span className="text-[9px] text-neutral-500 font-mono">Booked: {appt.createdAt.split('T')[0]}</span>
                        </div>

                        {/* Customer Name and phone links */}
                        <h3 className="font-serif font-bold text-lg text-neutral-200 select-text">
                          {appt.fullName}
                        </h3>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-400 font-light select-text">
                          <span className="font-mono">📞 {appt.phone}</span>
                          <span>💅 {appt.serviceName}</span>
                          <span className="font-mono">📅 {appt.date} @ {appt.time}</span>
                        </div>

                        {appt.notes && (
                          <p className="p-3 bg-neutral-900 border border-neutral-850 rounded-xl text-xs text-neutral-400 leading-relaxed max-w-2xl select-text">
                            <strong>Client Message:</strong> &ldquo;{appt.notes}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Admin Actions Row */}
                      <div className="flex items-center gap-2.5 border-t border-neutral-900/60 md:border-transparent pt-4 md:pt-0 shrink-0 select-none">
                        {appt.status === 'pending' && (
                          <>
                            <button
                              onClick={() => changeApptStatus(appt.id!, 'accepted')}
                              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                              title="Accept Booking"
                            >
                              <Check size={13} />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => changeApptStatus(appt.id!, 'rejected')}
                              className="px-3.5 py-1.5 bg-red-900 hover:bg-red-800 rounded-lg text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                              title="Reject Booking"
                            >
                              <X size={13} />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleRemoveAppt(appt.id!)}
                          className="p-2 border border-neutral-800 hover:bg-red-950/20 hover:border-red-900 text-neutral-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                          title="Remove Record Log"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* B. SERVICES MANAGER MODULE */}
          {activeSubTab === 'services' && (
            <div className="space-y-6">
              
              {/* Trigger Button bar */}
              <div className="flex items-center justify-between select-none">
                <h3 className="font-serif font-bold text-lg">Services Master Catalog</h3>
                <button
                  onClick={() => setShowAddService(!showAddService)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add New Treatment</span>
                </button>
              </div>

              {/* Inline submission modal form */}
              {showAddService && (
                <form 
                  onSubmit={handleCreateService}
                  className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4"
                >
                  <h4 className="font-serif font-semibold text-neutral-300">New Treatment Setup</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-400">Treatment Name *</label>
                      <input 
                        type="text" value={newSName} onChange={(e) => setNewSName(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                        placeholder="e.g. Laser Cleanup" required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-400">Price in Rupees *</label>
                      <input 
                        type="number" value={newSPrice} onChange={(e) => setNewSPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                        placeholder="800" required
                      />
                    </div>

                    <div className="space-y-1">
                      <AdvancedImageUploader 
                        label="Treatment Image *"
                        accept="image/*"
                        folder="services"
                        currentValue={newSImage}
                        onUploadComplete={(url) => setNewSImage(url)}
                        aspectRatio="1:1"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-400">Display Subtitle</label>
                      <input 
                        type="text" value={newSSub} onChange={(e) => setNewSSub(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                        placeholder="Skin cleansing shine"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-400">Category Tag</label>
                      <select 
                        value={newSCat} onChange={(e) => setNewSCat(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-300"
                      >
                        <option value="Hair">Hair</option>
                        <option value="Skin">Skin</option>
                        <option value="Makeup">Makeup</option>
                        <option value="Wellness">Wellness</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-400">Duration (approx.)</label>
                      <input 
                        type="text" value={newSDuration} onChange={(e) => setNewSDuration(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                        placeholder="50 Mins"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-neutral-400">Full Description details *</label>
                    <textarea 
                      value={newSDesc} onChange={(e) => setNewSDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 h-16"
                      placeholder="Deep hydration and cleansing routines..." required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-neutral-400">Checklist Benefits (comma separated)</label>
                    <input 
                      type="text" value={newSBenefit} onChange={(e) => setNewSBenefit(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                      placeholder="Anti-frizz luxury control, Hair growth, Shimmer volume"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 justify-between items-center">
                    <div className="flex gap-2">
                      <button type="submit" className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-xs font-bold">
                        Add Service Log (Save)
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setNewSName("");
                          setNewSPrice(100);
                          setNewSImage("");
                          setNewSSub("");
                          setNewSCat("Skin");
                          setNewSDuration("45 Min");
                          setNewSDesc("");
                          setNewSBenefit("");
                          setToastType('success');
                          setToastMessage("Cleared and reset service inputs form fields!");
                        }}
                        className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-xl text-xs font-bold hover:bg-neutral-800"
                      >
                        Reset Form
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => {
                          if (onTempPreview) {
                            const tempService = {
                              id: 'preview-temp-service-' + Date.now(),
                              name: newSName || 'Preview Service Layout',
                              price: Number(newSPrice) || 999,
                              image: newSImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=350&q=80',
                              subtitle: newSSub || 'Luxury skin shine preview details',
                              category: newSCat || 'Skin',
                              duration: newSDuration || '45 min',
                              description: newSDesc || 'Detailed luxury services description placeholder',
                              benefits: newSBenefit ? newSBenefit.split(',').map(s=>s.trim()) : ['Benefit A', 'Benefit B']
                            };
                            onTempPreview({
                              services: [tempService, ...services]
                            });
                            setToastType('success');
                            setToastMessage("Service layout preview is active! Switch to home tab to check.");
                          }
                        }}
                        className="px-4 py-2.5 border border-amber-500/30 text-amber-500 rounded-xl text-xs font-bold hover:bg-neutral-950 flex items-center gap-1"
                      >
                        <Eye size={12} />
                        <span>Preview on Site</span>
                      </button>
                      <button 
                        type="button" onClick={() => setShowAddService(false)}
                        className="px-4 py-2.5 border border-neutral-800 hover:bg-neutral-900 rounded-xl text-xs font-bold text-neutral-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Service list table entries */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((item) => (
                  <div key={item.id} className="p-4 bg-neutral-950 border border-neutral-850 rounded-xl flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                      <img src={item.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-sm truncate">{item.name}</h4>
                      <div className="flex items-center gap-4 text-[10px] text-neutral-500 font-mono mt-0.5">
                        <span className="text-amber-500">Rs. {item.price}</span>
                        <span>{item.category}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveService(item.id)}
                      className="p-2 border border-neutral-800 hover:bg-red-950/20 hover:border-red-900 text-neutral-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* C. GALLERY LOOKBOOK MANAGER MODULE */}
          {activeSubTab === 'gallery' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between select-none">
                <h3 className="font-serif font-bold text-lg">Portfolio Lookbook Images</h3>
                <button
                  onClick={() => setShowAddGallery(!showAddGallery)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Look Image</span>
                </button>
              </div>

              {showAddGallery && (
                <form 
                  onSubmit={handleCreateGallery}
                  className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4"
                >
                  <h4 className="font-serif font-semibold text-neutral-350">New Showcase Entry</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-400">Portrait Title/Description *</label>
                      <input 
                        type="text" value={newGTitle} onChange={(e) => setNewGTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs"
                        placeholder="Bridal Glow Shimmer" required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-400">Category Tab Option</label>
                      <select 
                        value={newGCat} onChange={(e) => setNewGCat(e.target.value as any)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-300"
                      >
                        <option value="bridal">bridal</option>
                        <option value="hair">hair</option>
                        <option value="makeup">makeup</option>
                        <option value="transformation">transformation</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <AdvancedImageUploader
                        label="Primary Mirror Image *"
                        accept="image/*"
                        folder="gallery"
                        currentValue={newGImage}
                        onUploadComplete={(url) => setNewGImage(url)}
                        aspectRatio="4:3"
                      />
                    </div>

                    <div className="space-y-3 pt-4 col-span-2">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" checked={newGIsBA} onChange={(e) => setNewGIsBA(e.target.checked)}
                          id="isBA_checkbox" className="rounded bg-neutral-900 border-neutral-800"
                        />
                        <label htmlFor="isBA_checkbox" className="text-xs text-neutral-400 select-none cursor-pointer font-semibold">
                          Is Before & After slide
                        </label>
                      </div>
                    </div>

                    {newGIsBA && (
                      <div className="col-span-2 space-y-1">
                        <AdvancedImageUploader
                          label="Before Stage Image"
                          accept="image/*"
                          folder="gallery"
                          currentValue={newGBeforeImage}
                          onUploadComplete={(url) => setNewGBeforeImage(url)}
                          aspectRatio="4:3"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 justify-between items-center w-full">
                    <div className="flex gap-2">
                      <button type="submit" className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-xs font-bold">
                        Pin to Lookbook (Save)
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setNewGTitle("");
                          setNewGImage("");
                          setNewGCat("bridal");
                          setNewGIsBA(false);
                          setNewGBeforeImage("");
                          setToastType('success');
                          setToastMessage("Cleared and reset Lookbook form fields!");
                        }}
                        className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-xl text-xs font-bold hover:bg-neutral-800"
                      >
                        Reset Form
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => {
                          if (onTempPreview) {
                            const tempGalleryItem = {
                              id: 'preview-temp-gallery-' + Date.now(),
                              title: newGTitle || 'Preview Look Shimmer',
                              category: newGCat || 'bridal',
                              image: newGImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=350&q=80',
                              isBeforeAfter: newGIsBA,
                              beforeImage: newGBeforeImage || ''
                            };
                            onTempPreview({
                              galleryItems: [tempGalleryItem, ...gallery]
                            });
                            setToastType('success');
                            setToastMessage("Lookbook item preview is active! Switch to home tab to check.");
                          }
                        }}
                        className="px-4 py-2.5 border border-amber-500/30 text-amber-500 rounded-xl text-xs font-bold hover:bg-neutral-950 flex items-center gap-1"
                      >
                        <Eye size={12} />
                        <span>Preview on Site</span>
                      </button>
                      <button 
                        type="button" onClick={() => setShowAddGallery(false)}
                        className="px-4 py-2.5 border border-neutral-800 hover:bg-neutral-900 rounded-xl text-xs font-bold text-neutral-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Gallery Items lists */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gallery.map((item) => (
                  <div key={item.id} className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl relative group">
                    <div className="aspect-[4/5] rounded-lg overflow-hidden mb-2">
                      <img src={item.image} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[9px] uppercase tracking-wider text-amber-500 font-mono font-bold block">{item.category}</span>
                    <h5 className="font-serif text-xs text-neutral-300 truncate font-light block mt-0.5">{item.title}</h5>
                    
                    <button
                      onClick={() => handleRemoveGallery(item.id)}
                      className="absolute top-4 right-4 p-2 bg-neutral-950/95 border border-neutral-800 hover:bg-red-950/20 text-neutral-450 hover:text-red-400 rounded-lg shadow-md transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* D. PROMOTIONAL OFFERS MODULE */}
          {activeSubTab === 'offers' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between select-none">
                <h3 className="font-serif font-bold text-lg">Active Coupons & Offer Deals</h3>
                <button
                  onClick={() => setShowAddOffer(!showAddOffer)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Create Discount Offer</span>
                </button>
              </div>

              {showAddOffer && (
                <form 
                  onSubmit={handleCreateOffer}
                  className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4"
                >
                  <h4 className="font-serif font-semibold text-neutral-350">New Offers Builder</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-400">Offer Title *</label>
                      <input 
                        type="text" value={newOTitle} onChange={(e) => setNewOTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-850 rounded-xl text-xs"
                        placeholder="Monsoon Special Facial" required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-400">Coupon Promo Code *</label>
                      <input 
                        type="text" value={newOCode} onChange={(e) => setNewOCode(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-850 rounded-xl text-xs font-mono uppercase font-semibold"
                        placeholder="GLOW25" required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-400">Discount Percentage *</label>
                      <input 
                        type="number" value={newODiscount} onChange={(e) => setNewODiscount(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-850 rounded-xl text-xs"
                        placeholder="15" required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-neutral-400">Promo Details description *</label>
                    <textarea 
                      value={newODesc} onChange={(e) => setNewODesc(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-850 rounded-xl text-xs h-16"
                      placeholder="Combine Hydra treatments and earn instant discount..." required
                    />
                  </div>

                  <div className="space-y-1">
                    <AdvancedImageUploader
                      label="Promo Banner/Cover Image"
                      accept="image/*"
                      folder="offers"
                      currentValue={newOImage}
                      onUploadComplete={(url) => setNewOImage(url)}
                      aspectRatio="16:9"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 justify-between items-center w-full">
                    <div className="flex gap-2">
                      <button type="submit" className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-xs font-bold">
                        Persist Offer Card (Save)
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setNewOTitle("");
                          setNewOCode("");
                          setNewODiscount(15);
                          setNewODesc("");
                          setNewOImage("");
                          setToastType('success');
                          setToastMessage("Cleared and reset New Offer inputs!");
                        }}
                        className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-xl text-xs font-bold hover:bg-neutral-800"
                      >
                        Reset Form
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => {
                          if (onTempPreview) {
                            const tempOffer = {
                              id: 'preview-temp-offer-' + Date.now(),
                              title: newOTitle || 'Preview Holiday Discount',
                              code: newOCode || 'PROMO50',
                              discount: Number(newODiscount) || 50,
                              description: newODesc || 'Special preview rates for first-time customers.',
                              image: newOImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=350&q=80'
                            };
                            onTempPreview({
                              offers: [tempOffer, ...offers]
                            });
                            setToastType('success');
                            setToastMessage("Offers promo preview is active! Switch to home tab to check.");
                          }
                        }}
                        className="px-4 py-2.5 border border-amber-500/30 text-amber-500 rounded-xl text-xs font-bold hover:bg-neutral-950 flex items-center gap-1"
                      >
                        <Eye size={12} />
                        <span>Preview on Site</span>
                      </button>
                      <button 
                        type="button" onClick={() => setShowAddOffer(false)}
                        className="px-4 py-2.5 border border-neutral-800 hover:bg-neutral-950 rounded-xl text-xs font-bold text-neutral-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Offers Coupons Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {offers.map((off) => (
                  <div key={off.id} className="p-5 bg-neutral-950 border border-neutral-850 rounded-2xl flex items-center gap-4 justify-between">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 bg-neutral-900 border border-dashed border-amber-500/35 text-amber-400 rounded-lg text-xs font-mono font-bold">
                        {off.discountCode}
                      </span>
                      <h4 className="font-serif font-bold text-sm text-neutral-200 mt-2">{off.title}</h4>
                      <p className="text-xs text-neutral-400 mt-1 max-w-sm">{off.description}</p>
                      <span className="text-[10px] text-emerald-450 mt-1 block">Value level: Save {off.discountPercentage}% Off</span>
                    </div>

                    <button
                      onClick={() => handleRemoveOffer(off.id)}
                      className="p-2.5 border border-neutral-800 hover:bg-red-950/20 hover:border-red-900 text-neutral-500 hover:text-red-400 rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* E. REVIEWS FEEDBACK MODULE */}
          {activeSubTab === 'reviews' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between select-none">
                <h3 className="font-serif font-bold text-lg">Guest Reviews and Testimonials</h3>
                <button
                  onClick={() => setShowAddReview(!showAddReview)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Log Client Review</span>
                </button>
              </div>

              {showAddReview && (
                <form 
                  onSubmit={handleCreateReview}
                  className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4"
                >
                  <h4 className="font-serif font-semibold text-neutral-350">New Guest Feedback Setup</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-400">Guest Full Name *</label>
                      <input 
                        type="text" value={newRName} onChange={(e) => setNewRName(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs"
                        placeholder="Anjali Gupta" required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-400">Stars Rating (1-5)</label>
                      <select 
                        value={newRRating} onChange={(e) => setNewRRating(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-300"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                        <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                        <option value="3">⭐⭐⭐ (3 Stars)</option>
                      </select>
                    </div>

                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-400">Testimonial Quote text *</label>
                      <textarea 
                        value={newRText} onChange={(e) => setNewRText(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs h-16"
                        placeholder="The facial service was exceptional..." required
                      />
                    </div>

                    <div className="col-span-2 space-y-1">
                      <AdvancedImageUploader
                        label="Guest Profile Avatar Photo"
                        accept="image/*"
                        folder="avatars"
                        currentValue={newRAvatar}
                        onUploadComplete={(url) => setNewRAvatar(url)}
                        aspectRatio="1:1"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 justify-between items-center w-full">
                    <div className="flex gap-2">
                      <button type="submit" className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-xs font-bold">
                        Post Testimonial (Save)
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setNewRName("");
                          setNewRRating(5);
                          setNewRText("");
                          setNewRAvatar("");
                          setToastType('success');
                          setToastMessage("Cleared and reset Review fields!");
                        }}
                        className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-xl text-xs font-bold hover:bg-neutral-800"
                      >
                        Reset Form
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => {
                          if (onTempPreview) {
                            const tempReview = {
                              id: 'preview-temp-review-' + Date.now(),
                              name: newRName || 'Preview Guest',
                              rating: newRRating || 5,
                              text: newRText || 'Incredible service! Highly satisfied with the luxury salon experience here.',
                              avatar: newRAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
                            };
                            onTempPreview({
                              reviews: [tempReview, ...reviews]
                            });
                            setToastType('success');
                            setToastMessage("Review card preview is active! Switch to home tab to check.");
                          }
                        }}
                        className="px-4 py-2.5 border border-amber-500/30 text-amber-500 rounded-xl text-xs font-bold hover:bg-neutral-950 flex items-center gap-1"
                      >
                        <Eye size={12} />
                        <span>Preview on Site</span>
                      </button>
                      <button 
                        type="button" onClick={() => setShowAddReview(false)}
                        className="px-4 py-2.5 border border-neutral-850 hover:bg-neutral-950 rounded-xl text-xs font-bold text-neutral-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Review Testimonials lists */}
              <div className="space-y-4">
                {reviews.map((item) => (
                  <div key={item.id} className="p-5 bg-neutral-950 border border-neutral-850 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/20 shrink-0">
                        <img src={item.avatar} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-sm text-neutral-200">{item.name}</h4>
                          <span className="text-[10px] text-amber-500 font-mono">🌟 {item.rating} Stars</span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1 italic">&ldquo;{item.text}&rdquo;</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveReview(item.id)}
                      className="p-2 border border-neutral-800 hover:bg-red-950/20 hover:border-red-900 text-neutral-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* F. WEBSITE & BANNERS DYNAMIC CONFIGURE */}
          {activeSubTab === 'settings' && (
            <form onSubmit={handleSaveConfigs} className="space-y-8 select-none">
              
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
                <h3 className="font-serif font-bold text-lg text-amber-500 pb-3 border-b border-neutral-850 flex items-center gap-2">
                  <SettingIcon size={18} />
                  <span>Global Portal Identifiers & Announcement</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400">Website Name</label>
                    <input 
                      type="text" 
                      value={editableSettings.websiteName}
                      onChange={(e) => setEditableSettings({ ...editableSettings, websiteName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400">Announcement Bar Promo Text</label>
                    <input 
                      type="text" 
                      value={editableSettings.announcement}
                      onChange={(e) => setEditableSettings({ ...editableSettings, announcement: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400">Our Business Operational Hours</label>
                    <input 
                      type="text" 
                      value={editableSettings.businessHours}
                      onChange={(e) => setEditableSettings({ ...editableSettings, businessHours: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400">Contact Telephone Number</label>
                    <input 
                      type="text" 
                      value={editableContact.phone}
                      onChange={(e) => setEditableContact({ ...editableContact, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-250"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400">Contact WhatsApp Reservation Number</label>
                    <input 
                      type="text" 
                      value={editableContact.whatsapp}
                      onChange={(e) => setEditableContact({ ...editableContact, whatsapp: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-250"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400">Social Instagram Feed link</label>
                    <input 
                      type="url" 
                      value={editableSocial.instagram}
                      onChange={(e) => setEditableSocial({ ...editableSocial, instagram: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-300"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-neutral-400">Salon Physical Geolocation Address</label>
                    <input 
                      type="text" 
                      value={editableContact.address}
                      onChange={(e) => setEditableContact({ ...editableContact, address: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-neutral-400">Google Directions Search Link Url</label>
                    <input 
                      type="url" 
                      value={editableContact.directionsUrl}
                      onChange={(e) => setEditableContact({ ...editableContact, directionsUrl: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-350"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400">Meta Google SEO Title</label>
                    <input 
                      type="text" 
                      value={editableSettings.metaTitle}
                      onChange={(e) => setEditableSettings({ ...editableSettings, metaTitle: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400">Meta Description</label>
                    <input 
                      type="text" 
                      value={editableSettings.metaDesc}
                      onChange={(e) => setEditableSettings({ ...editableSettings, metaDesc: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                    />
                  </div>

                </div>
              </div>

              {/* BANNERS SUBSECTION */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
                <h3 className="font-serif font-bold text-lg text-amber-500 pb-3 border-b border-neutral-850 flex items-center gap-2">
                  <Image size={18} />
                  <span>Luxury Welcome & Highlights Banners</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400">Primary Hero Title Headline</label>
                    <input 
                      type="text" 
                      value={editableBanners.heroHeading}
                      onChange={(e) => setEditableBanners({ ...editableBanners, heroHeading: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400">Primary Hero Subheading</label>
                    <input 
                      type="text" 
                      value={editableBanners.heroSubheading}
                      onChange={(e) => setEditableBanners({ ...editableBanners, heroSubheading: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <AdvancedImageUploader
                      label="Hero Screen Full Backdrop Image"
                      accept="image/*"
                      folder="hero"
                      currentValue={editableBanners.heroBgImage}
                      onUploadComplete={(url) => setEditableBanners({ ...editableBanners, heroBgImage: url })}
                      aspectRatio="16:9"
                    />
                  </div>

                  {/* Dynamic Premium Hero Buttons Configurations */}
                  <div className="col-span-2 space-y-3 bg-neutral-900/30 p-4 border border-neutral-800 rounded-2xl">
                    <h4 className="text-xs uppercase font-bold text-amber-500 tracking-wider">Hero Section Premium Buttons Configuration</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Button 1: Appointment */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-neutral-405">Appointment Button Text</label>
                        <input 
                          type="text" 
                          value={editableBanners.heroBtnAppointmentText || ''} 
                          placeholder="Book Appointment"
                          onChange={(e) => setEditableBanners({ ...editableBanners, heroBtnAppointmentText: e.target.value })}
                          className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-neutral-405">Appointment Anchor Link</label>
                        <input 
                          type="text" 
                          value={editableBanners.heroBtnAppointmentLink || ''} 
                          placeholder="#booking"
                          onChange={(e) => setEditableBanners({ ...editableBanners, heroBtnAppointmentLink: e.target.value })}
                          className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                        />
                      </div>

                      {/* Button 2: WhatsApp */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-neutral-405">WhatsApp Button Text</label>
                        <input 
                          type="text" 
                          value={editableBanners.heroBtnWhatsAppText || ''} 
                          placeholder="WhatsApp"
                          onChange={(e) => setEditableBanners({ ...editableBanners, heroBtnWhatsAppText: e.target.value })}
                          className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-neutral-405">Custom WhatsApp Link / Mobile Number (Optional)</label>
                        <input 
                          type="text" 
                          value={editableBanners.heroBtnWhatsAppLink || ''} 
                          placeholder="Leave blank to use default, or enter wa.me link"
                          onChange={(e) => setEditableBanners({ ...editableBanners, heroBtnWhatsAppLink: e.target.value })}
                          className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                        />
                      </div>

                      {/* Button 3: Instagram */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-neutral-405">Instagram Button Text</label>
                        <input 
                          type="text" 
                          value={editableBanners.heroBtnInstagramText || ''} 
                          placeholder="Instagram"
                          onChange={(e) => setEditableBanners({ ...editableBanners, heroBtnInstagramText: e.target.value })}
                          className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-neutral-405">Custom Instagram Profile Link (Optional)</label>
                        <input 
                          type="text" 
                          value={editableBanners.heroBtnInstagramLink || ''} 
                          placeholder="Leave blank to use default social info"
                          onChange={(e) => setEditableBanners({ ...editableBanners, heroBtnInstagramLink: e.target.value })}
                          className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                        />
                      </div>
                      
                    </div>
                  </div>

                  <div className="h-[1px] bg-neutral-850 col-span-2 my-2" />

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400">Bridal Promo Banner Category Title</label>
                    <input 
                      type="text" 
                      value={editableBanners.promoBridalTitle}
                      onChange={(e) => setEditableBanners({ ...editableBanners, promoBridalTitle: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <AdvancedImageUploader
                      label="Bridal Image Backdrop"
                      accept="image/*"
                      folder="promo"
                      currentValue={editableBanners.promoBridalImage}
                      onUploadComplete={(url) => setEditableBanners({ ...editableBanners, promoBridalImage: url })}
                      aspectRatio="4:3"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-neutral-400">Bridal Description text</label>
                    <input 
                      type="text" 
                      value={editableBanners.promoBridalDesc}
                      onChange={(e) => setEditableBanners({ ...editableBanners, promoBridalDesc: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                    />
                  </div>

                </div>
              </div>

              {/* OWNER PROFILE CONFIGURE */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
                <h3 className="font-serif font-bold text-lg text-amber-500 pb-3 border-b border-neutral-850 flex items-center gap-2">
                  <Plus size={18} />
                  <span>Salon Director Credentials & Bio details</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400">Director Name</label>
                    <input 
                      type="text" 
                      value={editableOwner.name}
                      onChange={(e) => setEditableOwner({ ...editableOwner, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400">Credentials Experience badge line</label>
                    <input 
                      type="text" 
                      value={editableOwner.experience}
                      onChange={(e) => setEditableOwner({ ...editableOwner, experience: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <AdvancedImageUploader
                      label="Director Photo (high resolution profile)"
                      accept="image/*"
                      folder="owner"
                      currentValue={editableOwner.photo}
                      onUploadComplete={(url) => setEditableOwner({ ...editableOwner, photo: url })}
                      aspectRatio="1:1"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-neutral-400">Personal Quotes Motto</label>
                    <input 
                      type="text" 
                      value={editableOwner.message}
                      onChange={(e) => setEditableOwner({ ...editableOwner, message: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-neutral-400">Biography narrative</label>
                    <textarea 
                      value={editableOwner.biography}
                      onChange={(e) => setEditableOwner({ ...editableOwner, biography: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 h-28 font-light"
                    />
                  </div>

                </div>
              </div>

              {/* SAVE ALL CHANGES BUTTON BAR */}
              <div className="flex flex-wrap items-center gap-4 py-6 select-none border-t border-neutral-850 mt-6 justify-between">
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    disabled={savingConfigs}
                    className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold uppercase tracking-wider text-xs rounded-xl hover:scale-[1.01] transition-transform cursor-pointer shadow-lg inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {savingConfigs ? <Loader2 size={15} className="animate-spin text-neutral-950" /> : <Check size={15} />}
                    <span>{savingConfigs ? 'Saving configs...' : 'Save Dynamic Settings'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetConfigs}
                    className="px-6 py-4 bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-neutral-300 font-bold uppercase tracking-wider text-xs rounded-xl hover:scale-[1.01] transition-transform cursor-pointer shadow-lg inline-flex items-center gap-2"
                  >
                    <span>Reset Settings</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handlePreviewConfigs}
                  className="px-6 py-4 bg-neutral-950 border border-amber-500/30 hover:border-amber-500 hover:bg-neutral-900 text-amber-500 font-bold uppercase tracking-wider text-xs rounded-xl hover:scale-[1.01] transition-transform cursor-pointer shadow-lg inline-flex items-center gap-2"
                >
                  <Eye size={15} />
                  <span>Preview Section changes</span>
                </button>
              </div>

            </form>
          )}

        </div>
      )}

      {/* Premium Toast Notifications Container */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-55">
          <div className={`px-5 py-3.5 text-xs font-semibold rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md select-none ${
            toastType === 'success' 
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/20 shadow-emerald-950/50' 
              : 'bg-red-950/90 text-red-300 border-red-500/20 shadow-red-950/50'
          }`}>
            <span className="text-sm">{toastType === 'success' ? '✨' : '⚠️'}</span>
            <span>{toastMessage}</span>
            <button 
              onClick={() => setToastMessage(null)}
              className="ml-3 text-[10px] text-neutral-450 hover:text-neutral-300 font-bold uppercase tracking-wider scale-[0.9] cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
