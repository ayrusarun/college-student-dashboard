"use client";

import { useState, useEffect, useCallback } from "react";
import { ClipboardList, BookOpen, Loader2 } from "lucide-react";
import { registrationApi } from "@/lib/api/client";
import { StudentEnrollment, SubjectOffering } from "@/lib/types";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ListSkeleton } from "@/components/ui/Skeleton";

type Tab = "enrolled" | "available";

export default function EnrollmentPage() {
  const [tab, setTab] = useState<Tab>("enrolled");
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [offerings, setOfferings] = useState<SubjectOffering[]>([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [maxCredits, setMaxCredits] = useState<number | null>(null);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<StudentEnrollment | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "enrolled") {
        const res = await registrationApi.getMySubjects();
        const data = res.data;
        if (data && data.enrollments) {
          setEnrollments(data.enrollments);
          setTotalCredits(data.total_credits || 0);
          setMaxCredits(data.max_credits_per_semester || null);
          setEnrolledCount(data.enrolled_count || 0);
        } else {
          setEnrollments(Array.isArray(data) ? data : []);
        }
      } else {
        const res = await registrationApi.getAvailable();
        setOfferings(Array.isArray(res.data) ? res.data : []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEnroll = async (offeringId: number, sectionId?: number) => {
    setEnrolling(offeringId);
    setError("");
    try {
      await registrationApi.enroll({ offering_id: offeringId, section_id: sectionId });
      setSuccess("Successfully enrolled!");
      setTimeout(() => setSuccess(""), 3000);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to enroll");
    } finally {
      setEnrolling(null);
    }
  };

  const handleDrop = async () => {
    if (!dropTarget) return;
    setError("");
    try {
      await registrationApi.drop(dropTarget.id);
      setDropTarget(null);
      setSuccess("Subject dropped successfully");
      setTimeout(() => setSuccess(""), 3000);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to drop");
      setDropTarget(null);
    }
  };

  return (
    <div className="space-y-4 py-4">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
        <ClipboardList className="h-6 w-6 text-teal-600" />
        Enrollment
      </h1>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setTab("enrolled")}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
            tab === "enrolled" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          )}
        >
          My Subjects
        </button>
        <button
          onClick={() => setTab("available")}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
            tab === "available" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          )}
        >
          Available
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
          {success}
        </div>
      )}

      {/* Credits Summary */}
      {tab === "enrolled" && !loading && enrollments.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Credits</p>
              <p className="text-2xl font-bold text-gray-900">{totalCredits}</p>
            </div>
            {maxCredits && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Max Allowed</p>
                <p className="text-2xl font-bold text-gray-400">{maxCredits}</p>
              </div>
            )}
            <div className="text-right">
              <p className="text-xs text-gray-500">Subjects</p>
              <p className="text-2xl font-bold text-teal-600">{enrolledCount}</p>
            </div>
          </div>
          {maxCredits && (
            <div className="mt-3">
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all",
                    totalCredits > maxCredits ? "bg-red-500" : totalCredits / maxCredits > 0.8 ? "bg-amber-500" : "bg-teal-500"
                  )}
                  style={{ width: `${Math.min((totalCredits / maxCredits) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                {totalCredits}/{maxCredits} credits used
                {totalCredits > maxCredits && " — exceeds limit!"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <ListSkeleton count={3} />
      ) : tab === "enrolled" ? (
        enrollments.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No subjects enrolled"
            description="You haven't enrolled in any subjects yet. Check the Available tab to browse offerings."
          />
        ) : (
          <div className="space-y-3">
            {enrollments.map((e) => (
              <div key={e.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm animate-fade-in-up">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">
                        {e.subject_code}
                      </span>
                      <StatusBadge status={e.enrollment_status} />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{e.subject_name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      {e.section_code && <span>Section: {e.section_code}</span>}
                      {e.credits != null && <span>{e.credits} credits</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                    {e.credits != null && (
                      <span className="text-lg font-bold text-teal-600">{e.credits}</span>
                    )}
                    {(e.enrollment_status === "ENROLLED" || e.enrollment_status === "WAITLISTED") && (
                      <button
                        onClick={() => setDropTarget(e)}
                        className="text-[10px] text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
                      >
                        Drop
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        offerings.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No offerings available"
            description="There are no subject offerings available for enrollment at this time."
          />
        ) : (
          <div className="space-y-3">
            {offerings.map((o) => {
              const isFull = o.current_enrollment >= o.total_capacity;
              return (
                <div key={o.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm animate-fade-in-up">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">
                          {o.subject_code}
                        </span>
                        {o.subject_category && (
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded font-medium",
                            ["PE", "OE", "ELECTIVE", "OPEN_ELECTIVE"].includes(o.subject_category)
                              ? "bg-purple-50 text-purple-600"
                              : "bg-blue-50 text-blue-600"
                          )}>
                            {o.subject_category}
                          </span>
                        )}
                        {o.subject_type && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-gray-50 text-gray-500">
                            {o.subject_type}
                          </span>
                        )}
                        {o.elective_group_name && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-amber-50 text-amber-600">
                            {o.elective_group_name}
                          </span>
                        )}
                        {isFull && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-red-50 text-red-600">FULL</span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">{o.subject_name}</h3>
                    </div>
                    {o.subject_credits != null && (
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-lg font-bold text-teal-600">{o.subject_credits}</p>
                        <p className="text-[10px] text-gray-400">credits</p>
                      </div>
                    )}
                  </div>

                  {/* Capacity bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                      <span>{o.current_enrollment} enrolled</span>
                      <span>{o.total_capacity} capacity</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          isFull ? "bg-red-500" : o.current_enrollment / o.total_capacity > 0.8 ? "bg-amber-500" : "bg-teal-500"
                        )}
                        style={{ width: `${Math.min((o.current_enrollment / o.total_capacity) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Sections */}
                  {o.sections && o.sections.length > 0 ? (
                    <div className="space-y-2">
                      {o.sections.map((s) => (
                        <div key={s.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-900">{s.section_code}</span>
                              <span className="text-[10px] text-gray-400">
                                {s.current_enrollment}/{s.capacity} seats
                              </span>
                            </div>
                            {s.faculty_name && (
                              <p className="text-[11px] text-gray-500 mt-0.5">Faculty: {s.faculty_name}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleEnroll(o.id, s.id)}
                            disabled={isFull || s.current_enrollment >= s.capacity || enrolling === o.id}
                            className="text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg disabled:opacity-40 transition-all active:scale-[0.98]"
                          >
                            {enrolling === o.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Enroll"}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEnroll(o.id)}
                      disabled={isFull || enrolling === o.id}
                      className="w-full text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 px-4 py-2.5 rounded-xl disabled:opacity-40 transition-all active:scale-[0.98]"
                    >
                      {enrolling === o.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      ) : isFull ? (
                        "Full"
                      ) : (
                        "Enroll"
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Drop confirmation */}
      <ConfirmDialog
        isOpen={!!dropTarget}
        title="Drop Subject"
        message={`Are you sure you want to drop ${dropTarget?.subject_name || "this subject"}? This action may not be reversible after the drop deadline.`}
        confirmText="Drop"
        onConfirm={handleDrop}
        onClose={() => setDropTarget(null)}
        variant="danger"
      />
    </div>
  );
}
