/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Instagram, 
  Star, 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  Play, 
  X, 
  Film, 
  Video as VideoIcon, 
  Image as ImageIcon 
} from 'lucide-react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db, isMockFirebase } from '../lib/firebase';
import { 
  getInstagramSettings, 
  getInstagramPosts, 
  getInstagramVideos, 
  getInstagramReels 
} from '../lib/db';
import { 
  Review, 
  SocialLinks, 
  InstagramSettings, 
  InstagramPost, 
  InstagramVideo, 
  InstagramReel 
} from '../types';

interface InstagramReviewsStatsProps {
  socialLinks: SocialLinks;
  reviews: Review[];
  showOnly?: 'reviews' | 'instagram';
}

export const InstagramReviewsStats: React.FC<InstagramReviewsStatsProps> = ({ socialLinks, reviews, showOnly }) => {
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);

  // Dynamic Instagram states
  const [settings, setSettings] = useState<InstagramSettings>({
    profileUrl: socialLinks?.instagram || "https://instagram.com/anikamakeover45",
    followButtonLink: socialLinks?.instagram || "https://instagram.com/anikamakeover45",
    username: "anikamakeover45",
    heading: "Join Our Visual Instagram Journey",
    description: "Live Feed Showcase & Interactive Portfolio"
  });

  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [videos, setVideos] = useState<InstagramVideo[]>([]);
  const [reels, setReels] = useState<InstagramReel[]>([]);
  const [activeTab, setActiveTab] = useState<'photos' | 'reels' | 'videos'>('photos');
  
  // Modal tracking
  const [activeVideoPlayback, setActiveVideoPlayback] = useState<{ url: string; title: string; isReel?: boolean } | null>(null);

  useEffect(() => {
    if (!isMockFirebase) {
      // 1. Settings listener
      const unsubSettings = onSnapshot(doc(db, 'instagramSettings', 'main'), (snap) => {
        if (snap.exists()) {
          setSettings(snap.data() as InstagramSettings);
        } else {
          getInstagramSettings().then(setSettings);
        }
      }, (err) => {
        console.warn("Settings snap listener failed:", err);
        getInstagramSettings().then(setSettings);
      });

      // 2. Posts listener
      const unsubPosts = onSnapshot(collection(db, 'instagramPosts'), (snap) => {
        const temp: InstagramPost[] = [];
        snap.forEach((d) => {
          temp.push({ ...(d.data() as InstagramPost), id: d.id });
        });
        setPosts(temp.sort((a, b) => (a.order || 0) - (b.order || 0)));
      }, (err) => {
        console.warn("Posts snap listener failed:", err);
        getInstagramPosts().then(setPosts);
      });

      // 3. Videos listener
      const unsubVideos = onSnapshot(collection(db, 'instagramVideos'), (snap) => {
        const temp: InstagramVideo[] = [];
        snap.forEach((d) => {
          temp.push({ ...(d.data() as InstagramVideo), id: d.id });
        });
        setVideos(temp);
      }, (err) => {
        console.warn("Videos snap listener failed:", err);
        getInstagramVideos().then(setVideos);
      });

      // 4. Reels listener
      const unsubReels = onSnapshot(collection(db, 'instagramReels'), (snap) => {
        const temp: InstagramReel[] = [];
        snap.forEach((d) => {
          temp.push({ ...(d.data() as InstagramReel), id: d.id });
        });
        setReels(temp);
      }, (err) => {
        console.warn("Reels snap listener failed:", err);
        getInstagramReels().then(setReels);
      });

      return () => {
        unsubSettings();
        unsubPosts();
        unsubVideos();
        unsubReels();
      };
    } else {
      // fallback in development mock mode
      getInstagramSettings().then(setSettings);
      getInstagramPosts().then(setPosts);
      getInstagramVideos().then(setVideos);
      getInstagramReels().then(setReels);

      const timer = setInterval(() => {
        getInstagramSettings().then(setSettings);
        getInstagramPosts().then(setPosts);
        getInstagramVideos().then(setVideos);
        getInstagramReels().then(setReels);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [socialLinks]);

  const handleNextReview = () => {
    if (reviews.length > 0) {
      setActiveReviewIdx((activeReviewIdx + 1) % reviews.length);
    }
  };

  const handlePrevReview = () => {
    if (reviews.length > 0) {
      setActiveReviewIdx((activeReviewIdx - 1 + reviews.length) % reviews.length);
    }
  };

  // Only display posts marked as visible
  const customerVisiblePosts = posts.filter(p => p.visible !== false);

  return (
    <div className="bg-neutral-950 text-neutral-100 divide-y divide-neutral-900 overflow-hidden">
      
      {/* 1. REVIEWS / TESTIMONIALS SLIDER SECTION */}
      {(!showOnly || showOnly === 'reviews') && (
        <section id="reviews" className="py-20 sm:py-24 bg-neutral-900/40 relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-xs uppercase tracking-widest mb-6">
              <MessageSquare size={12} />
              <span>Guest Journeys</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight text-neutral-100 mb-14">
              Loved By Hundreds of Modern Women
            </h2>

            {reviews.length === 0 ? (
              <p className="text-neutral-500 italic py-8">No feedback records found. Submit some below!</p>
            ) : (
              <div className="space-y-8 max-w-3xl mx-auto">
                <div className="p-8 sm:p-12 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl relative min-h-[220px] flex flex-col justify-between">
                  
                  <span className="absolute top-4 left-6 text-7xl font-serif text-amber-500/10 select-none pointer-events-none">&ldquo;</span>

                  <div className="flex items-center justify-center gap-1 mb-6">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star 
                        key={idx} 
                        size={18} 
                        className={idx < (reviews[activeReviewIdx]?.rating || 5) ? "fill-amber-500 text-amber-500" : "text-neutral-700"} 
                      />
                    ))}
                  </div>

                  <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-light italic font-serif select-text">
                    &ldquo;{reviews[activeReviewIdx]?.text}&rdquo;
                  </p>

                  <div className="flex items-center justify-center gap-3.5 mt-8 border-t border-neutral-800/80 pt-6">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500/20">
                      <img 
                        src={reviews[activeReviewIdx]?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"} 
                        alt={reviews[activeReviewIdx]?.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <span className="block font-serif font-bold text-sm text-neutral-200">
                        {reviews[activeReviewIdx]?.name}
                      </span>
                      <span className="block text-[10px] uppercase font-mono text-neutral-500 tracking-wider">
                        Verified Salon Guest ({reviews[activeReviewIdx]?.createdAt || 'June 2026'})
                      </span>
                    </div>
                  </div>

                </div>

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={handlePrevReview}
                    className="p-2.5 rounded-full bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
                    title="Previous testimonial"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-neutral-500 select-none">
                    <span className="font-semibold text-neutral-300">{activeReviewIdx + 1}</span>
                    <span>/</span>
                    <span>{reviews.length}</span>
                  </div>
                  <button
                    onClick={handleNextReview}
                    className="p-2.5 rounded-full bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
                    title="Next testimonial"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

          </div>
        </section>
      )}

      {/* 2. INSTAGRAM LIVE STREAMING SECTION (100% REALTIME DYNAMIC) */}
      {(!showOnly || showOnly === 'instagram') && (
        <section id="instagram" className="py-20 sm:py-24 bg-neutral-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header part with Settings values */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
              <div className="text-center md:text-left">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-500 uppercase tracking-widest font-semibold font-mono">
                  <Instagram size={13} className="animate-pulse" />
                  <span>@{settings.username || 'anikamakeover45'}</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-neutral-100 tracking-tight mt-1.5">
                  {settings.heading || "Join Our Visual Instagram Journey"}
                </h2>
                <p className="text-neutral-400 text-sm mt-1 max-w-xl">
                  {settings.description || "Live Feed Showcase & Interactive Portfolio"}
                </p>
              </div>

              <a 
                href={settings.followButtonLink || "https://instagram.com/anikamakeover45"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-neutral-900 hover:bg-zinc-800 border border-neutral-800 rounded-xl text-xs font-semibold tracking-wider uppercase text-pink-500 flex items-center justify-center gap-2 hover:scale-[1.03] transition-all"
              >
                <Instagram size={15} />
                <span>Follow @{settings.username || 'anikamakeover45'}</span>
              </a>
            </div>

            {/* TAB SELECTORS */}
            <div className="flex justify-center border-b border-neutral-800 mb-8 overflow-x-auto">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`py-3 text-xs font-medium uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'photos' 
                      ? 'border-amber-500 text-amber-500 font-bold' 
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <ImageIcon size={14} />
                  <span>Photos ({customerVisiblePosts.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('reels')}
                  className={`py-3 text-xs font-medium uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'reels' 
                      ? 'border-amber-500 text-amber-500 font-bold' 
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Film size={14} />
                  <span>Reels ({reels.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('videos')}
                  className={`py-3 text-xs font-medium uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'videos' 
                      ? 'border-amber-500 text-amber-500 font-bold' 
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <VideoIcon size={14} />
                  <span>IG Videos ({videos.length})</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: PHOTOS */}
            {activeTab === 'photos' && (
              <>
                {customerVisiblePosts.length === 0 ? (
                  <div className="py-16 text-center text-neutral-500 border border-neutral-900 rounded-2xl bg-neutral-900/10">
                    <ImageIcon size={32} className="mx-auto mb-3 text-neutral-700 font-light" />
                    <p className="font-serif italic text-sm">No visible Instagram posts to display.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {customerVisiblePosts.map((post) => (
                      <a 
                        key={post.id} 
                        href={settings.profileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="group relative block aspect-square rounded-2xl overflow-hidden tracking-wider text-xs border border-neutral-900 hover:border-neutral-800 bg-neutral-900"
                      >
                        <img 
                          src={post.image} 
                          alt={post.title || "Instagram Post"} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Hover elements */}
                        <div className="absolute inset-0 bg-neutral-950/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-4">
                          <p className="text-neutral-100 font-semibold mb-3 text-center line-clamp-2 max-w-[90%] font-serif">{post.title}</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-neutral-200">
                              <Heart size={14} className="fill-neutral-200 text-neutral-200" />
                              <span className="font-semibold">{post.likes || "1,120"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-neutral-200">
                              <MessageSquare size={14} className="fill-neutral-200 text-neutral-200" />
                              <span className="font-semibold">{post.comments || "75"}</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* TAB CONTENT: REELS */}
            {activeTab === 'reels' && (
              <>
                {reels.length === 0 ? (
                  <div className="py-16 text-center text-neutral-500 border border-neutral-900 rounded-2xl bg-neutral-900/10">
                    <Film size={32} className="mx-auto mb-3 text-neutral-700" />
                    <p className="font-serif italic text-sm">No reels posted yet. Manage reels from the Admin Panel.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {reels.map((reel) => (
                      <div 
                        key={reel.id}
                        onClick={() => setActiveVideoPlayback({ url: reel.video, title: reel.title, isReel: true })}
                        className="group relative aspect-[9/16] rounded-2xl overflow-hidden border border-neutral-900 hover:border-neutral-800 bg-neutral-900 cursor-pointer"
                      >
                        <video 
                          src={reel.video} 
                          muted 
                          playsInline 
                          loop
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                        
                        {/* Play Indicator Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent flex flex-col justify-between p-4">
                          <div className="flex justify-end">
                            <span className="p-1 px-2 bg-amber-500 text-neutral-950 text-[9px] uppercase font-mono font-bold rounded">Reel</span>
                          </div>
                          
                          <div className="text-left space-y-1">
                            <h3 className="font-bold text-xs leading-tight text-white line-clamp-1 font-serif">{reel.title}</h3>
                            {reel.description && <p className="text-[10px] text-neutral-300 line-clamp-2">{reel.description}</p>}
                          </div>
                        </div>

                        {/* Interactive Play Button overlay */}
                        <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-amber-500/90 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                            <Play size={18} className="fill-neutral-950 text-neutral-950" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* TAB CONTENT: VIDEOS */}
            {activeTab === 'videos' && (
              <>
                {videos.length === 0 ? (
                  <div className="py-16 text-center text-neutral-500 border border-neutral-900 rounded-2xl bg-neutral-900/10">
                    <VideoIcon size={32} className="mx-auto mb-3 text-neutral-700" />
                    <p className="font-serif italic text-sm">No IG videos uploaded yet. Manage videos in the Admin Dashboard.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {videos.map((vid) => (
                      <div 
                        key={vid.id}
                        className="p-4 rounded-3xl bg-neutral-900/40 border border-neutral-900 flex flex-col justify-between"
                      >
                        <div 
                          className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-950 group cursor-pointer border border-neutral-800"
                          onClick={() => setActiveVideoPlayback({ url: vid.video, title: vid.title })}
                        >
                          <video 
                            src={vid.video} 
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                              <Play size={18} className="fill-white text-white translate-x-0.5" />
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="text-[9px] uppercase tracking-wider font-mono text-amber-500 block mb-1">Live Instagram Playable</span>
                          <h3 className="font-serif font-bold text-sm text-neutral-200 line-clamp-1">{vid.title || "Untiled Instagram Video"}</h3>
                          <span className="text-[10px] text-neutral-500">{vid.createdAt ? new Date(vid.createdAt).toLocaleDateString() : 'Gorakhpur Luxe Spot'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

          </div>
        </section>
      )}

      {/* POPUP FULLSCREEN VIDEO REELS MODAL */}
      {activeVideoPlayback && (
        <div className="fixed inset-0 bg-neutral-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setActiveVideoPlayback(null)} />
          
          <div className={`relative bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl flex flex-col z-10 max-w-full ${
            activeVideoPlayback.isReel ? 'w-full max-w-[360px] aspect-[9/18]' : 'w-full max-w-3xl aspect-video'
          }`}>
            {/* Header Controls */}
            <div className="absolute top-4 right-4 z-20">
              <button 
                onClick={() => setActiveVideoPlayback(null)}
                className="p-2 bg-neutral-950/80 hover:bg-neutral-850 text-neutral-300 hover:text-white rounded-full transition-all border border-neutral-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Video Container */}
            <div className="flex-1 bg-neutral-950 flex items-center justify-center min-h-0">
              <video 
                src={activeVideoPlayback.url} 
                controls 
                autoPlay 
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Bottom info banner */}
            <div className="p-4 bg-neutral-900 border-t border-neutral-800 relative z-10">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-500 text-neutral-950 font-bold uppercase text-[9px] rounded">
                  {activeVideoPlayback.isReel ? "Interactive Reel" : "IG Video"}
                </span>
                <h3 className="font-serif font-bold text-sm text-neutral-100">{activeVideoPlayback.title}</h3>
              </div>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};
