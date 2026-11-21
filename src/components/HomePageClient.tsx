"use client";

import React, { useState } from "react";
import TopAnnouncementBar from "@/components/TopAnnouncementBar";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import OperationsDashboard from "@/components/OperationsDashboard";
import PillarsSection from "@/components/PillarsSection";
import TransparencyWall from "@/components/TransparencyWall";
import BookingSection from "@/components/BookingSection";
import EventsSection from "@/components/EventsSection";
import StoriesSection from "@/components/StoriesSection";
import FaqSection from "@/components/FaqSection";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import DonationModal from "@/components/DonationModal";

export default function HomePageClient() {
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState<number | undefined>(undefined);

  const handleOpenDonation = (amount?: number) => {
    setDonationAmount(amount);
    setIsDonationOpen(true);
  };

  const handleScrollToBooking = () => {
    const el = document.getElementById("booking-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-slate-800 selection:bg-emerald-500 selection:text-white">
      {/* Top Dynamic Announcement Ribbon (Admin controlled) */}
      <TopAnnouncementBar />

      {/* Navigation Bar with Prominent EN/AR Switcher & Header Status Pill */}
      <Navbar
        onOpenBooking={handleScrollToBooking}
        onOpenDonation={handleOpenDonation}
      />

      {/* Main Landing Page Content */}
      <main className="flex-1">
        {/* 1. Hero Section (2 Clean CTAs, No Clutter, Photography Slot) */}
        <HeroSection
          onOpenBooking={handleScrollToBooking}
          onOpenDonation={handleOpenDonation}
        />

        {/* 2. Unified Operations & Verified Field Impact Dashboard */}
        <OperationsDashboard />

        {/* 3. Community Service Pillars */}
        <PillarsSection />

        {/* 4. Single Unified Transparency & Donation Section */}
        <TransparencyWall onOpenDonation={handleOpenDonation} />

        {/* 5. Instant Seat Reservation */}
        <BookingSection />

        {/* 6. Current Events & Bootcamps */}
        <EventsSection />

        {/* 7. Stories of Resilience */}
        <StoriesSection />

        {/* 8. Frequently Asked Questions */}
        <FaqSection />

        {/* 9. Final Pre-Footer Call to Action Strip */}
        <CtaBanner
          onOpenBooking={handleScrollToBooking}
          onOpenDonation={handleOpenDonation}
        />
      </main>

      {/* 10. Comprehensive Accessible Footer */}
      <Footer onOpenDonation={handleOpenDonation} />

      {/* High-Converting Interactive Donation Modal */}
      <DonationModal
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
        initialAmount={donationAmount}
      />
    </div>
  );
}
