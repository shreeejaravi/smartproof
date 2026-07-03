"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { SimulationViewer } from "@/components/simulation-viewer"
import { generateDemoSeats, getDemoEvents } from "@/lib/simulation-engine"
import { useMemo } from "react"

export default function DemoPage() {
  const seats = useMemo(() => generateDemoSeats(), [])
  const events = useMemo(() => getDemoEvents(), [])

  return (
    <>
      <DashboardHeader title="Demo Mode" subtitle="Pre-configured cinematic simulation with scripted events" />
      <main className="flex-1 overflow-y-auto p-6">
        <SimulationViewer initialSeats={seats} events={events} cols={8} title="Demo Simulation" />
      </main>
    </>
  )
}
