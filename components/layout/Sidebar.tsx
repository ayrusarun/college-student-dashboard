"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LogOut } from "lucide-react";
import { studentNavigation } from "@/lib/config/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-56 fixed left-0 top-0 bottom-0 bg-gray-900 text-white flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-teal-500/20 p-2 rounded-xl">
            <GraduationCap className="h-6 w-6 text-teal-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Yunite</h1>
            <p className="text-[10px] text-gray-400">Student Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {studentNavigation.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                  : "text-gray-400 hover:bg-gray-800/70 hover:text-white hover:translate-x-0.5"
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="mb-3">
          <p className="text-xs text-gray-400 truncate">{user?.college_name || "College"}</p>
          <p className="text-sm font-medium text-gray-200 truncate">{user?.full_name || "Student"}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
