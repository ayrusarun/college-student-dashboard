"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, BookOpen, CalendarClock, Bell, Clock, MapPin, ArrowRight, BarChart3 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { registrationApi, timetableApi, postApi, academicApi, alertApi, attendanceApi } from "@/lib/api/client";
import { TimetableEntry, Post, StudentSubjectAttendance } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardHome() {
  const { user } = useAuth();
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [attendancePct, setAttendancePct] = useState<number | null>(null);
  const [todayEntries, setTodayEntries] = useState<TimetableEntry[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;

  useEffect(() => {
    const load = async () => {
      try {
        const [enrollRes, alertRes, postsRes] = await Promise.all([
          registrationApi.getMySubjects().catch(() => ({ data: [] })),
          alertApi.getUnreadCount().catch(() => ({ data: { unread_count: 0 } })),
          postApi.list({ limit: 3 }).catch(() => ({ data: [] })),
        ]);

        const enrollments = Array.isArray(enrollRes.data) ? enrollRes.data : [];
        setEnrolledCount(enrollments.filter((e: any) => e.enrollment_status === "ENROLLED").length);
        setUnreadCount(alertRes.data?.unread_count || 0);
        const posts = Array.isArray(postsRes.data) ? postsRes.data : postsRes.data?.items || [];
        setRecentPosts(posts.slice(0, 3));

        // Load today's timetable + attendance
        try {
          const yearRes = await academicApi.getCurrentYear();
          const year = yearRes.data;
          if (year) {
            const semRes = await academicApi.listSemesters(year.id);
            const semesters = Array.isArray(semRes.data) ? semRes.data : semRes.data?.items || [];
            const currentSem = semesters.find((s: any) => s.is_current);
            if (currentSem) {
              const [ttRes, attRes] = await Promise.all([
                timetableApi.getMyTimetable({
                  academic_year_id: year.id,
                  semester: currentSem.semester_number,
                }),
                attendanceApi.getMyAttendance({
                  academic_year_id: year.id,
                  semester: currentSem.semester_number,
                }).catch(() => ({ data: [] })),
              ]);
              const entries = ttRes.data?.entries || [];
              setTodayEntries(
                entries.filter((e: TimetableEntry) => e.day_of_week === todayIndex)
                  .sort((a: TimetableEntry, b: TimetableEntry) => a.start_time.localeCompare(b.start_time))
              );

              // Compute overall attendance
              const attData: StudentSubjectAttendance[] = Array.isArray(attRes.data) ? attRes.data : [];
              const withSessions = attData.filter((d) => d.sessions_held > 0);
              if (withSessions.length > 0) {
                const avgPct = withSessions.reduce((s, d) => s + d.percentage, 0) / withSessions.length;
                setAttendancePct(Math.round(avgPct * 10) / 10);
              }
            }
          }
        } catch {
          // no timetable
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [todayIndex]);

  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-5 py-4">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-5 text-white">
        <p className="text-teal-100 text-sm">{greeting()}</p>
        <h1 className="text-xl font-bold mt-0.5">{user?.full_name || "Student"}</h1>
        <p className="text-teal-200 text-xs mt-1">
          {formatDate(today)} &middot; {user?.program_name || user?.cohort_name || ""}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/dashboard/enrollment" className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm hover:shadow transition-all">
          <BookOpen className="h-5 w-5 text-teal-600 mx-auto mb-1" />
          {loading ? <Skeleton className="h-6 w-8 mx-auto" /> : <p className="text-lg font-bold text-gray-900">{enrolledCount}</p>}
          <p className="text-[10px] text-gray-500">Enrolled</p>
        </Link>
        <Link href="/dashboard/attendance" className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm hover:shadow transition-all">
          <BarChart3 className={cn("h-5 w-5 mx-auto mb-1", attendancePct !== null && attendancePct < 75 ? "text-red-500" : "text-emerald-600")} />
          {loading ? <Skeleton className="h-6 w-8 mx-auto" /> : <p className={cn("text-lg font-bold", attendancePct !== null && attendancePct < 75 ? "text-red-600" : "text-gray-900")}>{attendancePct !== null ? `${attendancePct}%` : "-"}</p>}
          <p className="text-[10px] text-gray-500">Attendance</p>
        </Link>
        <Link href="/dashboard/announcements" className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm hover:shadow transition-all">
          <Bell className="h-5 w-5 text-amber-600 mx-auto mb-1" />
          {loading ? <Skeleton className="h-6 w-8 mx-auto" /> : <p className="text-lg font-bold text-gray-900">{unreadCount}</p>}
          <p className="text-[10px] text-gray-500">Unread</p>
        </Link>
      </div>

      {/* Today's Schedule */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-teal-600" />
            Today&apos;s Schedule
          </h2>
          <Link href="/dashboard/timetable" className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-0.5">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : todayEntries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <p className="text-sm text-gray-400">No classes today</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayEntries.slice(0, 4).map((entry, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
                <div className="text-center shrink-0 w-12">
                  <p className="text-xs font-bold text-teal-600">{entry.start_time}</p>
                  <p className="text-[10px] text-gray-400">{entry.end_time}</p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{entry.subject_name}</p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-2">
                    {entry.room_code && <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{entry.room_code}</span>}
                    {entry.faculty_name && <span>{entry.faculty_name}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Announcements */}
      {recentPosts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-amber-600" />
              Recent Announcements
            </h2>
            <Link href="/dashboard/announcements" className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-0.5">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={post.post_type} />
                  <span className="text-[10px] text-gray-400">{formatDate(post.created_at)}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 line-clamp-1">{post.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
