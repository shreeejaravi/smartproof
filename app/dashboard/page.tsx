"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { StatCards } from "@/components/stat-cards"
import { ClassroomHeatmap } from "@/components/classroom-heatmap"
import { AlertsPanel } from "@/components/alerts-panel"
import { ActivityTimeline } from "@/components/activity-timeline"

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader title="Exam Hall Monitor" subtitle="Room 204-A — Advanced Mathematics Final" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-6 max-w-[1400px]">
          <StatCards />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ClassroomHeatmap />
            </div>
            <div className="lg:col-span-1">
              <AlertsPanel />
            </div>
          </div>
          <ActivityTimeline />
        </div>
      </main>
    </>
  )
}
