/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { WebBuilderSection } from '../types';

interface FAQSectionProps {
  section: WebBuilderSection;
  widthClass?: string;
  roundClass?: string;
  shadowClass?: string;
  animationClass?: string;
  hoverClass?: string;
  spacingClass?: string;
  alignmentClass?: string;
  stylesContainer?: React.CSSProperties;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  section,
  widthClass = 'max-w-5xl mx-auto',
  roundClass = 'rounded-2xl',
  shadowClass = 'shadow-xl',
  animationClass = 'animate-fadeIn',
  hoverClass = '',
  spacingClass = 'py-16 px-6',
  alignmentClass = 'items-center text-center',
  stylesContainer = {},
}) => {
  // Store expanded item index. A null value means none expanded. Or a set for multi-expand. Let's do single-expand accordion.
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqItems = section.content?.faqItems || [];

  const toggleIndex = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      id={section.id}
      style={stylesContainer}
      className={`relative ${spacingClass} ${roundClass} ${animationClass} ${hoverClass} ${shadowClass}`}
    >
      <div className={widthClass}>
        {/* Title & Header Section */}
        <div className={`flex flex-col mb-12 ${alignmentClass}`}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-xs uppercase tracking-widest mb-4">
            <MessageSquare size={12} />
            <span>{section.content?.subtitle || "Got questions?"}</span>
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-neutral-100 mt-1">
            {section.content?.title || "Frequently Asked Questions"}
          </h2>
          {section.content?.description && (
            <p className="text-sm text-neutral-400 mt-4 font-light max-w-2xl">
              {section.content.description}
            </p>
          )}
        </div>

        {faqItems.length === 0 ? (
          <div className="text-center text-neutral-500 py-10 italic">
            No mock questions or client answers have been configured. Edit in Admin Dashboard!
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-neutral-900/60 border border-neutral-850 hover:border-amber-500/20 rounded-xl overflow-hidden duration-300 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleIndex(idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 font-serif font-bold text-sm sm:text-base text-neutral-100 hover:text-amber-500 transition-colors cursor-pointer"
                  >
                    <span>{item.question}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="text-amber-500 shrink-0"
                    >
                      <ChevronDown size={18} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-6 pb-6 text-xs sm:text-sm text-neutral-400 leading-relaxed font-sans font-light select-text border-t border-neutral-850/40 pt-4">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
