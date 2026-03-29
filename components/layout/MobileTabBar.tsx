"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { studentNavigation } from "@/lib/config/navigation";
import { cn } from "@/lib/utils";

interface MobileTabBarProps {
  unreadCount?: number;
}

export default function MobileTabBar({ unreadCount = 0 }: MobileTabBarProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-bottom">
      <div className="grid grid-cols-6 h-16">
        {studentNavigation.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          const showBadge = item.name === "Announcements" && unreadCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-colors relative",
                isActive
                  ? "text-teal-600"
                  : "text-gray-400 active:text-gray-600"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 h-4 min-w-4 px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                isActive ? "text-teal-600" : "text-gray-400"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
