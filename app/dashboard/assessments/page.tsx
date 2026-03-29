"use client";

import { useState, useEffect } from "react";
import {
  PenLine,
  BookOpen,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  BarChart3,
  Calendar,
} from "lucide-react";
import { assessmentApi } from "@/lib/api/client";
import EmptyState from "@/components/ui/EmptyState";

interface MyAssignment {
  assignment_id: number;
  title: string;
  assignment_type: string;
  max_marks: number;
  marks_obtained: number | null;
  status: string;
  due_date: string | null;
}

interface MySubjectProgress {
  offering_section_id: number;
  subject_code: string | null;
  subject_name: string | null;
  section_code: string | null;
  faculty_name: string | null;
  total_assignments: number;
  graded_assignments: number;
  total_obtained: number;
  total_max: number;
  percentage: number | null;
  assignments: MyAssignment[];
}

interface MyProgressResponse {
  student_id: number;
  student_name: string | null;
  subjects: MySubjectProgress[];
}

const typeLabel: Record<string, string> = {
  ASSIGNMENT: "Assignment",
  QUIZ: "Quiz",
  MID_TERM: "Mid-Term",
  FINAL_EXAM: "Final Exam",
  LAB_TEST: "Lab Test",
  PROJECT: "Project",
  PRESENTATION: "Presentation",
  VIVA: "Viva",
  INTERNAL_TEST: "Internal Test",
  LAB_REPORT: "Lab Report",
  OTHER: "Other",
};

export default function AssessmentsPage() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<MyProgressResponse | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<number>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const res = await assessmentApi.getMyProgress();
        setProgress(res.data);
        // Auto-expand all subjects
        if (res.data?.subjects) {
          setExpandedSubjects(new Set(res.data.subjects.map((_: any, i: number) => i)));
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleSubject = (index: number) => {
    const next = new Set(expandedSubjects);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setExpandedSubjects(next);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "GRADED":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "NOT_SUBMITTED":
        return <Clock className="w-4 h-4 text-gray-400" />;
      case "LATE":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "ABSENT":
        return <Clock className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const percentageColor = (pct: number | null) => {
    if (pct === null) return "text-gray-400";
    if (pct >= 75) return "text-green-600";
    if (pct >= 50) return "text-amber-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!progress || progress.subjects.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 rounded-lg">
            <PenLine className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Assessments</h1>
            <p className="text-sm text-gray-500">View your assignment scores and progress</p>
          </div>
        </div>
        <EmptyState
          icon={BookOpen}
          title="No assessments yet"
          description="Your assessment scores will appear here once your faculty creates and grades assignments."
        />
      </div>
    );
  }

  // Overall stats
  const totalObtained = progress.subjects.reduce((s, sub) => s + sub.total_obtained, 0);
  const totalMax = progress.subjects.reduce((s, sub) => s + sub.total_max, 0);
  const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : null;
  const totalAssignments = progress.subjects.reduce((s, sub) => s + sub.total_assignments, 0);
  const totalGraded = progress.subjects.reduce((s, sub) => s + sub.graded_assignments, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-teal-50 rounded-lg">
          <PenLine className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Assessments</h1>
          <p className="text-sm text-gray-500">
            {progress.subjects.length} subject{progress.subjects.length !== 1 ? "s" : ""} this semester
          </p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-teal-500" />
            <span className="text-xs text-gray-500">Subjects</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{progress.subjects.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <PenLine className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500">Assignments</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalAssignments}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500">Graded</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalGraded}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-500">Overall</span>
          </div>
          <p className={`text-2xl font-bold ${percentageColor(overallPct)}`}>
            {overallPct !== null ? `${overallPct}%` : "-"}
          </p>
        </div>
      </div>

      {/* Subject Cards */}
      <div className="space-y-4">
        {progress.subjects.map((sub, idx) => (
          <div key={sub.offering_section_id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Subject Header */}
            <button
              onClick={() => toggleSubject(idx)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {sub.subject_code || "---"}
                    </span>
                    {sub.section_code && (
                      <span className="text-xs px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded">
                        Sec {sub.section_code}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mt-0.5">{sub.subject_name || "Unknown"}</h3>
                  {sub.faculty_name && (
                    <p className="text-xs text-gray-500">{sub.faculty_name}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`text-lg font-bold ${percentageColor(sub.percentage)}`}>
                    {sub.percentage !== null ? `${sub.percentage}%` : "-"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {sub.total_obtained}/{sub.total_max} marks
                  </p>
                </div>
                {expandedSubjects.has(idx) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Progress bar */}
            <div className="px-5">
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    (sub.percentage || 0) >= 75
                      ? "bg-green-500"
                      : (sub.percentage || 0) >= 50
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${sub.percentage || 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 mb-3">
                {sub.graded_assignments} of {sub.total_assignments} graded
              </p>
            </div>

            {/* Assignments List */}
            {expandedSubjects.has(idx) && (
              <div className="border-t border-gray-100">
                {sub.assignments.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-gray-400 text-center">
                    No assignments published yet
                  </p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {sub.assignments.map((a) => (
                      <div
                        key={a.assignment_id}
                        className="px-5 py-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {statusIcon(a.status)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{a.title}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                              <span className="px-1.5 py-0.5 bg-gray-100 rounded">
                                {typeLabel[a.assignment_type] || a.assignment_type}
                              </span>
                              {a.due_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(a.due_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          {a.status === "GRADED" ? (
                            <p className="text-sm font-semibold text-gray-900">
                              {a.marks_obtained}
                              <span className="text-gray-400 font-normal">/{a.max_marks}</span>
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400">
                              {a.status === "NOT_SUBMITTED" ? "Pending" : a.status.toLowerCase()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
