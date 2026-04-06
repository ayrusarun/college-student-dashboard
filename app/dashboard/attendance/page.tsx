"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Stethoscope,
  Briefcase,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { attendanceApi, academicApi } from "@/lib/api/client";
import { StudentSubjectAttendance } from "@/lib/types";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";
import { ListSkeleton } from "@/components/ui/Skeleton";

const DANGER_THRESHOLD = 75;
const WARNING_THRESHOLD = 85;

function getAttendanceColor(pct: number) {
  if (pct >= WARNING_THRESHOLD) return "text-emerald-600";
  if (pct >= DANGER_THRESHOLD) return "text-amber-600";
  return "text-red-600";
}

function getProgressColor(pct: number) {
  if (pct >= WARNING_THRESHOLD) return "bg-emerald-500";
  if (pct >= DANGER_THRESHOLD) return "bg-amber-500";
  return "bg-red-500";
}

function getProgressTrack(pct: number) {
  if (pct >= WARNING_THRESHOLD) return "bg-emerald-100";
  if (pct >= DANGER_THRESHOLD) return "bg-amber-100";
  return "bg-red-100";
}

export default function AttendancePage() {
  const [data, setData] = useState<StudentSubjectAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const yearRes = await academicApi.getCurrentYear();
        const year = yearRes.data;
        if (!year) return;

        const semRes = await academicApi.listSemesters(year.id);
        const semesters = Array.isArray(semRes.data) ? semRes.data : semRes.data?.items || [];
        const currentSem = semesters.find((s: any) => s.is_current);
        if (!currentSem) return;

        const res = await attendanceApi.getMyAttendance({
          academic_year_id: year.id,
          semester: currentSem.semester_number,
        });
        setData(Array.isArray(res.data) ? res.data : []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Overall stats
  const overallStats = useMemo(() => {
    const withSessions = data.filter((d) => d.sessions_held > 0);
    if (withSessions.length === 0)
      return { percentage: 0, effective: 0, totalHeld: 0, totalPresent: 0, subjects: 0, defaulters: 0 };

    const totalHeld = withSessions.reduce((s, d) => s + d.sessions_held, 0);
    const totalPresent = withSessions.reduce((s, d) => s + d.sessions_present, 0);
    const avgPct = withSessions.reduce((s, d) => s + d.percentage, 0) / withSessions.length;
    const avgEff = withSessions.reduce((s, d) => s + d.effective_percentage, 0) / withSessions.length;
    const defaulters = withSessions.filter((d) => d.percentage < DANGER_THRESHOLD).length;

    return {
      percentage: avgPct,
      effective: avgEff,
      totalHeld,
      totalPresent,
      subjects: withSessions.length,
      defaulters,
    };
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-teal-600" />
          Attendance
        </h1>
        <ListSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-teal-600" />
        Attendance
      </h1>

      {data.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No attendance data"
          description="Attendance records will appear here once your classes begin."
        />
      ) : (
        <>
          {/* Overall Summary Card */}
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-xs">Overall Attendance</p>
                <p className="text-3xl font-bold mt-0.5">
                  {overallStats.percentage.toFixed(1)}%
                </p>
                {overallStats.effective > overallStats.percentage && (
                  <p className="text-teal-200 text-xs mt-0.5">
                    Effective: {overallStats.effective.toFixed(1)}%
                  </p>
                )}
              </div>
              <div className="text-right text-sm space-y-1">
                <p className="text-teal-100">
                  <span className="font-bold text-white">{overallStats.subjects}</span> subjects
                </p>
                <p className="text-teal-100">
                  <span className="font-bold text-white">{overallStats.totalPresent}</span> /{" "}
                  {overallStats.totalHeld} sessions
                </p>
              </div>
            </div>
            {overallStats.defaulters > 0 && (
              <div className="mt-3 bg-white/15 rounded-xl px-3 py-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-300 shrink-0" />
                <p className="text-xs text-teal-50">
                  Below {DANGER_THRESHOLD}% in{" "}
                  <span className="font-bold text-white">{overallStats.defaulters}</span> subject
                  {overallStats.defaulters > 1 ? "s" : ""}. Risk of being marked as defaulter.
                </p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">
                {data.reduce((s, d) => s + d.sessions_present, 0)}
              </p>
              <p className="text-[10px] text-gray-500">Present</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm">
              <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">
                {data.reduce((s, d) => s + d.sessions_absent, 0)}
              </p>
              <p className="text-[10px] text-gray-500">Absent</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm">
              <Clock className="h-5 w-5 text-amber-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">
                {data.reduce((s, d) => s + d.sessions_late, 0)}
              </p>
              <p className="text-[10px] text-gray-500">Late</p>
            </div>
          </div>

          {/* Subject-wise Breakdown */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Subject-wise Breakdown</h2>
            <div className="space-y-2">
              {data.map((subject) => {
                const isExpanded = expandedSubject === subject.offering_id;
                const pct = subject.percentage;
                const isBelowThreshold = pct < DANGER_THRESHOLD && subject.sessions_held > 0;

                return (
                  <div
                    key={subject.offering_id}
                    className={cn(
                      "bg-white rounded-2xl border shadow-sm overflow-hidden transition-all",
                      isBelowThreshold ? "border-red-200" : "border-gray-100"
                    )}
                  >
                    {/* Subject Header */}
                    <button
                      onClick={() =>
                        setExpandedSubject(isExpanded ? null : subject.offering_id)
                      }
                      className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {subject.subject_name || "Unknown Subject"}
                          </p>
                          {isBelowThreshold && (
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                          {subject.subject_code}
                        </p>
                        {/* Progress bar */}
                        <div className="mt-2 flex items-center gap-2">
                          <div
                            className={cn(
                              "flex-1 h-1.5 rounded-full",
                              getProgressTrack(pct)
                            )}
                          >
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                getProgressColor(pct)
                              )}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span
                            className={cn(
                              "text-xs font-bold tabular-nums w-12 text-right",
                              getAttendanceColor(pct)
                            )}
                          >
                            {subject.sessions_held > 0
                              ? `${pct.toFixed(1)}%`
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                      )}
                    </button>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-50 animate-fade-in-up">
                        <div className="pt-3 space-y-3">
                          {/* Counts Grid */}
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-gray-50 rounded-xl py-2 px-1">
                              <p className="text-lg font-bold text-gray-900">
                                {subject.sessions_held}
                              </p>
                              <p className="text-[10px] text-gray-500">Total</p>
                            </div>
                            <div className="bg-emerald-50 rounded-xl py-2 px-1">
                              <p className="text-lg font-bold text-emerald-700">
                                {subject.sessions_present}
                              </p>
                              <p className="text-[10px] text-emerald-600">Present</p>
                            </div>
                            <div className="bg-red-50 rounded-xl py-2 px-1">
                              <p className="text-lg font-bold text-red-700">
                                {subject.sessions_absent}
                              </p>
                              <p className="text-[10px] text-red-600">Absent</p>
                            </div>
                          </div>

                          {/* Additional statuses */}
                          <div className="flex flex-wrap gap-2">
                            {subject.sessions_late > 0 && (
                              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 rounded-lg px-2.5 py-1.5 text-xs">
                                <Clock className="h-3 w-3" />
                                <span className="font-medium">{subject.sessions_late}</span>
                                <span className="text-amber-600">Late</span>
                              </div>
                            )}
                            {subject.sessions_excused > 0 && (
                              <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-lg px-2.5 py-1.5 text-xs">
                                <Shield className="h-3 w-3" />
                                <span className="font-medium">{subject.sessions_excused}</span>
                                <span className="text-blue-600">Excused</span>
                              </div>
                            )}
                            {subject.sessions_on_duty > 0 && (
                              <div className="flex items-center gap-1.5 bg-purple-50 text-purple-700 rounded-lg px-2.5 py-1.5 text-xs">
                                <Briefcase className="h-3 w-3" />
                                <span className="font-medium">{subject.sessions_on_duty}</span>
                                <span className="text-purple-600">On Duty</span>
                              </div>
                            )}
                            {subject.sessions_medical > 0 && (
                              <div className="flex items-center gap-1.5 bg-pink-50 text-pink-700 rounded-lg px-2.5 py-1.5 text-xs">
                                <Stethoscope className="h-3 w-3" />
                                <span className="font-medium">{subject.sessions_medical}</span>
                                <span className="text-pink-600">Medical</span>
                              </div>
                            )}
                          </div>

                          {/* Effective vs Raw */}
                          {subject.effective_percentage > subject.percentage &&
                            subject.sessions_held > 0 && (
                              <div className="bg-blue-50 rounded-xl px-3 py-2 flex items-center gap-2">
                                <TrendingUp className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                <p className="text-xs text-blue-700">
                                  Effective attendance:{" "}
                                  <span className="font-bold">
                                    {subject.effective_percentage.toFixed(1)}%
                                  </span>{" "}
                                  (includes excused, on-duty & medical)
                                </p>
                              </div>
                            )}

                          {/* Shortfall Warning */}
                          {isBelowThreshold && (
                            <div className="bg-red-50 rounded-xl px-3 py-2 flex items-center gap-2">
                              <TrendingDown className="h-3.5 w-3.5 text-red-600 shrink-0" />
                              <p className="text-xs text-red-700">
                                Need{" "}
                                <span className="font-bold">
                                  {Math.ceil(
                                    (DANGER_THRESHOLD * subject.sessions_held -
                                      100 * subject.sessions_present) /
                                      (100 - DANGER_THRESHOLD)
                                  )}
                                </span>{" "}
                                more consecutive sessions to reach {DANGER_THRESHOLD}%
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-gray-50 rounded-2xl px-4 py-3">
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">
              Legend
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-600">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> &ge; {WARNING_THRESHOLD}%
                Safe
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> {DANGER_THRESHOLD}-
                {WARNING_THRESHOLD}% Warning
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500" /> &lt; {DANGER_THRESHOLD}%
                Danger
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
