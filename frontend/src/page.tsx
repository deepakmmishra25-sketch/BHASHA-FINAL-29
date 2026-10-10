import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { LanguageShowcase } from "@/components/landing/language-showcase";
import { CTA } from "@/components/landing/cta";
import { LanguageGate } from "@/components/landing/language-gate";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <LanguageGate />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <LanguageShowcase />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
