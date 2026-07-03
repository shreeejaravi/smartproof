import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <footer className="border-t border-border/50 py-8 text-center">
        <p className="text-xs text-muted-foreground">
          SilentProof &mdash; AI-Based Exam Hall Integrity System
        </p>
      </footer>
    </main>
  )
}
