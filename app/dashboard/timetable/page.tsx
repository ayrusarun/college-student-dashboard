"use client";

import { useState, useEffect, useMemo } from "react";
import {
  CalendarClock,
  Clock,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Ban,
  ArrowRightLeft,
  Sparkles,
  FileText,
  BookOpen,
  ClipboardCheck,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { timetableApi, academicApi, attendanceApi } from "@/lib/api/client";
import { TimetableEntry, StudentSessionItem, SessionNote } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";
import { ListSkeleton } from "@/components/ui/Skeleton";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_FULL = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
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

const SESSION_STATUS_CONFIG: Record<
  string,
  { label: string; icon: any; color: string; bgColor: string }
> = {
  upcoming: {
    label: "Upcoming",
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: Ban,
    color: "text-red-500",
    bgColor: "bg-red-50 border-red-200",
  },
  rescheduled: {
    label: "Rescheduled",
    icon: ArrowRightLeft,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200",
  },
  extra: {
    label: "Extra Class",
    icon: Sparkles,
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200",
  },
  no_data: {
    label: "No Record",
    icon: AlertCircle,
    color: "text-gray-400",
    bgColor: "bg-gray-50 border-gray-200",
  },
};

const ATTENDANCE_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  PRESENT: {
    label: "Present",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
  },
  ABSENT: { label: "Absent", color: "text-red-700", bgColor: "bg-red-100" },
  LATE: { label: "Late", color: "text-amber-700", bgColor: "bg-amber-100" },
  EXCUSED: {
    label: "Excused",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  ON_DUTY: {
    label: "On Duty",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
  MEDICAL_LEAVE: {
    label: "Medical",
    color: "text-pink-700",
    bgColor: "bg-pink-100",
  },
};

const NOTE_TYPE_CONFIG: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  HOMEWORK: {
    label: "Homework",
    icon: ClipboardCheck,
    color: "text-amber-600",
  },
  SUMMARY: { label: "Summary", icon: BookOpen, color: "text-blue-600" },
  PLAN: { label: "Plan", icon: FileText, color: "text-purple-600" },
  FEEDBACK: {
    label: "Feedback",
    icon: MessageSquare,
    color: "text-emerald-600",
  },
  GENERAL: { label: "Note", icon: FileText, color: "text-gray-600" },
};

function formatDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

export default function TimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [sessions, setSessions] = useState<StudentSessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"today" | "week">("today");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [yearId, setYearId] = useState<number | null>(null);
  const [semesterNum, setSemesterNum] = useState<number | null>(null);

  const today = new Date();
  const todayStr = formatDateStr(today);
  const selectedDateStr = formatDateStr(selectedDate);
  const selectedDayIndex =
    selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1;
  const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;

  // Load base timetable
  useEffect(() => {
    const load = async () => {
      try {
        const yearRes = await academicApi.getCurrentYear();
        const year = yearRes.data;
        if (!year) return;

        const semRes = await academicApi.listSemesters(year.id);
        const semesters = Array.isArray(semRes.data)
          ? semRes.data
          : semRes.data?.items || [];
        const currentSem = semesters.find((s: any) => s.is_current);
        if (!currentSem) return;

        setYearId(year.id);
        setSemesterNum(currentSem.semester_number);

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

  // Load session details for selected date
  useEffect(() => {
    if (!yearId || !semesterNum) return;

    const loadSessions = async () => {
      setSessionsLoading(true);
      try {
        const res = await attendanceApi.getMyStudentSessions({
          session_date: selectedDateStr,
          academic_year_id: yearId,
          semester: semesterNum,
        });
        setSessions(Array.isArray(res.data) ? res.data : []);
      } catch {
        setSessions([]);
      } finally {
        setSessionsLoading(false);
      }
    };
    loadSessions();
  }, [selectedDateStr, yearId, semesterNum]);

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
    .filter((e) => e.day_of_week === selectedDayIndex)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const entriesByDay = DAY_NAMES.map((_, i) =>
    entries
      .filter((e) => e.day_of_week === i)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  );

  // Merge timetable entries with session data
  const enrichedEntries = useMemo(() => {
    return todayEntries.map((entry) => {
      const session = sessions.find(
        (s) =>
          s.subject_code === entry.subject_code &&
          s.start_time === entry.start_time.substring(0, 5)
      );
      return { entry, session };
    });
  }, [todayEntries, sessions]);

  // Extra sessions not in base timetable
  const extraSessions = useMemo(() => {
    return sessions.filter(
      (s) =>
        s.session_status === "extra" &&
        !todayEntries.some(
          (e) =>
            e.subject_code === s.subject_code &&
            e.start_time.substring(0, 5) === s.start_time
        )
    );
  }, [sessions, todayEntries]);

  const isToday = selectedDateStr === todayStr;

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
              viewMode === "today"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            )}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
              viewMode === "week"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
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
          {/* Date Navigator */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">
                {DAY_FULL[selectedDayIndex]}
              </p>
              <p className="text-[10px] text-gray-500">
                {formatDate(selectedDate.toISOString())}
                {isToday && (
                  <span className="text-teal-600 font-medium ml-1">Today</span>
                )}
              </p>
            </div>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Quick jump to today */}
          {!isToday && (
            <button
              onClick={() => setSelectedDate(new Date())}
              className="w-full mb-3 text-xs text-teal-600 hover:text-teal-700 font-medium py-1.5 bg-teal-50 rounded-xl transition-colors"
            >
              Jump to Today
            </button>
          )}

          {todayEntries.length === 0 && extraSessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <p className="text-gray-500 text-sm">No classes scheduled</p>
            </div>
          ) : (
            <div className="space-y-2">
              {enrichedEntries.map(({ entry, session }, i) => (
                <SessionCard
                  key={`entry-${i}`}
                  entry={entry}
                  session={session}
                  colorClass={
                    subjectColors.get(entry.subject_code) || COLORS[0]
                  }
                  isExpanded={expandedSession === i}
                  onToggle={() =>
                    setExpandedSession(expandedSession === i ? null : i)
                  }
                  sessionsLoading={sessionsLoading}
                />
              ))}
              {/* Extra sessions */}
              {extraSessions.map((session, i) => (
                <SessionCard
                  key={`extra-${i}`}
                  entry={{
                    day_of_week: session.day_of_week,
                    start_time: session.start_time,
                    end_time: session.end_time,
                    subject_name: session.subject_name || "Extra Class",
                    subject_code: session.subject_code || "",
                    section_code: session.section_code,
                    faculty_name: session.faculty_name,
                    room_code: session.room_code,
                    slot_type: session.slot_type,
                  }}
                  session={session}
                  colorClass="bg-purple-50 border-purple-200 text-purple-800"
                  isExpanded={
                    expandedSession === enrichedEntries.length + i
                  }
                  onToggle={() =>
                    setExpandedSession(
                      expandedSession === enrichedEntries.length + i
                        ? null
                        : enrichedEntries.length + i
                    )
                  }
                  sessionsLoading={sessionsLoading}
                />
              ))}
            </div>
          )}

          {/* Session Status Legend */}
          <div className="bg-gray-50 rounded-2xl px-4 py-3 mt-4">
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">
              Status Legend
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5">
              {Object.entries(SESSION_STATUS_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <span
                    key={key}
                    className="flex items-center gap-1 text-[11px] text-gray-600"
                  >
                    <Icon className={cn("h-3 w-3", cfg.color)} />
                    {cfg.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Week view */
        <div className="space-y-4 overflow-x-auto">
          {entriesByDay.map((dayEntries, dayIdx) => {
            if (dayEntries.length === 0) return null;
            return (
              <div key={dayIdx}>
                <p
                  className={cn(
                    "text-sm font-semibold mb-2",
                    dayIdx === todayIndex
                      ? "text-teal-600"
                      : "text-gray-700"
                  )}
                >
                  {DAY_FULL[dayIdx]}
                  {dayIdx === todayIndex && (
                    <span className="text-[10px] text-teal-500 ml-2 font-normal">
                      Today
                    </span>
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
                      <span className="font-semibold truncate flex-1">
                        {entry.subject_name}
                      </span>
                      {entry.room_code && (
                        <span className="opacity-70 shrink-0">
                          {entry.room_code}
                        </span>
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

// ==================== Session Card Component ====================

function SessionCard({
  entry,
  session,
  colorClass,
  isExpanded,
  onToggle,
  sessionsLoading,
}: {
  entry: TimetableEntry;
  session?: StudentSessionItem;
  colorClass: string;
  isExpanded: boolean;
  onToggle: () => void;
  sessionsLoading: boolean;
}) {
  const status = session?.session_status || "upcoming";
  const statusCfg = SESSION_STATUS_CONFIG[status] || SESSION_STATUS_CONFIG.upcoming;
  const StatusIcon = statusCfg.icon;
  const isCancelled = status === "cancelled";
  const attendanceCfg = session?.attendance_status
    ? ATTENDANCE_STATUS_CONFIG[session.attendance_status]
    : null;

  const hasNotes = session?.notes && session.notes.length > 0;
  const hasTopic = session?.topic_covered;
  const hasDetails = hasNotes || hasTopic || session?.override_type;

  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden animate-fade-in-up transition-all",
        isCancelled ? "bg-gray-50 border-gray-200 opacity-75" : colorClass
      )}
    >
      {/* Main Card */}
      <button
        onClick={onToggle}
        className="w-full p-4 text-left"
        disabled={!hasDetails && !sessionsLoading}
      >
        <div className="flex items-start justify-between">
          <div className={cn("flex-1 min-w-0", isCancelled && "line-through opacity-60")}>
            <p className="text-sm font-bold">{entry.subject_name}</p>
            <p className="text-xs font-mono opacity-70">{entry.subject_code}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {/* Session Status Badge */}
            <span
              className={cn(
                "flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border",
                statusCfg.bgColor,
                statusCfg.color
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {statusCfg.label}
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs opacity-70">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {entry.start_time.substring(0, 5)} - {entry.end_time.substring(0, 5)}
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
          {entry.slot_type && entry.slot_type !== "LECTURE" && (
            <span className="font-medium opacity-80">{entry.slot_type}</span>
          )}
        </div>

        {/* Attendance Status + Note indicator */}
        <div className="flex items-center gap-2 mt-2">
          {attendanceCfg && (
            <span
              className={cn(
                "text-[10px] font-semibold px-2 py-0.5 rounded-md",
                attendanceCfg.bgColor,
                attendanceCfg.color
              )}
            >
              {attendanceCfg.label}
            </span>
          )}
          {hasNotes && (
            <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
              <FileText className="h-3 w-3" />
              {session!.notes.length} note{session!.notes.length > 1 ? "s" : ""}
            </span>
          )}
          {session?.override_reason_text && isCancelled && (
            <span className="text-[10px] text-red-500 italic truncate">
              {session.override_reason_text}
            </span>
          )}
          {hasDetails && (
            <div className="ml-auto">
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              )}
            </div>
          )}
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && hasDetails && (
        <div className="px-4 pb-4 space-y-3 border-t border-black/5 pt-3 animate-fade-in-up">
          {/* Topic Covered */}
          {hasTopic && (
            <div className="flex items-start gap-2">
              <BookOpen className="h-3.5 w-3.5 text-gray-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                  Topic Covered
                </p>
                <p className="text-xs text-gray-800 mt-0.5">
                  {session!.topic_covered}
                </p>
              </div>
            </div>
          )}

          {/* Override Info */}
          {session?.override_type && (
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                  {session.override_type === "CANCEL"
                    ? "Cancellation"
                    : session.override_type === "RESCHEDULE"
                    ? "Rescheduled"
                    : "Extra Class"}
                </p>
                <p className="text-xs text-gray-800 mt-0.5">
                  {session.override_reason?.replace(/_/g, " ")}
                  {session.override_reason_text &&
                    ` - ${session.override_reason_text}`}
                </p>
              </div>
            </div>
          )}

          {/* Session Notes */}
          {hasNotes && (
            <div className="space-y-2">
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Notes from Faculty
              </p>
              {session!.notes.map((note) => {
                const noteCfg =
                  NOTE_TYPE_CONFIG[note.note_type] || NOTE_TYPE_CONFIG.GENERAL;
                const NoteIcon = noteCfg.icon;
                return (
                  <div
                    key={note.id}
                    className="bg-white/60 rounded-xl px-3 py-2.5 border border-black/5"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <NoteIcon
                        className={cn("h-3 w-3", noteCfg.color)}
                      />
                      <span
                        className={cn(
                          "text-[10px] font-semibold",
                          noteCfg.color
                        )}
                      >
                        {noteCfg.label}
                      </span>
                      {note.author_name && (
                        <span className="text-[10px] text-gray-400 ml-auto">
                          {note.author_name}
                        </span>
                      )}
                    </div>
                    {note.content && (
                      <p className="text-xs text-gray-700 whitespace-pre-wrap">
                        {note.content}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
