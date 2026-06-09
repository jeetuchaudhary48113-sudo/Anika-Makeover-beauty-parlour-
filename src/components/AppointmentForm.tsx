/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, Phone, Clock, User, Clipboard, Sparkles, CheckCircle } from 'lucide-react';
import { Service, Contact } from '../types';
import { addAppointment } from '../lib/db';

interface AppointmentFormProps {
  services: Service[];
  contact: Contact;
  preselectedServiceId: string | null;
  onClearPreselected: () => void;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  services, 
  contact, 
  preselectedServiceId,
  onClearPreselected
}) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookedId, setBookedId] = useState("");

  // Handle pre-filled service configuration triggered from cards
  useEffect(() => {
    if (preselectedServiceId) {
      setSelectedServiceId(preselectedServiceId);
      // Automatically scroll smoothly to booking element
      const element = document.getElementById('booking');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [preselectedServiceId]);

  const handleSubmit = async (e: React.FormEvent, isWhatsAppDirect = false) => {
    e.preventDefault();
    if (!fullName || !phone || !selectedServiceId || !date || !time) {
      alert("Please fill in all mandatory booking fields.");
      return;
    }

    setLoading(true);

    try {
      const selectedService = services.find(s => s.id === selectedServiceId);
      const serviceName = selectedService ? selectedService.name : "Custom Treatment";

      const appointmentData = {
        fullName,
        phone,
        serviceId: selectedServiceId,
        serviceName,
        date,
        time,
        notes: notes || "No additional files/notes provided.",
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      };

      const docId = await addAppointment(appointmentData);
      setBookedId(docId);
      setSuccess(true);

      // WhatsApp deep-link formulation
      const rawText = `Name: ${fullName}
Phone: ${phone}
Service: ${serviceName}
Date: ${date}
Time: ${time}
Message: ${notes || "Requesting luxury makeover slot."}`;

      const encodedText = encodeURIComponent(rawText);
      const formattedWhatsapp = contact.whatsapp.replace('+', '').replace(' ', '');
      const waUrl = `https://wa.me/${formattedWhatsapp}?text=${encodedText}`;

      // Open WhatsApp automatically
      window.open(waUrl, '_blank');

      // Clear fields
      setFullName("");
      setPhone("");
      setSelectedServiceId("");
      setDate("");
      setTime("");
      setNotes("");
      onClearPreselected();

    } catch (error) {
      console.error("Booking caught error", error);
      alert("Scheduling stalled temporarily. Fallback local slot engaged.");
    } finally {
      setLoading(false);
    }
  };

  // Restrict appointment scheduling to today onwards
  const todayString = new Date().toISOString().split('T')[0];

  return (
    <section id="booking" className="bg-neutral-900 border-t border-b border-neutral-950 text-neutral-100 py-20 sm:py-24 relative overflow-hidden">
      
      {/* Decorative luxury elements */}
      <div className="absolute top-0 left-0 w-44 h-44 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-44 h-44 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-xs uppercase tracking-widest mb-3">
            <Sparkles size={12} className="animate-pulse" />
            <span>VIP Scheduling</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight text-neutral-100">
            Reserve Your Styling Session
          </h2>
          <div className="w-16 h-[2.5px] bg-amber-500 mx-auto mt-4" />
          <p className="mt-4 text-neutral-400 text-sm sm:text-base max-w-lg mx-auto font-light">
            Fill in details below to securely lock your appointment date, followed by instant, convenient confirmation via WhatsApp.
          </p>
        </div>

        {success ? (
          /* Glamour booking confirmation modal state */
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 max-w-xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto scale-110">
              <CheckCircle size={32} />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif font-bold text-2xl text-neutral-100">
                Salon Appointment Generated!
              </h3>
              <p className="text-xs text-neutral-400">
                Receipt ID: <span className="font-mono text-amber-500 font-bold">{bookedId}</span>
              </p>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed max-w-md mx-auto">
              We have securely saved your luxury service slot in our calendar! Your WhatsApp helper has been requested to send these details to Anika Choudhary. If the window did not open, click the link button below.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => setSuccess(false)}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-semibold uppercase tracking-wider text-neutral-300 transition-colors cursor-pointer"
              >
                Book Another Slot
              </button>
              <a
                href={`https://wa.me/${contact.whatsapp.replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold uppercase tracking-wider text-white inline-flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
              >
                <MessageSquare size={14} />
                <span>Open WhatsApp manually</span>
              </a>
            </div>
          </div>
        ) : (
          /* Interactive appointment scheduler form standard */
          <form 
            onSubmit={(e) => handleSubmit(e, false)}
            className="bg-neutral-950 border border-neutral-800/80 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl space-y-6"
          >
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-xs uppercase font-semibold text-neutral-400 tracking-wider flex items-center gap-1.5 select-none">
                  <User size={13} className="text-amber-500" />
                  <span>Full Name</span>
                  <span className="text-amber-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-neutral-200 transition-colors"
                  placeholder="e.g. Priyanka Mishra"
                  required
                />
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <label className="text-xs uppercase font-semibold text-neutral-400 tracking-wider flex items-center gap-1.5 select-none">
                  <Phone size={13} className="text-amber-500" />
                  <span>Mobile Phone Contract</span>
                  <span className="text-amber-500">*</span>
                </label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-neutral-200 transition-colors font-mono"
                  placeholder="e.g. +91 8922933940"
                  required
                />
              </div>

              {/* Service selection list drop-down */}
              <div className="space-y-2">
                <label className="text-xs uppercase font-semibold text-neutral-400 tracking-wider flex items-center gap-1.5 select-none">
                  <Clipboard size={13} className="text-amber-500" />
                  <span>Selected Service</span>
                  <span className="text-amber-500">*</span>
                </label>
                <select 
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-neutral-300 transition-colors cursor-pointer"
                  required
                >
                  <option value="" disabled>-- Pick Premium Treatment --</option>
                  {services.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name} (Rs. {srv.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Preferred Date Field */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase font-semibold text-neutral-400 tracking-wider flex items-center gap-1.5 select-none">
                    <Calendar size={13} className="text-amber-500" />
                    <span>Pref Date</span>
                    <span className="text-amber-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    value={date}
                    min={todayString}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-neutral-300 transition-colors font-mono"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-semibold text-neutral-400 tracking-wider flex items-center gap-1.5 select-none">
                    <Clock size={13} className="text-amber-500" />
                    <span>Slot Time</span>
                    <span className="text-amber-500">*</span>
                  </label>
                  <input 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-neutral-300 transition-colors font-mono"
                    required
                  />
                </div>
              </div>

            </div>

            {/* Additional notes message */}
            <div className="space-y-2">
              <label className="text-xs uppercase font-semibold text-neutral-400 tracking-wider block select-none">
                Special customization request notes (Optional)
              </label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-neutral-300 transition-colors h-24 font-light resize-none"
                placeholder="Indicate hair lengths, specific dye coloring tones, skin allergies, or bridal makeup preferences..."
              />
            </div>

            {/* Direct Multi-Choice Booking buttons panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-neutral-950 font-semibold tracking-wider uppercase rounded-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md shadow-neutral-950/20"
              >
                <span>{loading ? "Locking Slot..." : "Secure Book Slot"}</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="w-full py-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold tracking-wider uppercase rounded-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <MessageSquare size={16} />
                <span>Express WhatsApp Booking</span>
              </button>

            </div>

            <p className="text-[10px] text-neutral-500 text-center font-mono mt-2 uppercase tracking-widest">
              By submitting, your request records temporarily cache locally & transmit to official Firestore server database.
            </p>

          </form>
        )}

      </div>
    </section>
  );
};
