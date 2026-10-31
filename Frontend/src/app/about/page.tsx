import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Sparkles, Award, HeartHandshake } from "lucide-react";

export const metadata = {
  title: "About Aryora — Light. Legacy. You.",
  description:
    "Learn about Aryora, a Lucknow-based fine jewellery brand crafting IGI-certified lab-grown diamond, gold and 92.5 silver heirlooms for modern India.",
};

export default function AboutPage() {
  return (
    <div className="max-w-content mx-auto px-6 md:px-8 py-8 md:py-16 space-y-16 md:space-y-24">
      <Breadcrumbs items={[{ label: "About Aryora" }]} />

      {/* Hero Narrative */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <p className="eyebrow">The Atelier Chronicle</p>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-ink leading-tight">
          Light. Legacy. You.
        </h1>
        <p className="text-base md:text-lg text-ink-muted leading-relaxed font-light">
          Founded in Lucknow, Uttar Pradesh, Aryora was born from a singular belief: that modern fine jewellery should honor centuries of royal craftsmanship while respecting the living earth.
        </p>
      </div>

      {/* Main Image Grid */}
      <div className="grid md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7 relative aspect-[4/3] bg-ivory-warm border border-border-subtle overflow-hidden flex items-center justify-center p-6">
          <Image
            src="/site/hero-poster.svg"
            alt="Master artisan hand-setting diamonds at Aryora atelier"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-contain"
          />
        </div>

        <div className="md:col-span-5 space-y-5">
          <p className="eyebrow">Awadhi Heritage Meets Modern Science</p>
          <h2 className="font-serif text-3xl text-ink leading-snug">
            Rooted in Lucknow, Crafted for Tomorrow.
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Lucknow has long stood as an epicenter of artistic refinement—from chikankari to zardozi and delicate royal meenakari. Aryora continues this rich creative heritage by pairing veteran Indian goldsmiths with certified lab-grown diamond technology.
          </p>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Every piece is designed to be passed down through generations—an enduring heirloom that never compromises on brilliance, carat weight, or integrity.
          </p>
        </div>
      </div>

      {/* Triad of Core Values */}
      <div className="border-y border-border-subtle py-16">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <p className="eyebrow">Our Three Pillars</p>
          <h2 className="font-serif text-3xl text-ink">The Aryora Ethos</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10 text-center">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full border border-champagne flex items-center justify-center text-champagne-accessible bg-ivory mx-auto">
              <Sparkles size={20} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-2xl text-ink">Light</h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-xs mx-auto">
              The purest optical brilliance. Every stone is precision cut to maximize fire, scintillation, and mathematical symmetry, validated by independent IGI certification.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full border border-champagne flex items-center justify-center text-champagne-accessible bg-ivory mx-auto">
              <Award size={20} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-2xl text-ink">Legacy</h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-xs mx-auto">
              Crafted in solid hallmarked 18K gold and 92.5 sterling silver. We build heirlooms intended to outlive trends, bearing milestone memories from generation to generation.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full border border-champagne flex items-center justify-center text-champagne-accessible bg-ivory mx-auto">
              <HeartHandshake size={20} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-2xl text-ink">You</h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-xs mx-auto">
              Fine jewellery is an intimate extension of your values. Transparent sourcing, honest pricing, and bespoke customization celebrate your authentic journey.
            </p>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center max-w-md mx-auto space-y-4 pt-4">
        <p className="eyebrow">Begin Your Journey</p>
        <h3 className="font-serif text-3xl text-ink">Experience Conscious Brilliance</h3>
        <div className="flex justify-center gap-4 pt-2">
          <Link href="/shop" className="btn-primary text-xs">
            Explore Collection
          </Link>
          <Link href="/customize" className="btn-outline text-xs">
            Design Your Own
          </Link>
        </div>
      </div>
    </div>
  );
}
