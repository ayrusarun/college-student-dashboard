"use client";

import { useState, useEffect } from "react";
import { Bell, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { alertApi } from "@/lib/api/client";
import { getInitials } from "@/lib/utils";

export default function Header() {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <>
      <header className="h-14 md:h-16 fixed top-0 left-0 md:left-56 right-0 z-30 bg-white border-b border-gray-200">
        <div className="h-full px-4 md:px-6 flex items-center justify-between">
          {/* Left: College name */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200">
              {user?.college_name || "College"}
            </span>
          </div>

          {/* Right: Notification + User */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4.5 min-w-4.5 px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* User avatar */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.full_name ? getInitials(user.full_name) : "?"}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700 max-w-32 truncate">
                {user?.full_name || "Student"}
              </span>
            </div>

            {/* Logout (desktop only) */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="hidden md:flex p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Logout confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-scale-in">
            <div className="p-6 text-center">
              <div className="bg-red-100 p-3 rounded-full inline-flex mb-4">
                <LogOut className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Sign Out?</h3>
              <p className="text-sm text-gray-600">Are you sure you want to sign out of the student portal?</p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
