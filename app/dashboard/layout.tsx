"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/lib/auth/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileTabBar from "@/components/layout/MobileTabBar";
import { alertApi } from "@/lib/api/client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await alertApi.getUnreadCount();
        setUnreadCount(res.data?.unread_count || 0);
      } catch {
        // ignore
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="md:ml-56 transition-all duration-300">
          <Header />
          <main className="pt-14 md:pt-16 pb-20 md:pb-6 px-4 md:px-6">
            {children}
          </main>
        </div>

        {/* Mobile bottom tab bar */}
        <div className="md:hidden">
          <MobileTabBar unreadCount={unreadCount} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
