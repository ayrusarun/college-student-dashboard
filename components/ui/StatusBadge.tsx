import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  ENROLLED: "bg-green-100 text-green-700 border-green-200",
  WAITLISTED: "bg-amber-100 text-amber-700 border-amber-200",
  DROPPED: "bg-red-100 text-red-700 border-red-200",
  COMPLETED: "bg-blue-100 text-blue-700 border-blue-200",
  FAILED: "bg-red-100 text-red-700 border-red-200",
  OPEN: "bg-green-100 text-green-700 border-green-200",
  CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
  ANNOUNCEMENT: "bg-blue-100 text-blue-700 border-blue-200",
  IMPORTANT: "bg-red-100 text-red-700 border-red-200",
  GENERAL: "bg-gray-100 text-gray-600 border-gray-200",
  INFO: "bg-cyan-100 text-cyan-700 border-cyan-200",
  EVENTS: "bg-purple-100 text-purple-700 border-purple-200",
  // Attendance statuses
  PRESENT: "bg-emerald-100 text-emerald-700 border-emerald-200",
  ABSENT: "bg-red-100 text-red-700 border-red-200",
  LATE: "bg-amber-100 text-amber-700 border-amber-200",
  EXCUSED: "bg-blue-100 text-blue-700 border-blue-200",
  ON_DUTY: "bg-purple-100 text-purple-700 border-purple-200",
  MEDICAL_LEAVE: "bg-pink-100 text-pink-700 border-pink-200",
  // Session statuses
  SUBMITTED: "bg-green-100 text-green-700 border-green-200",
  DRAFT: "bg-gray-100 text-gray-600 border-gray-200",
  LOCKED: "bg-blue-100 text-blue-700 border-blue-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status] || "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-md border uppercase tracking-wide",
      colors,
      className
    )}>
      {status}
    </span>
  );
}
