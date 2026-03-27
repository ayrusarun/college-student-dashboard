"use client";

import { useState, useEffect, useMemo } from "react";
import { CalendarClock, Clock, MapPin, User } from "lucide-react";
import { timetableApi, academicApi } from "@/lib/api/client";
import { TimetableEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";
import { ListSkeleton } from "@/components/ui/Skeleton";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const COLORS = [
  "bg-teal-50 border-teal-200 text-teal-800",
  "bg-blue-50 border-blue-200 text-blue-800",
  "bg-purple-50 border-purple-200 text-purple-800",
  "bg-amber-50 border-amber-200 text-amber-800",
  "bg-pink-50 border-pink-200 text-pink-800",
  "bg-cyan-50 border-cyan-200 text-cyan-800",
  "bg-emerald-50 border-emerald-200 text-emerald-800",
  "bg-orange-50 border-orange-200 text-orange-800",
];

export default function TimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"today" | "week">("today");

  const today = new Date().getDay(); // 0=Sun, 1=Mon...
  const todayIndex = today === 0 ? 6 : today - 1; // Convert to 0=Mon

  useEffect(() => {
    const load = async () => {
      try {
        // Get current academic year
        const yearRes = await academicApi.getCurrentYear();
        const year = yearRes.data;
        if (!year) return;

        // Get current semester
        const semRes = await academicApi.listSemesters(year.id);
        const semesters = Array.isArray(semRes.data) ? semRes.data : semRes.data?.items || [];
        const currentSem = semesters.find((s: any) => s.is_current);
        if (!currentSem) return;

        const ttRes = await timetableApi.getMyTimetable({
          academic_year_id: year.id,
          semester: currentSem.semester_number,
        });
        setEntries(ttRes.data?.entries || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Color mapping by subject
  const subjectColors = useMemo(() => {
    const map = new Map<string, string>();
    const uniqueSubjects = [...new Set(entries.map((e) => e.subject_code))];
    uniqueSubjects.forEach((code, i) => {
      map.set(code, COLORS[i % COLORS.length]);
    });
    return map;
  }, [entries]);

  const todayEntries = entries
    .filter((e) => e.day_of_week === todayIndex)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const entriesByDay = DAY_NAMES.map((_, i) =>
    entries.filter((e) => e.day_of_week === i).sort((a, b) => a.start_time.localeCompare(b.start_time))
  );

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarClock className="h-6 w-6 text-teal-600" />
          Timetable
        </h1>
        <ListSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarClock className="h-6 w-6 text-teal-600" />
          Timetable
        </h1>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("today")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
              viewMode === "today" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            )}
          >
            Today
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
              viewMode === "week" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            )}
          >
            Week
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No timetable found"
          description="Your timetable hasn't been generated yet for the current semester."
        />
      ) : viewMode === "today" ? (
        <div>
          <p className="text-sm text-gray-500 mb-3">{DAY_FULL[todayIndex]}</p>
          {todayEntries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <p className="text-gray-500 text-sm">No classes today</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayEntries.map((entry, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-2xl border p-4 animate-fade-in-up",
                    subjectColors.get(entry.subject_code) || COLORS[0]
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold">{entry.subject_name}</p>
                      <p className="text-xs font-mono opacity-70">{entry.subject_code}</p>
                    </div>
                    <span className="text-xs font-medium opacity-80">
                      {entry.slot_type || "LECTURE"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs opacity-70">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {entry.start_time} - {entry.end_time}
                    </span>
                    {entry.room_code && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {entry.room_code}
                      </span>
                    )}
                    {entry.faculty_name && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {entry.faculty_name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Week view */
        <div className="space-y-4 overflow-x-auto">
          {entriesByDay.map((dayEntries, dayIdx) => {
            if (dayEntries.length === 0) return null;
            return (
              <div key={dayIdx}>
                <p className={cn(
                  "text-sm font-semibold mb-2",
                  dayIdx === todayIndex ? "text-teal-600" : "text-gray-700"
                )}>
                  {DAY_FULL[dayIdx]}
                  {dayIdx === todayIndex && (
                    <span className="text-[10px] text-teal-500 ml-2 font-normal">Today</span>
                  )}
                </p>
                <div className="space-y-1.5">
                  {dayEntries.map((entry, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-xs",
                        subjectColors.get(entry.subject_code) || COLORS[0]
                      )}
                    >
                      <span className="font-mono text-[10px] w-24 shrink-0 opacity-70">
                        {entry.start_time}-{entry.end_time}
                      </span>
                      <span className="font-semibold truncate flex-1">{entry.subject_name}</span>
                      {entry.room_code && (
                        <span className="opacity-70 shrink-0">{entry.room_code}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
