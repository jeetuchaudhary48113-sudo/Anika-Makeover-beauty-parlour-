/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Instagram, Star, Users, Award, Heart, ShieldCheck, HeartCrack, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { Review, SocialLinks } from '../types';

interface InstagramReviewsStatsProps {
  socialLinks: SocialLinks;
  reviews: Review[];
}

export const InstagramReviewsStats: React.FC<InstagramReviewsStatsProps> = ({ socialLinks, reviews }) => {
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);

  // Stats values (dynamic - counters)
  const [clients, setClients] = useState(0);
  const [experience, setExperience] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [satisfaction, setSatisfaction] = useState(0);

  useEffect(() => {
    // Elegant incremental counter animation on mount
    const duration = 2000;
    const steps = 50;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setClients(Math.floor((4800 / steps) * step));
      setExperience(Math.floor((12 / steps) * step) || 12);
      setCompleted(Math.floor((8500 / steps) * step));
      setSatisfaction(Math.floor((99.8 / steps) * step) || 99);

      if (step >= steps) {
        setClients(4850);
        setExperience(12);
        setCompleted(8700);
        setSatisfaction(99.9);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

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

  // Mock Instagram Feed Details
  const instagramMockPosts = [
    {
      id: "ig-1",
      image: "https://images.unsplash.com/photo-1610030469668-9253339a91a8?auto=format&fit=crop&w=400&q=80",
      likes: "1,420",
      comments: "105"
    },
    {
      id: "ig-2",
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=400&q=80",
      likes: "985",
      comments: "64"
    },
    {
      id: "ig-3",
      image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400&q=80",
      likes: "2,110",
      comments: "250"
    },
    {
      id: "ig-4",
      image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=400&q=80",
      likes: "1,150",
      comments: "88"
    }
  ];

  return (
    <div className="bg-neutral-950 text-neutral-100 divide-y divide-neutral-900 overflow-hidden">
      
      {/* 1. STATISTICS COUNTERS SECTION */}
      <section className="py-20 bg-gradient-to-br from-neutral-950 via-neutral-900/40 to-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            
            <div className="p-6 bg-neutral-900/40 border border-neutral-800/60 rounded-2xl text-center flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                <Users size={24} />
              </div>
              <div>
                <span className="block font-sans font-bold text-3xl sm:text-4xl text-neutral-100 tracking-tight">
                  {clients.toLocaleString()}+
                </span>
                <span className="block text-[11px] uppercase tracking-widest text-neutral-400 mt-1 font-mono">
                  Happy Clients Served
                </span>
              </div>
            </div>

            <div className="p-6 bg-neutral-900/40 border border-neutral-800/60 rounded-2xl text-center flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                <Award size={24} />
              </div>
              <div>
                <span className="block font-sans font-bold text-3xl sm:text-4xl text-neutral-100 tracking-tight">
                  {experience}+ Years
                </span>
                <span className="block text-[11px] uppercase tracking-widest text-neutral-400 mt-1 font-mono">
                  Luxury Experience
                </span>
              </div>
            </div>

            <div className="p-6 bg-neutral-900/40 border border-neutral-800/60 rounded-2xl text-center flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                <Heart size={24} />
              </div>
              <div>
                <span className="block font-sans font-bold text-3xl sm:text-4xl text-neutral-100 tracking-tight">
                  {completed.toLocaleString()}+
                </span>
                <span className="block text-[11px] uppercase tracking-widest text-neutral-400 mt-1 font-mono">
                  Treatments Done
                </span>
              </div>
            </div>

            <div className="p-6 bg-neutral-900/40 border border-neutral-800/60 rounded-2xl text-center flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                <ShieldCheck size={24} />
              </div>
              <div>
                <span className="block font-sans font-bold text-3xl sm:text-4xl text-emerald-400 tracking-tight">
                  {satisfaction}%
                </span>
                <span className="block text-[11px] uppercase tracking-widest text-neutral-400 mt-1 font-mono">
                  Satisfaction Index
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. REVIEWS / TESTIMONIALS SLIDER SECTION */}
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
              
              {/* Review Testimonial Card */}
              <div className="p-8 sm:p-12 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl relative min-h-[220px] flex flex-col justify-between">
                
                {/* Solitary quotation mark */}
                <span className="absolute top-4 left-6 text-7xl font-serif text-amber-500/10 select-none pointer-events-none">&ldquo;</span>

                {/* Rating Stars */}
                <div className="flex items-center justify-center gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star 
                      key={idx} 
                      size={18} 
                      className={idx < reviews[activeReviewIdx].rating ? "fill-amber-500 text-amber-500" : "text-neutral-700"} 
                    />
                  ))}
                </div>

                {/* Testimonial Quote text */}
                <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-light italic font-serif select-text">
                  &ldquo;{reviews[activeReviewIdx].text}&rdquo;
                </p>

                {/* Sender Profiles */}
                <div className="flex items-center justify-center gap-3.5 mt-8 border-t border-neutral-800/80 pt-6">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500/20">
                    <img 
                      src={reviews[activeReviewIdx].avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"} 
                      alt={reviews[activeReviewIdx].name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <span className="block font-serif font-bold text-sm text-neutral-200">
                      {reviews[activeReviewIdx].name}
                    </span>
                    <span className="block text-[10px] uppercase font-mono text-neutral-500 tracking-wider">
                      Verified Salon Guest ({reviews[activeReviewIdx].createdAt})
                    </span>
                  </div>
                </div>

              </div>

              {/* Slider Toggles */}
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

      {/* 3. INSTAGRAM FEED SECTION */}
      <section id="instagram" className="py-20 sm:py-24 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <div className="text-center md:text-left">
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 uppercase tracking-widest font-semibold font-mono">
                <Instagram size={12} />
                <span>Live Feed Mockup</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-neutral-100 tracking-tight mt-1.5">
                Join Our Visual Instagram Journey
              </h2>
            </div>

            <a 
              href={socialLinks.instagram} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-semibold tracking-wider uppercase text-pink-500 flex items-center justify-center gap-2 hover:scale-[1.03] transition-all"
            >
              <Instagram size={15} />
              <span>Follow @anikamakeover45</span>
            </a>
          </div>

          {/* Instagram mock list */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {instagramMockPosts.map((post) => (
              <a 
                key={post.id} 
                href={socialLinks.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group relative block aspect-square rounded-2xl overflow-hidden tracking-wider text-xs border border-neutral-900 hover:border-neutral-800"
              >
                <img 
                  src={post.image} 
                  alt="Anika Makeover Instagram Post" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Interactive Instagram Hover overlay */}
                <div className="absolute inset-0 bg-neutral-950/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1.5 text-neutral-200">
                    <Heart size={14} className="fill-neutral-200 text-neutral-200" />
                    <span className="font-semibold">{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-200">
                    <MessageSquare size={14} className="fill-neutral-200 text-neutral-200" />
                    <span className="font-semibold">{post.comments}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
};
