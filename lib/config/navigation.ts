import { Home, ClipboardList, CalendarClock, Bell, UserCircle } from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: any;
}

export const studentNavigation: NavItem[] = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Enrollment", href: "/dashboard/enrollment", icon: ClipboardList },
  { name: "Timetable", href: "/dashboard/timetable", icon: CalendarClock },
  { name: "Announcements", href: "/dashboard/announcements", icon: Bell },
  { name: "Profile", href: "/dashboard/profile", icon: UserCircle },
];
