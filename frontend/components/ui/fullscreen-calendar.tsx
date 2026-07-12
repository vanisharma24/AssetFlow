"use client"

import * as React from "react"
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  startOfWeek,
} from "date-fns"
import { ChevronLeftIcon, ChevronRightIcon, PlusCircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export interface CalendarEvent {
  id: string
  name: string
  time: string
  datetime: string
  /** Tailwind bg colour class e.g. "bg-emerald-500" */
  color?: string
}

interface FullScreenCalendarProps {
  events?: CalendarEvent[]
  onDayClick?: (date: Date) => void
  onAddClick?: (date: Date) => void
}

function colStartClasses(day: number) {
  return [
    "",
    "col-start-2",
    "col-start-3",
    "col-start-4",
    "col-start-5",
    "col-start-6",
    "col-start-7",
  ][day]
}

export function FullScreenCalendar({
  events = [],
  onDayClick,
  onAddClick,
}: FullScreenCalendarProps) {
  const today = startOfToday()
  const [selectedDay, setSelectedDay] = React.useState(today)
  const [currentMonth, setCurrentMonth] = React.useState(
    format(today, "MMM-yyyy")
  )
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date())

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  })

  function previousMonth() {
    const firstDayPrevMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayPrevMonth, "MMM-yyyy"))
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function goToToday() {
    setCurrentMonth(format(today, "MMM-yyyy"))
    setSelectedDay(today)
  }

  const selectedDayEvents = events.filter((e) =>
    isSameDay(parse(e.datetime, "yyyy-MM-dd'T'HH:mm", new Date()), selectedDay)
  )

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">
            {format(firstDayCurrentMonth, "MMMM yyyy")}
          </h1>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={previousMonth}
              aria-label="Previous month"
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={nextMonth}
              aria-label="Next month"
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Today
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Calendar grid */}
        <div className="flex flex-col flex-1 overflow-auto">
          {/* Day names */}
          <div className="grid grid-cols-7 border-b border-border text-center text-xs font-medium text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 flex-1 auto-rows-fr">
            {days.map((day, dayIdx) => {
              const dayEvents = events.filter((e) =>
                isSameDay(
                  parse(e.datetime, "yyyy-MM-dd'T'HH:mm", new Date()),
                  day
                )
              )
              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "relative min-h-[90px] border-b border-r border-border p-1 transition-colors",
                    dayIdx === 0 && colStartClasses(getDay(day)),
                    !isSameMonth(day, firstDayCurrentMonth) &&
                      "bg-muted/30 opacity-60",
                    isEqual(day, selectedDay) &&
                      "ring-2 ring-inset ring-emerald-500",
                    "cursor-pointer hover:bg-muted/50"
                  )}
                  onClick={() => {
                    setSelectedDay(day)
                    onDayClick?.(day)
                  }}
                >
                  <button
                    type="button"
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                      isToday(day) &&
                        "bg-emerald-500 text-white font-bold",
                      isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedDay(day)
                      onDayClick?.(day)
                    }}
                  >
                    {format(day, "d")}
                  </button>

                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <p
                        key={event.id}
                        className={cn(
                          "truncate rounded px-1 py-0.5 text-[10px] font-medium text-white",
                          event.color ?? "bg-emerald-500"
                        )}
                      >
                        {event.name}
                      </p>
                    ))}
                    {dayEvents.length > 3 && (
                      <p className="text-[10px] text-muted-foreground pl-1">
                        +{dayEvents.length - 3} more
                      </p>
                    )}
                  </div>

                  {/* Quick add button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddClick?.(day)
                    }}
                    className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity text-muted-foreground hover:text-emerald-500"
                    aria-label="Add booking"
                  >
                    <PlusCircleIcon className="size-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar – selected day events */}
        <aside className="hidden lg:flex w-72 flex-col border-l border-border">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold">
              {format(selectedDay, "EEEE, MMMM d")}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedDayEvents.length === 0
                ? "No bookings"
                : `${selectedDayEvents.length} booking${selectedDayEvents.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
            {selectedDayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-sm text-muted-foreground">
                  No bookings on this day
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-emerald-600 hover:text-emerald-700"
                  onClick={() => onAddClick?.(selectedDay)}
                >
                  <PlusCircleIcon className="mr-1 size-4" /> Add booking
                </Button>
              </div>
            ) : (
              selectedDayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={cn(
                      "mt-1 h-2 w-2 rounded-full shrink-0",
                      event.color ?? "bg-emerald-500"
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{event.name}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Separator />
          <div className="p-4">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              size="sm"
              onClick={() => onAddClick?.(selectedDay)}
            >
              <PlusCircleIcon className="mr-1.5 size-4" /> New Booking
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
