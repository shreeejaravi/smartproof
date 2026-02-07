"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { ClassroomWizard } from "@/components/classroom-wizard"
import { AuthGuard } from "@/components/auth-guard"

export default function CreateClassroomPage() {
  return (
    <AuthGuard requiredRole="admin">
      <DashboardHeader title="Create Classroom" subtitle="Set up a new exam hall configuration" />
      <main className="flex-1 overflow-y-auto p-6">
        <ClassroomWizard />
      </main>
    </AuthGuard>
  )
}
