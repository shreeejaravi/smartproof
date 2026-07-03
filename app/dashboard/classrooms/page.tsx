"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { useClassroomStore } from "@/lib/classroom-store"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Plus, Trash2, Play, Grid3X3, Calendar, Zap } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SavedClassroomsPage() {
  const { classrooms, removeClassroom } = useClassroomStore()
  const { user } = useAuth()
  const router = useRouter()

  return (
    <>
      <DashboardHeader title="Saved Classrooms" subtitle={`${classrooms.length} classroom configurations`} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-6 max-w-4xl">
          {classrooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-border/50 bg-card">
              <Grid3X3 className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Classrooms Yet</h3>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                Create a classroom configuration to run custom simulations with your own seat layouts and events.
              </p>
              {user?.role === "admin" && (
                <Button asChild className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/dashboard/create">
                    <Plus className="h-4 w-4" />
                    Create Classroom
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{classrooms.length} saved configuration{classrooms.length > 1 ? "s" : ""}</p>
                {user?.role === "admin" && (
                  <Button asChild size="sm" className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/dashboard/create">
                      <Plus className="h-4 w-4" />
                      New Classroom
                    </Link>
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classrooms.map((classroom) => {
                  const activeSeats = classroom.seats.filter((s) => s.status === "active").length
                  return (
                    <div
                      key={classroom.id}
                      className="rounded-2xl border border-border/50 bg-card p-6 transition-all duration-200 hover:border-border group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{classroom.name}</h3>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {classroom.rows} x {classroom.cols} grid
                          </p>
                        </div>
                        <button
                          onClick={() => removeClassroom(classroom.id)}
                          className="text-muted-foreground/50 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                          aria-label="Delete classroom"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Grid3X3 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">{activeSeats} active seats</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">{classroom.events.length} events</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(classroom.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Mini grid preview */}
                      <div
                        className="grid gap-0.5 mb-4"
                        style={{ gridTemplateColumns: `repeat(${classroom.cols}, minmax(0, 1fr))` }}
                      >
                        {classroom.seats.slice(0, classroom.rows * classroom.cols).map((seat) => (
                          <div
                            key={seat.id}
                            className={cn(
                              "aspect-square rounded-sm",
                              seat.status === "active" && "bg-accent/20",
                              seat.status === "empty" && "bg-secondary/20",
                              seat.status === "restricted" && "bg-warning/15"
                            )}
                          />
                        ))}
                      </div>

                      <Button
                        onClick={() => router.push(`/dashboard/simulate?id=${classroom.id}`)}
                        className="w-full gap-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                        variant="outline"
                      >
                        <Play className="h-4 w-4" />
                        Run Simulation
                      </Button>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
