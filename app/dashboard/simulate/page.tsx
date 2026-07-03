"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { SimulationViewer } from "@/components/simulation-viewer"
import { useClassroomStore } from "@/lib/classroom-store"
import { generateCustomSeats, generateDemoSeats, getDemoEvents } from "@/lib/simulation-engine"
import { useSearchParams } from "next/navigation"
import { useMemo, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Play, Grid3X3 } from "lucide-react"
import Link from "next/link"

function SimulateContent() {
  const searchParams = useSearchParams()
  const classroomId = searchParams.get("id")
  const { classrooms } = useClassroomStore()

  const classroom = classroomId ? classrooms.find((c) => c.id === classroomId) : null

  const seats = useMemo(() => {
    if (classroom) return generateCustomSeats(classroom)
    return generateDemoSeats()
  }, [classroom])

  const events = useMemo(() => {
    if (classroom) return classroom.events
    return getDemoEvents()
  }, [classroom])

  if (!classroomId) {
    // Show classroom picker
    return (
      <>
        <DashboardHeader title="Simulation Manager" subtitle="Select a classroom to simulate" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-6 max-w-4xl">
            {/* Demo option */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Play className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Demo Simulation</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Pre-configured 6x8 cinematic simulation</p>
                  </div>
                </div>
                <Button asChild className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/dashboard/demo">Launch Demo</Link>
                </Button>
              </div>
            </div>

            {/* Custom classrooms */}
            {classrooms.length > 0 && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Custom Classrooms</p>
                {classrooms.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-border/50 bg-card p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                          <Grid3X3 className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{c.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {c.rows}x{c.cols} grid, {c.events.length} events
                          </p>
                        </div>
                      </div>
                      <Button asChild variant="outline" className="rounded-xl border-border/50 bg-transparent text-foreground">
                        <Link href={`/dashboard/simulate?id=${c.id}`}>Run</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {classrooms.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground">No custom classrooms yet.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Create one from the sidebar to run custom simulations.</p>
              </div>
            )}
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <DashboardHeader
        title={classroom ? classroom.name : "Simulation"}
        subtitle={classroom ? `${classroom.rows}x${classroom.cols} grid with ${classroom.events.length} events` : "Custom simulation"}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <SimulationViewer
          initialSeats={seats}
          events={events}
          cols={classroom ? classroom.cols : 8}
          title={classroom ? classroom.name : "Simulation"}
        />
      </main>
    </>
  )
}

export default function SimulatePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <SimulateContent />
    </Suspense>
  )
}
