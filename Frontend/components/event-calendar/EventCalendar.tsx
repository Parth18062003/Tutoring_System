"use client"

import { useState } from "react"
import { addDays, setHours, setMinutes, subDays } from "date-fns"
import { CalendarEvent } from "./types"
import { EventCalendar } from "./event-calendar"

const sampleEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Math Revision Session",
    description: "Review key concepts for upcoming math exam (Grade 9)",
    start: subDays(new Date(), 3), // 3 days before today
    end: subDays(new Date(), 2), // 2 days before today
    allDay: true,
    color: "sky",
    location: "Online Classroom",
  },
  {
    id: "2",
    title: "Science Project Work",
    description: "Collaborative project work on Physics experiments (Grade 10)",
    start: setMinutes(setHours(subDays(new Date(), 7), 15), 0), // 3:00 PM, 7 days before
    end: setMinutes(setHours(subDays(new Date(), 7), 17), 0), // 5:00 PM, 7 days before
    color: "amber",
    location: "School Laboratory",
  },
  {
    id: "3",
    title: "History Lecture",
    description: "Study session on Ancient India for Grade 11 students",
    start: subDays(new Date(), 10), // 10 days before today
    end: subDays(new Date(), 10), // 10 days before today
    allDay: true,
    color: "orange",
    location: "Online Lecture Hall",
  },
  {
    id: "4",
    title: "Weekly Physics Quiz",
    description: "Quiz on key topics in Physics (Grade 12)",
    start: setMinutes(setHours(new Date(), 10), 0), // 10:00 AM today
    end: setMinutes(setHours(new Date(), 11), 0), // 11:00 AM today
    color: "sky",
    location: "Online Classroom",
  },
  {
    id: "5",
    title: "Parent-Teacher Meeting",
    description: "Discuss student performance and progress (Grade 8)",
    start: setMinutes(setHours(addDays(new Date(), 1), 18), 0), // 6:00 PM, 1 day from now
    end: setMinutes(setHours(addDays(new Date(), 1), 19), 0), // 7:00 PM, 1 day from now
    color: "emerald",
    location: "School Auditorium",
  },
  {
    id: "6",
    title: "Mock Exam: Mathematics",
    description: "Timed practice for upcoming math exam (Grade 10)",
    start: addDays(new Date(), 2), // 2 days from now
    end: addDays(new Date(), 2), // 2 days from now
    allDay: true,
    color: "violet",
    location: "School Exam Hall",
  },
  {
    id: "7",
    title: "Science Workshop",
    description: "Interactive workshop on chemistry lab experiments (Grade 12)",
    start: setMinutes(setHours(addDays(new Date(), 4), 9), 0), // 9:00 AM, 4 days from now
    end: setMinutes(setHours(addDays(new Date(), 4), 12), 0), // 12:00 PM, 4 days from now
    color: "rose",
    location: "School Laboratory",
  },
  {
    id: "8",
    title: "Literature Class Discussion",
    description: "Discussion on key themes in English Literature (Grade 11)",
    start: setMinutes(setHours(addDays(new Date(), 5), 11), 30), // 11:30 AM, 5 days from now
    end: setMinutes(setHours(addDays(new Date(), 5), 13), 0), // 1:00 PM, 5 days from now
    color: "orange",
    location: "English Classroom",
  },
  {
    id: "9",
    title: "Geography Project Presentation",
    description: "Presentations on Geography project work (Grade 10)",
    start: setMinutes(setHours(addDays(new Date(), 6), 14), 0), // 2:00 PM, 6 days from now
    end: setMinutes(setHours(addDays(new Date(), 6), 16), 0), // 4:00 PM, 6 days from now
    color: "sky",
    location: "Geography Classroom",
  },
  {
    id: "10",
    title: "Study Session: Algebra",
    description: "Focused study on Algebra for Grade 9 students",
    start: setMinutes(setHours(addDays(new Date(), 7), 9), 0), // 9:00 AM, 7 days from now
    end: setMinutes(setHours(addDays(new Date(), 7), 11), 30), // 11:30 AM, 7 days from now
    color: "amber",
    location: "Online Classroom",
  },
  {
    id: "11",
    title: "Civics Debate Preparation",
    description: "Prepare for debate on Indian Constitution (Grade 12)",
    start: setMinutes(setHours(addDays(new Date(), 10), 16), 0), // 4:00 PM, 10 days from now
    end: setMinutes(setHours(addDays(new Date(), 10), 18), 0), // 6:00 PM, 10 days from now
    color: "emerald",
    location: "Debate Hall",
  },
  {
    id: "12",
    title: "Annual Science Fair",
    description: "Present science projects for the school science fair (Grade 11)",
    start: addDays(new Date(), 15), // 15 days from now
    end: addDays(new Date(), 15), // 15 days from now
    allDay: true,
    color: "sky",
    location: "School Auditorium",
  },
  {
    id: "13",
    title: "NCERT Book Reading Session",
    description: "Reading and discussion of important chapters in NCERT History books (Grade 10)",
    start: setMinutes(setHours(addDays(new Date(), 18), 10), 0), // 10:00 AM, 18 days from now
    end: setMinutes(setHours(addDays(new Date(), 18), 12), 0), // 12:00 PM, 18 days from now
    color: "rose",
    location: "Library",
  },
]

export default function EventsCal() {
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents)

  const handleEventAdd = (event: CalendarEvent) => {
    setEvents([...events, event])
  }

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    setEvents(
      events.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    )
  }

  const handleEventDelete = (eventId: string) => {
    setEvents(events.filter((event) => event.id !== eventId))
  }

  return (
    <EventCalendar
      events={events}
      onEventAdd={handleEventAdd}
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
    />
  )
}
