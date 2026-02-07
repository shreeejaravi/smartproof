import { Eye, ShieldCheck, Zap, Lock } from "lucide-react"

const features = [
  {
    icon: Eye,
    title: "Real-Time Monitoring",
    description: "AI-driven behavioral analysis scans every seat in the exam hall with precision, detecting anomalies instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Integrity Scoring",
    description: "Each student receives a dynamic integrity score based on multi-layered AI analysis of behavior patterns.",
  },
  {
    icon: Zap,
    title: "Instant Alerts",
    description: "Receive real-time alerts with severity classification. Respond to threats before they escalate.",
  },
  {
    icon: Lock,
    title: "Privacy-First Design",
    description: "No facial recognition, no audio recording. SilentProof uses anonymous behavior patterns only.",
  },
]

export function FeaturesSection() {
  return (
    <section className="relative px-4 py-24 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
          Intelligent Monitoring, <span className="text-primary">Zero Intrusion</span>
        </h2>
        <p className="mt-4 text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Built on cutting-edge AI that respects privacy while maintaining the highest standards of academic integrity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group relative rounded-2xl border border-border/50 bg-card p-8 transition-all duration-300 hover:border-primary/30 hover:bg-card/80"
          >
            <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex flex-col gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
