export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  roles: string[];
  permissions?: string[];
  is_active: boolean;
  phone_number?: string;
  country_code?: string;
  roll_number?: string;
  college?: { id: number; name: string; slug: string };
  college_id?: number;
  college_name?: string;
  department?: { id: number; name: string; code: string };
  department_id?: number;
  program_id?: number;
  program_name?: string;
  program_code?: string;
  cohort_id?: number;
  cohort_name?: string;
  cohort_code?: string;
  cohort_admission_year?: number;
  class_id?: number;
  class_section?: string;
  class_section_name?: string;
  year_of_study?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_id: number;
  college_id: number;
  college_slug: string;
  roles: string[];
}

export interface StudentEnrollment {
  id: number;
  college_id: number;
  student_id: number;
  offering_id: number;
  section_id?: number;
  enrollment_status: string;
  enrolled_at: string;
  dropped_at?: string;
  grade?: string;
  is_retake: boolean;
  preference_rank?: number;
  student_name?: string;
  student_email?: string;
  subject_code?: string;
  subject_name?: string;
  section_code?: string;
  credits?: number;
}

export interface OfferingSection {
  id: number;
  offering_id: number;
  section_code: string;
  faculty_id?: number;
  faculty_name?: string;
  capacity: number;
  current_enrollment: number;
  is_active: boolean;
}

export interface SubjectOffering {
  id: number;
  college_id: number;
  subject_id: number;
  academic_year_id: number;
  semester: number;
  academic_semester_id?: number;
  cohort_id?: number;
  total_capacity: number;
  current_enrollment: number;
  enrollment_status: string;
  subject_name?: string;
  subject_code?: string;
  subject_credits?: number;
  subject_type?: string;
  subject_category?: string;
  elective_group_name?: string;
  cohort_name?: string;
  sections?: OfferingSection[];
}

export interface TimetableEntry {
  day_of_week: number;
  start_time: string;
  end_time: string;
  subject_name: string;
  subject_code: string;
  section_code?: string;
  faculty_name?: string;
  room_code?: string;
  room_name?: string;
  slot_type?: string;
}

export interface WeeklyTimetable {
  entity_type: string;
  entity_id: number;
  entity_name: string;
  academic_year?: string;
  semester?: number;
  entries: TimetableEntry[];
}

export interface Post {
  id: number;
  title: string;
  content: string;
  post_type: string;
  author_id: number;
  author_name?: string;
  college_id: number;
  target_group_id?: number;
  likes_count?: number;
  comments_count?: number;
  is_liked_by_me?: boolean;
  is_read_by_me?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: number;
  title: string;
  message: string;
  alert_type: string;
  is_read: boolean;
  created_at: string;
}

export interface AcademicYear {
  id: number;
  year: number;
  name: string;
  label?: string;
  code: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_current?: boolean;
  semesters?: AcademicSemester[];
}

export interface AcademicSemester {
  id: number;
  academic_year_id: number;
  semester_number: number;
  semester_type: string;
  label: string;
  start_date: string;
  end_date: string;
  status: string;
  is_current: boolean;
}

export interface RegistrationStatus {
  total_credits_registered: number;
  min_credits_allowed: number;
  max_credits_allowed: number;
  subjects_enrolled: number;
  can_register_more: boolean;
}
