"use client";

import { UserCircle, Mail, Phone, Hash, Building2, GraduationCap, Users, Calendar } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-4 py-4 max-w-2xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
        <UserCircle className="h-6 w-6 text-teal-600" />
        Profile
      </h1>

      {/* Avatar Card */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 text-white text-center">
        <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
          {user?.full_name?.charAt(0) || "S"}
        </div>
        <h2 className="text-lg font-bold">{user?.full_name || "Student"}</h2>
        <p className="text-teal-200 text-sm">{user?.username}</p>
        {user?.roll_number && (
          <span className="inline-block mt-2 bg-white/20 px-3 py-1 rounded-full text-xs">
            {user.roll_number}
          </span>
        )}
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
        </div>
        <div className="px-4 divide-y divide-gray-50">
          <InfoRow icon={Mail} label="Email" value={user?.email} />
          <InfoRow icon={Phone} label="Phone" value={user?.phone_number} />
          <InfoRow icon={Hash} label="Roll Number" value={user?.roll_number} />
        </div>
      </div>

      {/* Academic Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Academic Information</h3>
        </div>
        <div className="px-4 divide-y divide-gray-50">
          <InfoRow icon={Building2} label="Department" value={user?.department?.name} />
          <InfoRow icon={GraduationCap} label="Program" value={user?.program_name ? `${user.program_name} (${user.program_code})` : undefined} />
          <InfoRow icon={Users} label="Cohort" value={user?.cohort_name} />
          <InfoRow icon={Users} label="Class / Section" value={user?.class_section_name || user?.class_section} />
          <InfoRow icon={Calendar} label="Year of Study" value={user?.year_of_study} />
          <InfoRow icon={Calendar} label="Admission Year" value={user?.cohort_admission_year} />
        </div>
      </div>

      {/* College Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">College</h3>
        </div>
        <div className="px-4 divide-y divide-gray-50">
          <InfoRow icon={Building2} label="College" value={user?.college_name || user?.college?.name} />
        </div>
      </div>
    </div>
  );
}
