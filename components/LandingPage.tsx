import React from "react";
import LandingHero from "./LandingHero";
import LandingTrending from "./LandingTrending";
import LandingBento from "./LandingBento";
import LandingDevices from "./LandingDevices";
import LandingCTA from "./LandingCTA";
import LandingFooter from "./LandingFooter";

export default function LandingPage() {
  return (
    <div className="bg-neutral-dark min-h-screen w-full font-sans">
      {/* Hero / First Section */}
      <LandingHero />

      {/* Trending Now Section */}
      <LandingTrending />

      {/* Bento Features Grid */}
      <LandingBento />

      {/* Stream on Any Device */}
      <LandingDevices />

      {/* Final Call to Action Section */}
      <LandingCTA />

      {/* Footer Section */}
      <LandingFooter />
    </div>
  );
}
