import EventsCal from "@/components/event-calendar/EventCalendar";
import ReturnButtons from "@/components/return-buttons";
import React from "react";

const EventsCalendarPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 pt-20 md:py-8">
      <ReturnButtons className="absolute left-4 top-4"/>
      <EventsCal />
    </div>
  );
};

export default EventsCalendarPage;
