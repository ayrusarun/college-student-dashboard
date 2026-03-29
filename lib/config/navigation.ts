import { Home, ClipboardList, CalendarClock, Bell, UserCircle, PenLine } from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: any;
}

export const studentNavigation: NavItem[] = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Enrollment", href: "/dashboard/enrollment", icon: ClipboardList },
  { name: "Assessments", href: "/dashboard/assessments", icon: PenLine },
  { name: "Timetable", href: "/dashboard/timetable", icon: CalendarClock },
  { name: "Announcements", href: "/dashboard/announcements", icon: Bell },
  { name: "Profile", href: "/dashboard/profile", icon: UserCircle },
];
