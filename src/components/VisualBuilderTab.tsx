/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, Check, Lock, ArrowUp, ArrowDown, Trash2, Copy, 
  Eye, EyeOff, Plus, Edit2, Settings, Image, Video, HelpCircle, 
  DollarSign, Link, Smartphone, Tablet, Monitor, Info, Grid, 
  FileText, Menu, Move, Play, RefreshCw, X
} from 'lucide-react';
import { WelcomeBanner, VisualBuilderSettings, WebBuilderSection, WebBuilderButton } from '../types';
import { DirectFileUploader } from './DirectFileUploader';

interface VisualBuilderTabProps {
  editableWelcomeBanner: WelcomeBanner;
  setEditableWelcomeBanner: React.Dispatch<React.SetStateAction<WelcomeBanner>>;
  editableVisualBuilder: VisualBuilderSettings;
  setEditableVisualBuilder: React.Dispatch<React.SetStateAction<VisualBuilderSettings>>;
  handleSaveBuilder: (e: React.FormEvent) => void;
  handleChangePassword: (e: React.FormEvent) => void;
  currentPasswordInput: string;
  setCurrentPasswordInput: (v: string) => void;
  newPasswordInput: string;
  setNewPasswordInput: (v: string) => void;
  confirmPasswordInput: string;
  setConfirmPasswordInput: (v: string) => void;
}

type TabMode = 'sections' | 'global' | 'media' | 'security';
type DeviceMode = 'desktop' | 'tablet' | 'mobile';

const GOOGLE_FONTS_HEADING = [
  'Space Grotesk', 'Playfair Display', 'Cormorant Garamond', 'Outfit', 'Inter', 'Cinzel', 'Montserrat'
];

const GOOGLE_FONTS_BODY = [
  'Inter', 'Outfit', 'JetBrains Mono', 'Cormorant Garamond', 'Lora', 'Montserrat', 'Lato'
];

export const VisualBuilderTab: React.FC<VisualBuilderTabProps> = ({
  editableWelcomeBanner,
  setEditableWelcomeBanner,
  editableVisualBuilder,
  setEditableVisualBuilder,
  handleSaveBuilder,
  handleChangePassword,
  currentPasswordInput,
  setCurrentPasswordInput,
  newPasswordInput,
  setNewPasswordInput,
  confirmPasswordInput,
  setConfirmPasswordInput
}) => {
  // Sub tab tracking
  const [activeTab, setActiveTab] = useState<TabMode>('sections');
  
  // Real-time responsive frame simulation mode
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  
  // Edit focus state (which section is currently expanded for styles & content settings)
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>('sec-hero');

  // Media Library mock/local uploads placeholder before saving to Firestore
  const [mediaAlert, setMediaAlert] = useState<string | null>(null);

  // New navigation menu element input
  const [newNavItem, setNewNavItem] = useState({ label: '', link: '#home' });

  // 1. DYNAMIC COMPONENT ACTIONS
  const addNewSection = (type: string) => {
    const id = `sec-custom-${Date.now()}`;
    const name = `Custom ${type.charAt(0).toUpperCase() + type.slice(1)} Section`;
    
    const newSec: WebBuilderSection = {
      id,
      type: type as any,
      name,
      visible: true,
      styles: {
        backgroundColor: type === 'hero' ? '#0a0a0a' : '#121212',
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
        hoverEffect: 'lift',
        layoutPosition: 'center'
      },
      content: {
        title: `Dynamic ${type.charAt(0).toUpperCase() + type.slice(1)} Header`,
        subtitle: 'Enter customizable subtitle and narration lines directly in the content editor panel.',
        description: 'This is a premium responsive section template ready for content curation and royal branding customization.',
        buttons: [
          { id: `btn-${Date.now()}`, text: 'Schedule Consultation', color: '#f59e0b', size: 'md', icon: 'sparkles', link: '#booking' }
        ],
        faqItems: type === 'faq' ? [
          { question: 'What is your consultation protocol?', answer: 'We sit down with you and explore hair/skin types and bridal palettes to verify style alignment.' }
        ] : undefined,
        pricingItems: type === 'pricing' ? [
          { title: 'Gold Transformation Master', price: '₹4,999', description: 'Advanced face makeup with deep skin shine hydration filters.', features: ['HD cosmetic base', 'Lashes and hair braids styling', '6 hours staying power assurance'] }
        ] : undefined
      }
    };

    setEditableVisualBuilder(prev => ({
      ...prev,
      sections: [...(prev.sections || []), newSec]
    }));
    
    setExpandedSectionId(id);
  };

  const deleteSection = (id: string) => {
    if (confirm('Delete this website section? Any customized copy and text will be deleted.')) {
      setEditableVisualBuilder(prev => ({
        ...prev,
        sections: (prev.sections || []).filter(s => s.id !== id)
      }));
      if (expandedSectionId === id) setExpandedSectionId(null);
    }
  };

  const duplicateSection = (sec: WebBuilderSection) => {
    const duplicated: WebBuilderSection = JSON.parse(JSON.stringify(sec));
    duplicated.id = `sec-dup-${Date.now()}`;
    duplicated.name = `${sec.name} (Copy)`;
    
    setEditableVisualBuilder(prev => {
      const idx = (prev.sections || []).findIndex(s => s.id === sec.id);
      if (idx === -1) {
        return { ...prev, sections: [...(prev.sections || []), duplicated] };
      }
      const updated = [...(prev.sections || [])];
      updated.splice(idx + 1, 0, duplicated);
      return { ...prev, sections: updated };
    });
    setExpandedSectionId(duplicated.id);
  };

  const moveSection = (id: string, dir: 'up' | 'down') => {
    setEditableVisualBuilder(prev => {
      const list = [...(prev.sections || [])];
      const idx = list.findIndex(s => s.id === id);
      if (idx === -1) return prev;
      
      const swapWith = dir === 'up' ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= list.length) return prev;
      
      // Swap positions
      const temp = list[idx];
      list[idx] = list[swapWith];
      list[swapWith] = temp;
      
      return { ...prev, sections: list };
    });
  };

  const toggleSectionVisibility = (id: string) => {
    setEditableVisualBuilder(prev => ({
      ...prev,
      sections: (prev.sections || []).map(s => s.id === id ? { ...s, visible: !s.visible } : s)
    }));
  };

  // 2. HELPER TO UPDATE EXPANDED SECTION PROPERTIES
  const updateSectionStyle = (id: string, styleKey: keyof NonNullable<WebBuilderSection['styles']>, value: any) => {
    setEditableVisualBuilder(prev => ({
      ...prev,
      sections: (prev.sections || []).map(s => s.id === id ? {
        ...s,
        styles: { ...s.styles, [styleKey]: value }
      } : s)
    }));
  };

  const updateSectionContentField = (id: string, contentFieldKey: keyof NonNullable<WebBuilderSection['content']>, value: any) => {
    setEditableVisualBuilder(prev => ({
      ...prev,
      sections: (prev.sections || []).map(s => s.id === id ? {
        ...s,
        content: { ...s.content, [contentFieldKey]: value }
      } : s)
    }));
  };

  // 3. SECURE NAVIGATION LINK CREATORS
  const addNavItem = () => {
    if (!newNavItem.label) return;
    const item = { id: `nav-${Date.now()}`, ...newNavItem };
    setEditableVisualBuilder(prev => ({
      ...prev,
      globalSettings: {
        ...prev.globalSettings,
        navMenu: [...(prev.globalSettings?.navMenu || []), item]
      }
    }));
    setNewNavItem({ label: '', link: '#home' });
  };

  const removeNavItem = (id: string) => {
    setEditableVisualBuilder(prev => ({
      ...prev,
      globalSettings: {
        ...prev.globalSettings,
        navMenu: (prev.globalSettings?.navMenu || []).filter(i => i.id !== id)
      }
    }));
  };

  const moveNavItem = (id: string, dir: 'up' | 'down') => {
    setEditableVisualBuilder(prev => {
      const menu = [...(prev.globalSettings?.navMenu || [])];
      const idx = menu.findIndex(i => i.id === id);
      if (idx === -1) return prev;
      
      const swapWith = dir === 'up' ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= menu.length) return prev;
      
      const temp = menu[idx];
      menu[idx] = menu[swapWith];
      menu[swapWith] = temp;
      
      return {
        ...prev,
        globalSettings: { ...prev.globalSettings, navMenu: menu }
      };
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* HEADER MASTER TITLE ROW */}
      <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 rounded bg-amber-500 text-neutral-950 font-mono text-[10px] font-bold tracking-widest">SYSTEM BUILDER ENGINE</span>
            <div className="flex items-center gap-1.5">
              <Sparkles className="text-amber-400 animate-pulse" size={18} />
              <h3 className="font-serif font-bold text-xl text-neutral-100">Live Visual Website Builder</h3>
            </div>
          </div>
          <p className="text-xs text-neutral-400 max-w-2xl font-light">
            You are in complete control of the website. Edit content, styles, spacing, background crop levels, file templates, reorder blocks, and add custom items directly. Press <b>Publish Changes</b> below to save instantly.
          </p>
        </div>
        <button
          onClick={handleSaveBuilder}
          className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg transition-transform hover:scale-102 flex items-center justify-center gap-2 cursor-pointer w-full md:w-auto self-stretch shrink-0"
        >
          <Check size={15} />
          <span>Publish All Changes</span>
        </button>
      </div>

      {/* HORIZONTAL BUILDER TABS NAVIGATION */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-900 pb-3">
        {[
          { id: 'sections', label: '1. Drag, Reorder & Edit Sections', icon: <Grid size={13} /> },
          { id: 'global', label: '2. Global Settings, Brand Logo & Menus', icon: <Settings size={13} /> },
          { id: 'media', label: '3. Media Library - File Manager', icon: <Image size={13} /> },
          { id: 'security', label: '4. Staff Password Keys Manager', icon: <Lock size={13} /> }
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setActiveTab(btn.id as TabMode)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === btn.id 
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/10' 
                : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-900'
            }`}
          >
            {btn.icon}
            <span>{btn.label}</span>
          </button>
        ))}
      </div>

      {/* SUBTAB 1. SECTIONS PAGE BUILDER */}
      {activeTab === 'sections' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* SECTIONS MANAGEMENT LIST & SETTINGS */}
          <div className="xl:col-span-12 space-y-5">
            
            {/* ADD A NEW SECTION BAR */}
            <div className="bg-neutral-950 border border-neutral-850 p-4.5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs uppercase font-bold tracking-wide text-neutral-300">Add Live Web Sections</h4>
                <p className="text-[10px] text-neutral-500 font-light">Insert clean designed sections into your live web sequence instantly.</p>
              </div>
              <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                {[
                  { key: 'hero', label: 'Hero Cover' },
                  { key: 'offers', label: 'Promos / Offers' },
                  { key: 'services', label: 'Service Catalogue' },
                  { key: 'gallery', label: 'Lookbook' },
                  { key: 'reviews', label: 'Testimonials' },
                  { key: 'video', label: 'Video Clip' },
                  { key: 'faq', label: 'FAQs List' },
                  { key: 'pricing', label: 'Pricing grids' },
                  { key: 'custom', label: 'Rich Text / Custom' }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => addNewSection(item.key)}
                    className="p-1 px-3 bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 hover:text-amber-400 text-[10.5px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Plus size={10} className="text-amber-500" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* RESPONSIVE LAYOUT TOGGLER (VISUAL REASSURANCE & SETTING PRESETS) */}
            <div className="p-4 bg-neutral-950/60 border border-neutral-900 rounded-2xl flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Smartphone className="text-neutral-500" size={16} />
                <span className="text-xs text-neutral-300 font-semibold">Responsive Editing Workspace Views:</span>
              </div>
              <div className="flex items-center justify-center gap-1 bg-neutral-900/80 p-1 border border-neutral-800 rounded-xl">
                {[
                  { mode: 'desktop', icon: <Monitor size={12} />, label: '🖥️ Widescreen Desktop Desktop Design focus' },
                  { mode: 'tablet', icon: <Tablet size={12} />, label: '📐 Tablet View Design focus' },
                  { mode: 'mobile', icon: <Smartphone size={12} />, label: '📱 Mobile-First Phone Screen Design focus' }
                ].map((item) => (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => setDeviceMode(item.mode as DeviceMode)}
                    className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      deviceMode === item.mode 
                        ? 'bg-amber-500 text-neutral-950 font-bold' 
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {item.icon}
                    <span>{item.mode.charAt(0).toUpperCase() + item.mode.slice(1)}</span>
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-neutral-500">
                Editing layout coordinates under <span className="font-mono text-amber-500 font-bold uppercase">{deviceMode}</span> viewport.
              </div>
            </div>

            {/* SEQUENCING LIST OF ALL SECTIONS */}
            <div className="space-y-4">
              {(editableVisualBuilder.sections || []).map((sec, idx) => {
                const isExpanded = expandedSectionId === sec.id;
                return (
                  <div 
                    key={sec.id} 
                    className={`bg-neutral-950 border rounded-2xl transition-all shadow-md overflow-hidden ${
                      isExpanded 
                        ? 'border-amber-500/30 ring-1 ring-amber-500/10' 
                        : 'border-neutral-900 hover:border-neutral-800'
                    } ${!sec.visible ? 'opacity-65' : ''}`}
                  >
                    {/* SECTION BRIEF CARD ROW */}
                    <div className="p-4 px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-950/80 select-text">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="flex flex-col gap-0.5 justify-center">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveSection(sec.id, 'up')}
                            className="text-neutral-500 hover:text-neutral-300 disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowUp size={11} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (editableVisualBuilder.sections || []).length - 1}
                            onClick={() => moveSection(sec.id, 'down')}
                            className="text-neutral-500 hover:text-neutral-300 disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowDown size={11} />
                          </button>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="p-0.5 px-2 bg-neutral-900 border border-neutral-800 text-[9px] font-mono rounded text-amber-500 uppercase tracking-widest">{sec.type}</span>
                            <span className="font-serif font-bold text-sm text-neutral-100">{sec.name}</span>
                          </div>
                          <p className="text-[10px] text-neutral-500 font-light mt-0.5">Section ID: <span className="font-mono text-neutral-450">{sec.id}</span> • Styles layout type: <span className="text-neutral-300 capitalize">{sec.styles?.sectionWidth}</span> width • Spacing: <span className="text-neutral-300">{sec.styles?.padding}</span></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {/* Visibility toggler icon */}
                        <button
                          type="button"
                          onClick={() => toggleSectionVisibility(sec.id)}
                          className={`p-2 rounded-lg text-xs transition-colors cursor-pointer border ${
                            sec.visible !== false 
                              ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-neutral-100' 
                              : 'bg-emerald-950/20 border-emerald-900 text-emerald-400'
                          }`}
                          title={sec.visible !== false ? "Hide on website" : "Show on website"}
                        >
                          {sec.visible !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                        </button>

                        <button
                          type="button"
                          onClick={() => duplicateSection(sec)}
                          className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs cursor-pointer"
                          title="Duplicate Content Section"
                        >
                          <Copy size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteSection(sec.id)}
                          className="p-2 rounded-lg bg-neutral-900 border border-red-950 hover:bg-red-950/20 text-red-400 hover:text-red-300 text-xs cursor-pointer"
                          title="Permanently Delete Section"
                        >
                          <Trash2 size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedSectionId(isExpanded ? null : sec.id)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors border ${
                            isExpanded 
                              ? 'bg-amber-500 border-amber-500 text-neutral-950' 
                              : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-neutral-100'
                          }`}
                        >
                          <Edit2 size={11} className="inline mr-1" />
                          <span>{isExpanded ? 'Collapse' : 'Content & Style Settings'}</span>
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED PANEL DESIGN FOR SECTOR CUSTOMIZATION */}
                    {isExpanded && (
                      <div className="border-t border-neutral-900 bg-neutral-950/40 p-5 space-y-6">
                        
                        {/* RENAME SECTION BAR */}
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between border-b border-neutral-900 pb-4">
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500/80">Customize Template Label</span>
                            <div className="flex items-center gap-1.5">
                              <input 
                                type="text"
                                value={sec.name}
                                onChange={(e) => {
                                  setEditableVisualBuilder(prev => ({
                                    ...prev,
                                    sections: (prev.sections || []).map(s => s.id === sec.id ? { ...s, name: e.target.value } : s)
                                  }));
                                }}
                                className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-sm text-neutral-200 font-serif font-bold focus:outline-none focus:border-amber-500 w-64"
                              />
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-neutral-500">Workspace coordinates: <span className="text-neutral-400">{sec.id}</span></span>
                        </div>

                        {/* DOUBLE SPLIT GRID: LEFT PRESETS & RIGHT CONTENT DATA */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          
                          {/* STYLING DETAILS */}
                          <div className="lg:col-span-5 bg-neutral-950 border border-neutral-900 p-4.5 rounded-xl space-y-4">
                            <div className="border-b border-neutral-900 pb-2">
                              <h5 className="text-[11px] uppercase font-bold text-neutral-300 tracking-wider flex items-center gap-1.5">
                                <Menu size={11} className="text-amber-500" />
                                <span>A. Section Design Layout & Canvas Properties</span>
                              </h5>
                              <p className="text-[9.5px] text-neutral-500 mt-0.5">Edit layouts specifically for {deviceMode} screen overlays.</p>
                            </div>

                            <div className="space-y-3.5">
                              {/* Background color */}
                              <div className="space-y-1">
                                <label className="text-[10px] text-neutral-300">Background Canvas Overlay Color</label>
                                <div className="flex gap-2">
                                  <input 
                                    type="color"
                                    value={sec.styles?.backgroundColor || '#121212'}
                                    onChange={(e) => updateSectionStyle(sec.id, 'backgroundColor', e.target.value)}
                                    className="w-8 h-8 rounded border-0 bg-transparent shrink-0 cursor-pointer"
                                  />
                                  <input 
                                    type="text"
                                    value={sec.styles?.backgroundColor || '#121212'}
                                    onChange={(e) => updateSectionStyle(sec.id, 'backgroundColor', e.target.value)}
                                    className="w-full text-xs bg-neutral-905 border border-neutral-800 px-3 py-1.5 rounded-xl text-neutral-200 font-mono"
                                  />
                                </div>
                              </div>

                              {/* Text color */}
                              <div className="space-y-1">
                                <label className="text-[10px] text-neutral-300 font-medium">Text default color</label>
                                <div className="flex gap-2">
                                  <input 
                                    type="color"
                                    value={sec.styles?.textColor || '#ffffff'}
                                    onChange={(e) => updateSectionStyle(sec.id, 'textColor', e.target.value)}
                                    className="w-8 h-8 rounded border-0 bg-transparent shrink-0 cursor-pointer"
                                  />
                                  <input 
                                    type="text"
                                    value={sec.styles?.textColor || '#ffffff'}
                                    onChange={(e) => updateSectionStyle(sec.id, 'textColor', e.target.value)}
                                    className="w-full text-xs bg-neutral-905 border border-neutral-800 px-3 py-1.5 rounded-xl text-neutral-200 font-mono"
                                  />
                                </div>
                              </div>

                              {/* Font Family & Layout Positioning */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] text-neutral-400 block">Typography Typeface</label>
                                  <select 
                                    value={sec.styles?.fontFamily || 'Inter'}
                                    onChange={(e) => updateSectionStyle(sec.id, 'fontFamily', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-350 focus:outline-none"
                                  >
                                    <option value="Space Grotesk">Space Grotesk (Tech/Clean)</option>
                                    <option value="Playfair Display">Playfair Display (Editorial Serif)</option>
                                    <option value="Cormorant Garamond">Cormorant Garamond (Luxe Italian)</option>
                                    <option value="Inter">Inter (Swiss Modern Sans)</option>
                                    <option value="Outfit">Outfit (Feminine curves)</option>
                                    <option value="JetBrains Mono">JetBrains Mono (Technical detail)</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] text-neutral-400 block">Alignment profile</label>
                                  <select 
                                    value={sec.styles?.layoutPosition || 'center'}
                                    onChange={(e) => updateSectionStyle(sec.id, 'layoutPosition', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-350 focus:outline-none"
                                  >
                                    <option value="left">Left Aligned layout</option>
                                    <option value="center">Centered centered layout</option>
                                    <option value="right">Right aligned layout</option>
                                  </select>
                                </div>
                              </div>

                              {/* Width, Height selections */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] text-neutral-400 block">Block Content Width</label>
                                  <select 
                                    value={sec.styles?.sectionWidth || 'wide'}
                                    onChange={(e) => updateSectionStyle(sec.id, 'sectionWidth', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-350 focus:outline-none"
                                  >
                                    <option value="narrow">Narrow (Optimal readability)</option>
                                    <option value="normal">Normal width panel</option>
                                    <option value="wide">Wide grid template</option>
                                    <option value="full">Full Screen spanning bleed</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] text-neutral-400 block">Minimum Height scale</label>
                                  <select 
                                    value={sec.styles?.sectionHeight || 'medium'}
                                    onChange={(e) => updateSectionStyle(sec.id, 'sectionHeight', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-350 focus:outline-none"
                                  >
                                    <option value="short">Short (Ribbon highlight)</option>
                                    <option value="medium">Medium spanning grid</option>
                                    <option value="tall">Tall immersive focus</option>
                                    <option value="full-screen">Full Viewport scale</option>
                                  </select>
                                </div>
                              </div>

                              {/* Padding & margins */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] text-neutral-400 block">Padding sizing</label>
                                  <input 
                                    type="text"
                                    value={sec.styles?.padding || 'py-16 px-6'}
                                    onChange={(e) => updateSectionStyle(sec.id, 'padding', e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 rounded focus:outline-none font-mono"
                                    placeholder="e.g., py-16 px-6"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] text-neutral-400 block">External margin spacing</label>
                                  <input 
                                    type="text"
                                    value={sec.styles?.margin || 'my-0'}
                                    onChange={(e) => updateSectionStyle(sec.id, 'margin', e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 rounded focus:outline-none font-mono"
                                    placeholder="e.g., my-4"
                                  />
                                </div>
                              </div>

                              {/* Borders curvature & drop shadows */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] text-neutral-400 block">Radius curve corners</label>
                                  <select 
                                    value={sec.styles?.borderRadius || '2xl'}
                                    onChange={(e) => updateSectionStyle(sec.id, 'borderRadius', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-350 focus:outline-none"
                                  >
                                    <option value="none">none (Sharp corners)</option>
                                    <option value="sm">sm curvature</option>
                                    <option value="md">md curvature</option>
                                    <option value="lg">lg curved corners</option>
                                    <option value="xl">xl rounded corners</option>
                                    <option value="2xl">2xl luxury curvature</option>
                                    <option value="3xl">3xl extreme curvature</option>
                                    <option value="full">full circle profile</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] text-neutral-400 block">Drop shadow depth</label>
                                  <select 
                                    value={sec.styles?.shadow || 'xl'}
                                    onChange={(e) => updateSectionStyle(sec.id, 'shadow', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-350 focus:outline-none"
                                  >
                                    <option value="none">none (Flat overlay)</option>
                                    <option value="sm">sm shadow</option>
                                    <option value="md">md standard shadow</option>
                                    <option value="lg">lg deep shadow</option>
                                    <option value="xl">xl elite shadow depth</option>
                                    <option value="2xl">2xl intense shadow overlay</option>
                                  </select>
                                </div>
                              </div>

                              {/* Animation & Hover Effects */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] text-neutral-400 block">Entrance Animation</label>
                                  <select 
                                    value={sec.styles?.animation || 'fade-in'}
                                    onChange={(e) => updateSectionStyle(sec.id, 'animation', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-350 focus:outline-none"
                                  >
                                    <option value="none">No entrance animation</option>
                                    <option value="fade-in">Fade-in (soft entrance)</option>
                                    <option value="slide-up">Slide-up (dynamic scroll)</option>
                                    <option value="scale-up">Scale-up visual focus</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] text-neutral-400 block">Cursor Hover Effect</label>
                                  <select 
                                    value={sec.styles?.hoverEffect || 'none'}
                                    onChange={(e) => updateSectionStyle(sec.id, 'hoverEffect', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-350 focus:outline-none"
                                  >
                                    <option value="none">Flat static hover</option>
                                    <option value="lift">Lift up on hover</option>
                                    <option value="scale">Subtle card zoom effect</option>
                                  </select>
                                </div>
                              </div>

                              {/* Mobile specific responsive paddings override panel */}
                              <div className="p-3 bg-neutral-900/60 border border-neutral-850 rounded-xl space-y-2">
                                <span className="text-[9.5px] uppercase font-bold text-amber-500 block">Responsive Style Presets</span>
                                <div className="grid grid-cols-3 gap-1.5">
                                  {['mobile', 'tablet', 'desktop'].map((p) => {
                                    const pathPadding = sec.responsiveSettings?.[p]?.padding || '';
                                    return (
                                      <div key={p} className="space-y-0.5">
                                        <b className="text-[8.5px] capitalize text-neutral-400 block">{p} override</b>
                                        <input 
                                          type="text"
                                          value={pathPadding}
                                          onChange={(e) => {
                                            const set = { ...(sec.responsiveSettings || {}) };
                                            set[p] = { ...(set[p] || {}), padding: e.target.value };
                                            setEditableVisualBuilder(prev => ({
                                              ...prev,
                                              sections: (prev.sections || []).map(s => s.id === sec.id ? { ...s, responsiveSettings: set } : s)
                                            }));
                                          }}
                                          placeholder="py-8 px-4"
                                          className="w-full text-[9px] bg-neutral-950 border border-neutral-800 rounded px-1.5 py-1 text-neutral-300 font-mono focus:outline-none"
                                        />
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>

                            </div>
                          </div>

                          {/* CONTENT EDITING DATA */}
                          <div className="lg:col-span-7 space-y-4">
                            <div className="bg-neutral-950 border border-neutral-900 p-4.5 rounded-xl space-y-4">
                              <div className="border-b border-neutral-900 pb-2 flex items-center justify-between">
                                <h5 className="text-[11px] uppercase font-bold text-neutral-300 tracking-wider flex items-center gap-1.5">
                                  <Edit2 size={11} className="text-amber-500" />
                                  <span>B. Core Section Copywriting, Texts, Media & Sub-lists</span>
                                </h5>
                                <span className="p-0.5 px-2 bg-neutral-900 border border-neutral-800 text-[8px] font-mono text-neutral-500 rounded uppercase">CONTENT</span>
                              </div>

                              <div className="space-y-4">
                                
                                {/* Section Title */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">Primary Title Heading Line</label>
                                  <input 
                                    type="text" 
                                    value={sec.content?.title || ''}
                                    onChange={(e) => updateSectionContentField(sec.id, 'title', e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 text-neutral-250 text-xs rounded-xl focus:outline-none focus:border-amber-500"
                                    placeholder="Section main heading style title"
                                  />
                                </div>

                                {/* Section Subtitle */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">Secondary Subtitle / Highlight ribbon Line</label>
                                  <input 
                                    type="text" 
                                    value={sec.content?.subtitle || ''}
                                    onChange={(e) => updateSectionContentField(sec.id, 'subtitle', e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 text-neutral-250 text-xs rounded-xl focus:outline-none focus:border-amber-500"
                                    placeholder="Section secondary narrative tagline"
                                  />
                                </div>

                                {/* Section Description or Narrative block */}
                                <div className="space-y-1">
                                  <label className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">General Body Description or Copywriter text</label>
                                  <textarea 
                                    rows={3}
                                    value={sec.content?.description || ''}
                                    onChange={(e) => updateSectionContentField(sec.id, 'description', e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 text-neutral-250 text-xs rounded-xl focus:outline-none focus:border-amber-500"
                                    placeholder="Provide detailed description paragraphs to enrich content presentation on your web layout."
                                  />
                                </div>

                                {/* Custom Rich Text / Body Markdown if type is custom */}
                                {sec.type === 'custom' && (
                                  <div className="space-y-1.5 p-3.5 bg-neutral-900/60 border border-neutral-850 rounded-xl">
                                    <label className="text-[10px] text-amber-500 uppercase font-bold block">Section Markdown Rich Content Body</label>
                                    <span className="text-[8.5px] text-neutral-500 block">Rich formatting. You can enter headers (# text), lists, bold, or classic paragraphs safely here.</span>
                                    <textarea 
                                      rows={5}
                                      value={sec.content?.bodyMarkdown || ''}
                                      onChange={(e) => updateSectionContentField(sec.id, 'bodyMarkdown', e.target.value)}
                                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 font-sans text-neutral-200 text-xs rounded-lg focus:outline-none focus:border-amber-500"
                                      placeholder="## Welcome to our beauty suite... We utilize premier elements..."
                                    />
                                  </div>
                                )}

                                {/* Media Uploader panel for sections with background images/videos */}
                                <div className="p-3.5 bg-neutral-900/70 border border-neutral-850 rounded-xl space-y-3">
                                  <span className="text-[10px] text-neutral-300 uppercase font-bold block">🖼️ Media Background Asset & Backdrops (Direct Upload)</span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="space-y-1.5">
                                      <DirectFileUploader 
                                        label="Photo Upload File"
                                        accept="image/*"
                                        folder="builders"
                                        currentValue={sec.content?.imageUrl || ''}
                                        onUploadComplete={(url) => updateSectionContentField(sec.id, 'imageUrl', url)}
                                      />
                                      <div className="space-y-1">
                                        <input 
                                          type="text"
                                          value={sec.content?.imageUrl || ''}
                                          onChange={(e) => updateSectionContentField(sec.id, 'imageUrl', e.target.value)}
                                          className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-[10px] font-mono text-neutral-350 focus:outline-none focus:border-amber-500"
                                          placeholder="Or paste background photo URL..."
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                      <DirectFileUploader 
                                        label="Video Upload File"
                                        accept="video/*"
                                        folder="builders"
                                        currentValue={sec.content?.videoUrl || ''}
                                        onUploadComplete={(url) => updateSectionContentField(sec.id, 'videoUrl', url)}
                                      />
                                      <div className="space-y-1">
                                        <input 
                                          type="text"
                                          value={sec.content?.videoUrl || ''}
                                          onChange={(e) => updateSectionContentField(sec.id, 'videoUrl', e.target.value)}
                                          className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-[10px] font-mono text-neutral-350 focus:outline-none focus:border-amber-500"
                                          placeholder="Or paste background video URL..."
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* CROP / ACCENT STYLE PRESETS */}
                                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-850">
                                    <div className="space-y-0.5">
                                      <span className="text-[8.5px] text-neutral-500">Overlay Color</span>
                                      <input 
                                        type="color"
                                        value={sec.content?.overlayColor || '#000000'}
                                        onChange={(e) => updateSectionContentField(sec.id, 'overlayColor', e.target.value)}
                                        className="w-full h-6 rounded border-0 bg-transparent shrink-0 cursor-pointer"
                                      />
                                    </div>
                                    <div className="space-y-0.5">
                                      <span className="text-[8.5px] text-neutral-500">Backdrop Opacity</span>
                                      <input 
                                        type="number"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={sec.content?.overlayOpacity ?? 0.5}
                                        onChange={(e) => updateSectionContentField(sec.id, 'overlayOpacity', Number(e.target.value))}
                                        className="w-full bg-neutral-955 border border-neutral-800 text-xs px-2 py-0.5 text-neutral-350 rounded font-mono"
                                      />
                                    </div>
                                    <div className="space-y-0.5">
                                      <span className="text-[8.5px] text-neutral-500">Crop Focus align</span>
                                      <select
                                        value={sec.content?.imagePosition || 'center'}
                                        onChange={(e) => updateSectionContentField(sec.id, 'imagePosition', e.target.value)}
                                        className="w-full bg-neutral-955 border border-neutral-800 text-[10.5px] px-1 py-1 text-neutral-350 rounded focus:outline-none"
                                      >
                                        <option value="center">Center</option>
                                        <option value="top">Top anchor</option>
                                        <option value="bottom">Bottom anchor</option>
                                        <option value="left">Left aspect</option>
                                        <option value="right">Right aspect</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>

                                {/* Dynamic FAQ manager if type is faq */}
                                {sec.type === 'faq' && (
                                  <div className="p-3.5 bg-neutral-900/60 border border-neutral-850 rounded-xl space-y-3">
                                    <span className="text-[10px] text-amber-500 uppercase font-bold block">💬 FAQ List Manager Accordion</span>
                                    <div className="space-y-2">
                                      {(sec.content?.faqItems || []).map((faq, fIdx) => (
                                        <div key={fIdx} className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-850 space-y-1.5">
                                          <div className="flex items-center justify-between">
                                            <b className="text-[9px] text-neutral-450 uppercase">Question #{fIdx + 1}</b>
                                            <button 
                                              type="button"
                                              onClick={() => {
                                                const list = [...(sec.content?.faqItems || [])];
                                                list.splice(fIdx, 1);
                                                updateSectionContentField(sec.id, 'faqItems', list);
                                              }}
                                              className="text-red-400 hover:text-red-300 text-[10px] uppercase font-mono px-2 py-0.5 hover:bg-red-950/20 rounded cursor-pointer"
                                            >
                                              Delete Question
                                            </button>
                                          </div>
                                          <input 
                                            type="text"
                                            value={faq.question}
                                            onChange={(e) => {
                                              const list = [...(sec.content?.faqItems || [])];
                                              list[fIdx] = { ...list[fIdx], question: e.target.value };
                                              updateSectionContentField(sec.id, 'faqItems', list);
                                            }}
                                            className="w-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 rounded px-2 py-1 focus:outline-none"
                                            placeholder="Question wording..."
                                          />
                                          <textarea 
                                            value={faq.answer}
                                            onChange={(e) => {
                                              const list = [...(sec.content?.faqItems || [])];
                                              list[fIdx] = { ...list[fIdx], answer: e.target.value };
                                              updateSectionContentField(sec.id, 'faqItems', list);
                                            }}
                                            className="w-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 rounded px-2 py-1 focus:outline-none"
                                            placeholder="Collapsible answer copy..."
                                            rows={2}
                                          />
                                        </div>
                                      ))}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const list = [...(sec.content?.faqItems || []), { question: 'New Question?', answer: 'Answer content details...' }];
                                          updateSectionContentField(sec.id, 'faqItems', list);
                                        }}
                                        className="w-full py-1.5 bg-neutral-900/60 hover:bg-neutral-900 border border-dashed border-neutral-800 text-[11px] text-amber-500 rounded-lg cursor-pointer font-semibold transition-colors"
                                      >
                                        + Add New FAQ Accordion block
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Dynamic Pricing Tiers manager if type is pricing */}
                                {sec.type === 'pricing' && (
                                  <div className="p-3.5 bg-neutral-900/60 border border-neutral-850 rounded-xl space-y-3">
                                    <span className="text-[10px] text-amber-500 uppercase font-bold block">💵 Pricing Cards Package Manager</span>
                                    <div className="space-y-3.5">
                                      {(sec.content?.pricingItems || []).map((pr, pIdx) => (
                                        <div key={pIdx} className="bg-neutral-950 p-3 rounded-lg border border-neutral-850 space-y-2 select-text">
                                          <div className="flex items-center justify-between">
                                            <b className="text-[9px] text-neutral-450 uppercase">Package Tier #{pIdx + 1}</b>
                                            <button 
                                              type="button"
                                              onClick={() => {
                                                const list = [...(sec.content?.pricingItems || [])];
                                                list.splice(pIdx, 1);
                                                updateSectionContentField(sec.id, 'pricingItems', list);
                                              }}
                                              className="text-red-400 hover:text-red-300 text-[10px] uppercase font-mono px-2 py-0.5 hover:bg-red-950/20 rounded cursor-pointer"
                                            >
                                              Delete Package
                                            </button>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2">
                                            <input 
                                              type="text"
                                              value={pr.title}
                                              onChange={(e) => {
                                                const list = [...(sec.content?.pricingItems || [])];
                                                list[pIdx] = { ...list[pIdx], title: e.target.value };
                                                updateSectionContentField(sec.id, 'pricingItems', list);
                                              }}
                                              className="w-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 rounded px-2 py-1 focus:outline-none"
                                              placeholder="Package Name label..."
                                            />
                                            <input 
                                              type="text"
                                              value={pr.price}
                                              onChange={(e) => {
                                                const list = [...(sec.content?.pricingItems || [])];
                                                list[pIdx] = { ...list[pIdx], price: e.target.value };
                                                updateSectionContentField(sec.id, 'pricingItems', list);
                                              }}
                                              className="w-full bg-neutral-900 border border-neutral-800 text-xs text-amber-400 font-bold rounded px-2 py-1 focus:outline-none"
                                              placeholder="Price (e.g. ₹2,999)..."
                                            />
                                          </div>
                                          <input 
                                            type="text"
                                            value={pr.description || ''}
                                            onChange={(e) => {
                                              const list = [...(sec.content?.pricingItems || [])];
                                              list[pIdx] = { ...list[pIdx], description: e.target.value };
                                              updateSectionContentField(sec.id, 'pricingItems', list);
                                            }}
                                            className="w-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 rounded px-2 py-1 focus:outline-none font-sans"
                                            placeholder="Brief package summary desc..."
                                          />
                                          {/* Features lines */}
                                          <div className="space-y-1">
                                            <span className="text-[8.5px] uppercase font-bold text-neutral-500 block">Bullet Features (Separated by commas)</span>
                                            <input 
                                              type="text"
                                              value={(pr.features || []).join(', ')}
                                              onChange={(e) => {
                                                const list = [...(sec.content?.pricingItems || [])];
                                                list[pIdx] = { ...list[pIdx], features: e.target.value.split(',').map(f => f.trim()) };
                                                updateSectionContentField(sec.id, 'pricingItems', list);
                                              }}
                                              className="w-full bg-neutral-900 border border-neutral-800 text-[10.5px] text-neutral-300 rounded px-2 py-1 focus:outline-none"
                                              placeholder="e.g. Trial makeup, Hair stylist, Lashes included"
                                            />
                                          </div>
                                        </div>
                                      ))}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const list = [...(sec.content?.pricingItems || []), { title: 'Premium Shine Combo', price: '₹3,500', description: 'Advanced look setting', features: ['Blowdry curls styling', 'Eye lashes setup'] }];
                                          updateSectionContentField(sec.id, 'pricingItems', list);
                                        }}
                                        className="w-full py-1.5 bg-neutral-900/60 hover:bg-neutral-900 border border-dashed border-neutral-800 text-[11px] text-amber-500 rounded-lg cursor-pointer font-semibold transition-colors"
                                      >
                                        + Add New Pricing Package tier card
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Call To Action BUTTON BUILDER Section */}
                                <div className="p-3.5 bg-neutral-900/60 border border-neutral-850 rounded-xl space-y-3">
                                  <span className="text-[10px] text-neutral-300 uppercase font-bold tracking-wider flex items-center gap-1.5">
                                    <Link size={10} className="text-amber-500" />
                                    <span>🔗 Call To Actions (Section buttons Builder list)</span>
                                  </span>
                                  <div className="space-y-2.5">
                                    {(sec.content?.buttons || []).map((btn, bIdx) => (
                                      <div key={btn.id} className="bg-neutral-950 p-3 rounded-lg border border-neutral-850 space-y-2 select-text">
                                        <div className="flex items-center justify-between">
                                          <b className="text-[9px] text-amber-500/80 uppercase">Button Anchor #{bIdx + 1}</b>
                                          <button 
                                            type="button"
                                            onClick={() => {
                                              const list = [...(sec.content?.buttons || [])];
                                              list.splice(bIdx, 1);
                                              updateSectionContentField(sec.id, 'buttons', list);
                                            }}
                                            className="text-red-400 hover:text-red-300 text-[9px] uppercase font-mono px-1 pb-0.5 rounded focus:outline-none cursor-pointer"
                                          >
                                            Delete button Link
                                          </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div className="space-y-0.5">
                                            <span className="text-[8.5px] text-neutral-500">Label text</span>
                                            <input 
                                              type="text"
                                              value={btn.text}
                                              onChange={(e) => {
                                                const list = [...(sec.content?.buttons || [])];
                                                list[bIdx] = { ...list[bIdx], text: e.target.value };
                                                updateSectionContentField(sec.id, 'buttons', list);
                                              }}
                                              className="w-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 rounded px-2 py-1 focus:outline-none"
                                              placeholder="Book Consultation"
                                            />
                                          </div>
                                          <div className="space-y-0.5">
                                            <span className="text-[8.5px] text-neutral-500">Redirect anchor link</span>
                                            <input 
                                              type="text"
                                              value={btn.link}
                                              onChange={(e) => {
                                                const list = [...(sec.content?.buttons || [])];
                                                list[bIdx] = { ...list[bIdx], link: e.target.value };
                                                updateSectionContentField(sec.id, 'buttons', list);
                                              }}
                                              className="w-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 rounded px-2 py-1 font-mono focus:outline-none"
                                              placeholder="#booking, or https://..."
                                            />
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                          <div className="space-y-0.5">
                                            <span className="text-[8.5px] text-neutral-500 font-light">Accent color</span>
                                            <input 
                                              type="color"
                                              value={btn.color || '#f59e0b'}
                                              onChange={(e) => {
                                                const list = [...(sec.content?.buttons || [])];
                                                list[bIdx] = { ...list[bIdx], color: e.target.value };
                                                updateSectionContentField(sec.id, 'buttons', list);
                                              }}
                                              className="w-full h-6 rounded cursor-pointer"
                                            />
                                          </div>
                                          <div className="space-y-0.5">
                                            <span className="text-[8.5px] text-neutral-500">Button Size</span>
                                            <select
                                              value={btn.size || 'md'}
                                              onChange={(e) => {
                                                const list = [...(sec.content?.buttons || [])];
                                                list[bIdx] = { ...list[bIdx], size: e.target.value as any };
                                                updateSectionContentField(sec.id, 'buttons', list);
                                              }}
                                              className="w-full bg-neutral-900 border border-neutral-800 text-[10px] px-1 py-1 text-neutral-300 rounded focus:outline-none"
                                            >
                                              <option value="xs">xs small</option>
                                              <option value="sm">sm scale</option>
                                              <option value="md">md regular</option>
                                              <option value="lg">lg royal padding</option>
                                            </select>
                                          </div>
                                          <div className="space-y-0.5">
                                            <span className="text-[8.5px] text-neutral-500">Lucide-react Icon</span>
                                            <input 
                                              type="text"
                                              value={btn.icon || ''}
                                              onChange={(e) => {
                                                const list = [...(sec.content?.buttons || [])];
                                                list[bIdx] = { ...list[bIdx], icon: e.target.value };
                                                updateSectionContentField(sec.id, 'buttons', list);
                                              }}
                                              className="w-full bg-neutral-900 border border-neutral-800 text-[10.5px] text-neutral-350 rounded px-1.5 py-1 focus:outline-none font-mono"
                                              placeholder="sparkles, phone, calendar"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const list = [...(sec.content?.buttons || []), { id: `btn-${Date.now()}`, text: 'Call Us Here Now', color: '#f59e0b', size: 'md', link: 'tel:+917309999999' }];
                                        updateSectionContentField(sec.id, 'buttons', list);
                                      }}
                                      className="w-full py-1.5 bg-neutral-900/60 hover:bg-neutral-900 border border-dashed border-neutral-800 text-[10px] text-amber-500 uppercase font-mono rounded-lg cursor-pointer transition-colors"
                                    >
                                      + Add Customizable Action Link Button
                                    </button>
                                  </div>
                                </div>

                              </div>
                            </div>
                          </div>

                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* SUBTAB 2. GLOBAL CONTROLS, KEY BRAND & MENUS */}
      {activeTab === 'global' && (
        <div className="bg-neutral-950 border border-neutral-850 p-6 rounded-3xl space-y-6">
          <div className="border-b border-neutral-900 pb-3">
            <h4 className="font-serif font-bold text-base text-neutral-200">Global Website Settings, Menus & SEO configuration</h4>
            <p className="text-[11px] text-neutral-500 font-light">Set metadata labels, update the navigation system menu, logo files, and customized copyrights.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* BRAND DETAILS */}
            <div className="p-4 bg-neutral-900/30 border border-neutral-850 rounded-2xl space-y-4">
              <span className="text-xs font-serif font-bold text-neutral-200 select-text">Logo, Branding & Title</span>
              <div className="grid grid-cols-1 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400">Website title name branding</label>
                  <input 
                    type="text" 
                    value={editableVisualBuilder.globalSettings?.websiteName || ''}
                    onChange={(e) => setEditableVisualBuilder(prev => ({
                      ...prev,
                      globalSettings: { ...(prev.globalSettings || {}), websiteName: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 rounded-xl focus:outline-none"
                    placeholder="Anika Makeover Salon"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold text-neutral-400">Main Header Logo File (Direct Upload)</label>
                  </div>
                  <DirectFileUploader 
                    label="Direct logo upload"
                    accept="image/*"
                    folder="logos"
                    currentValue={editableVisualBuilder.globalSettings?.logoUrl || ''}
                    onUploadComplete={(url) => setEditableVisualBuilder(prev => ({
                      ...prev,
                      globalSettings: { ...(prev.globalSettings || {}), logoUrl: url }
                    }))}
                  />
                  <input 
                    type="text" 
                    value={editableVisualBuilder.globalSettings?.logoUrl || ''}
                    onChange={(e) => setEditableVisualBuilder(prev => ({
                      ...prev,
                      globalSettings: { ...(prev.globalSettings || {}), logoUrl: e.target.value }
                    }))}
                    className="w-full px-3 py-1 bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-400 rounded-lg focus:outline-none"
                    placeholder="Or paste custom logo URL..."
                  />
                </div>
              </div>
            </div>

            {/* SEO METADATA */}
            <div className="p-4 bg-neutral-900/30 border border-neutral-850 rounded-2xl space-y-4">
              <span className="text-xs font-serif font-bold text-neutral-200 select-text">SEO Optimization Meta Fields</span>
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400">Search Meta Title Tag</label>
                  <input 
                    type="text" 
                    value={editableVisualBuilder.globalSettings?.metaTitle || ''}
                    onChange={(e) => setEditableVisualBuilder(prev => ({
                      ...prev,
                      globalSettings: { ...(prev.globalSettings || {}), metaTitle: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400">Meta Description String Tag</label>
                  <textarea 
                    rows={2}
                    value={editableVisualBuilder.globalSettings?.metaDesc || ''}
                    onChange={(e) => setEditableVisualBuilder(prev => ({
                      ...prev,
                      globalSettings: { ...(prev.globalSettings || {}), metaDesc: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-805 text-xs text-neutral-250 rounded-xl"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* DYNAMIC HEADER NAVIGATION MENU MANAGER */}
          <div className="p-4 bg-neutral-900/30 border border-neutral-805 rounded-2xl space-y-4">
            <div className="border-b border-neutral-900 pb-2">
              <span className="text-xs font-serif font-bold text-neutral-200">Header Menu Links Navigation System</span>
              <p className="text-[10px] text-neutral-500 mt-0.5">This list controls items in your website's main top navigation bar dynamically.</p>
            </div>

            {/* List of active links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3">
              {(editableVisualBuilder.globalSettings?.navMenu || []).map((nav, nIdx) => (
                <div key={nav.id} className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl flex items-center justify-between gap-3 select-text">
                  <div>
                    <span className="text-[9.5px] uppercase font-serif font-bold text-amber-500">#{nIdx + 1} link</span>
                    <h5 className="font-sans font-bold text-sm text-neutral-100">{nav.label}</h5>
                    <span className="text-[9.5px] font-mono text-neutral-500">{nav.link}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={nIdx === 0}
                      onClick={() => moveNavItem(nav.id, 'up')}
                      className="p-1 px-1.5 bg-neutral-900 hover:text-neutral-200 text-neutral-500 rounded border border-neutral-800 disabled:opacity-25 cursor-pointer"
                    >
                      <ArrowUp size={11} />
                    </button>
                    <button
                      type="button"
                      disabled={nIdx === (editableVisualBuilder.globalSettings?.navMenu || []).length - 1}
                      onClick={() => moveNavItem(nav.id, 'down')}
                      className="p-1 px-1.5 bg-neutral-900 hover:text-neutral-200 text-neutral-500 rounded border border-neutral-800 disabled:opacity-25 cursor-pointer"
                    >
                      <ArrowDown size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeNavItem(nav.id)}
                      className="p-1 px-2.5 bg-red-950/20 text-red-400 hover:text-red-300 border border-red-950 rounded cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add menu item form */}
            <div className="bg-neutral-950 p-4 border border-neutral-850 rounded-xl flex flex-wrap gap-4 items-end justify-between select-text">
              <div className="grid grid-cols-2 gap-3.5 w-full md:w-auto md:flex-1">
                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-bold text-neutral-400 block">Link title label</label>
                  <input 
                    type="text"
                    value={newNavItem.label}
                    onChange={(e) => setNewNavItem(prev => ({ ...prev, label: e.target.value }))}
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs px-3 py-2 rounded-xl text-neutral-205 focus:outline-none focus:border-amber-500"
                    placeholder="e.g. VIP Lounges"
                  />
                </div>
                <div className="space-y-1 font-mono">
                  <label className="text-[9.5px] uppercase font-bold text-neutral-400 block">Target hashtag/URL address</label>
                  <input 
                    type="text"
                    value={newNavItem.link}
                    onChange={(e) => setNewNavItem(prev => ({ ...prev, link: e.target.value }))}
                    className="w-full bg-neutral-900 border border-neutral-800 text-xs px-3 py-2 rounded-xl text-neutral-200 focus:outline-none focus:border-amber-500"
                    placeholder="e.g. #booking, or #vip-lounge"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addNavItem}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-850 text-amber-500 hover:text-amber-400 border border-neutral-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer w-full md:w-auto"
              >
                + Register Nav menu Anchor
              </button>
            </div>
          </div>

          {/* DYNAMIC SITE COPYRIGHT FOOTE COPY */}
          <div className="p-4 bg-neutral-900/30 border border-neutral-805 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-neutral-400 block">Website Footer Description / Summary narration</label>
              <textarea 
                rows={2}
                value={editableVisualBuilder.globalSettings?.footerText || ''}
                onChange={(e) => setEditableVisualBuilder(prev => ({
                  ...prev,
                  globalSettings: { ...(prev.globalSettings || {}), footerText: e.target.value }
                }))}
                className="w-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 rounded-xl px-3 py-2"
                placeholder="Footer business briefing statement..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-neutral-400 block">Copyright credit line branding</label>
              <input 
                type="text" 
                value={editableVisualBuilder.globalSettings?.copyrightText || ''}
                onChange={(e) => setEditableVisualBuilder(prev => ({
                  ...prev,
                  globalSettings: { ...(prev.globalSettings || {}), copyrightText: e.target.value }
                }))}
                className="w-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 rounded-xl px-3 py-2"
                placeholder="© 2026 Anika Makeover Salon..."
              />
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 3. MEDIA FILE MANAGER LIBRARY */}
      {activeTab === 'media' && (
        <div className="bg-neutral-950 border border-neutral-850 p-6 rounded-3xl space-y-6 select-text">
          <div className="border-b border-neutral-900 pb-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h4 className="font-serif font-bold text-base text-neutral-200 flex items-center gap-1.5">
                <Image className="text-amber-500" size={16} />
                <span>Enterprise Salon Media Library</span>
              </h4>
              <p className="text-[11px] text-neutral-500 font-light">Upload dynamic photos/videos directly to Firebase Storage and track, preview, delete, or link files in any section.</p>
            </div>
          </div>

          {/* DEDICATED FILE UPLOADER TO REGSITER DIRECT ASSETS */}
          <div className="bg-neutral-900/60 p-5 rounded-2xl border border-neutral-850 space-y-4">
            <span className="text-[11px] uppercase font-bold tracking-wide text-amber-500 block">Upload New Asset Direct</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <DirectFileUploader 
                label="Directly drag/drop or select image or video files"
                accept="*/*"
                folder="library"
                currentValue=""
                onUploadComplete={(url) => {
                  const item = {
                    id: `m-new-${Date.now()}`,
                    name: `User Uploaded Asset ${Date.now().toString().slice(-4)}`,
                    url,
                    type: url.includes('.mp4') || url.includes('video') ? 'video' : 'image',
                    size: 'User File',
                    createdAt: new Date().toISOString().split('T')[0]
                  };
                  setEditableVisualBuilder(prev => ({
                    ...prev,
                    mediaLibrary: [item, ...(prev.mediaLibrary || [])]
                  }));
                  setMediaAlert('✅ File uploaded and registered instantly inside media vault collection!');
                  setTimeout(() => setMediaAlert(null), 3500);
                }}
              />
              <div className="p-4 bg-neutral-950 border border-neutral-850 rounded-xl space-y-1.5 block">
                <span className="text-[10px] text-neutral-400 font-semibold block">💡 How to associate files:</span>
                <p className="text-[9.5px] text-neutral-500 leading-relaxed">
                  After upload, copy the visual file link address using the copy action widgets below. You can then paste the direct file references inside any background cover, sliders or custom bio content slots!
                </p>
              </div>
            </div>
            {mediaAlert && <p className="text-xs text-amber-500 font-mono font-bold animate-pulse">{mediaAlert}</p>}
          </div>

          {/* GRID OF MEDIA ASSETS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(editableVisualBuilder.mediaLibrary || []).map((media) => (
              <div key={media.id} className="bg-neutral-900 border border-neutral-850 rounded-2xl overflow-hidden group flex flex-col justify-between">
                
                {/* PREVIEW CONTAINER */}
                <div className="h-32 bg-neutral-950 relative flex items-center justify-center">
                  {media.type === 'image' ? (
                    <img 
                      src={media.url} 
                      alt={media.name} 
                      className="w-full h-full object-cover brightness-90 hover:brightness-100 transition-all"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <video 
                      src={media.url} 
                      muted 
                      className="w-full h-full object-cover brightness-85"
                    />
                  )}
                  <span className={`absolute top-2 left-2 p-1 px-1.5 text-[8.5px] font-mono leading-none rounded uppercase ${
                    media.type === 'video' ? 'bg-indigo-950/80 text-indigo-400 border border-indigo-900' : 'bg-amber-950/80 text-amber-400 border border-amber-900'
                  }`}>
                    {media.type}
                  </span>
                </div>

                {/* DETAILS CONTAINER */}
                <div className="p-3 bg-neutral-950/30 space-y-1 flex-1 flex flex-col justify-between">
                  <div>
                    <h6 className="text-[10.5px] font-bold text-neutral-200 truncate" title={media.name}>{media.name}</h6>
                    <span className="text-[9px] text-neutral-500 font-mono block">{media.size} • Created: {media.createdAt}</span>
                  </div>
                  
                  <div className="pt-2 border-t border-neutral-850 flex gap-2 w-full">
                    {/* Copy URL bar */}
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(media.url);
                        alert('📋 Direct resource link address copied to clipboard!');
                      }}
                      className="flex-1 py-1 px-2 text-[10px] bg-neutral-900 hover:bg-neutral-800 text-amber-500 hover:text-amber-400 font-bold border border-neutral-800 rounded-lg cursor-pointer transition-colors"
                    >
                      Copy URL
                    </button>
                    {/* Delete asset details */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Permanently remove this file from your visual vault?')) {
                          setEditableVisualBuilder(prev => ({
                            ...prev,
                            mediaLibrary: (prev.mediaLibrary || []).filter(m => m.id !== media.id)
                          }));
                        }
                      }}
                      className="p-1 px-2.5 bg-neutral-900 hover:bg-red-950/30 text-rose-500 hover:text-rose-400 border border-neutral-800 rounded-lg cursor-pointer transition-colors"
                      title="Delete from Library list"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* SUBTAB 4. ACCESS PASSWORD SECURITY */}
      {activeTab === 'security' && (
        <div className="bg-neutral-950 border border-neutral-850 p-6 rounded-3xl space-y-6">
          <div className="border-b border-neutral-900 pb-3">
            <h4 className="font-serif font-bold text-base text-neutral-200 flex items-center gap-1.5">
              <Lock className="text-amber-400" size={16} />
              <span>Staff Core Security Access Password Manager</span>
            </h4>
            <p className="text-[11px] text-neutral-500 font-light">Change the administrator/staff security password required to log in to this builder panel. Changes are permanent.</p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-neutral-400 block">Current Staff credentials Password</label>
                <input 
                  type="password"
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="Current Staff Password Key..."
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-405 block">New Secure Password key</label>
                  <input 
                    type="password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="Writedown a secure hash..."
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-405 block">Confirm Password key</label>
                  <input 
                    type="password"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="Confirm password hash..."
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-850 text-amber-500 hover:text-amber-400 border border-neutral-800 text-xs font-semibold rounded-xl cursor-pointer transition-all hover:border-amber-500/20"
            >
              Update Staff Security Hash Keys
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
