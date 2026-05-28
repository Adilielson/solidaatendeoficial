import { useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ForWhom from "@/components/landing/ForWhom";
import WhyChoose from "@/components/landing/WhyChoose";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import ChatDemo from "@/components/landing/ChatDemo";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Index = () => {

  // Fade-in on scroll for .fade-section + counters
  useEffect(() => {
    // Add .fade-section to all landing sections automatically
    const sections = document.querySelectorAll<HTMLElement>(".landing-theme section");
    sections.forEach((s) => s.classList.add("fade-section"));

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            sectionObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    sections.forEach((s) => sectionObserver.observe(s));

    // Counter animation
    const animateCounter = (el: HTMLElement) => {
      const target = parseInt(el.getAttribute("data-target") || "0", 10);
      const suffix = el.getAttribute("data-suffix") || "";
      const prefix = el.getAttribute("data-prefix") || "";
      const duration = 1800;
      let start: number | null = null;
      const step = (timestamp: number) => {
        if (start === null) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = Math.floor(eased * target);
        el.textContent = `${prefix}${current.toLocaleString("pt-BR")}${suffix}`;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting && el.dataset.animated !== "true") {
            el.dataset.animated = "true";
            animateCounter(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    document
      .querySelectorAll<HTMLElement>(".landing-theme .counter")
      .forEach((el) => counterObserver.observe(el));

    return () => {
      sectionObserver.disconnect();
      counterObserver.disconnect();
    };
  }, []);

  return (
    <div className="landing-theme min-h-screen">
      <Navbar />
      <Hero />
      <ForWhom />
      <WhyChoose />
      <Features />
      <HowItWorks />
      <ChatDemo />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
