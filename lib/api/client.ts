import axios, { AxiosInstance } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: inject auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// ==================== AUTH API ====================
export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post("/auth/login", { username, password }),
  logout: () => apiClient.post("/auth/logout"),
  getCurrentUser: () => apiClient.get("/auth/me"),
};

// ==================== ACADEMIC API ====================
export const academicApi = {
  listYears: () => apiClient.get("/academic/years"),
  getCurrentYear: () => apiClient.get("/academic/years/current"),
  listSemesters: (yearId: number) =>
    apiClient.get(`/academic/years/${yearId}/semesters`),
};

// ==================== REGISTRATION API ====================
export const registrationApi = {
  getMySubjects: (params?: { academic_year_id?: number; semester?: number; enrollment_status?: string }) =>
    apiClient.get("/academic/registration/my-subjects", { params }),
  getAvailable: (params?: { academic_year_id?: number; semester?: number }) =>
    apiClient.get("/academic/registration/available", { params }),
  enroll: (data: { offering_id: number; section_id?: number }) =>
    apiClient.post("/academic/registration/enroll", data),
  drop: (enrollmentId: number) =>
    apiClient.post(`/academic/registration/drop/${enrollmentId}`),
  getStatus: (params: { academic_year_id: number; semester: number }) =>
    apiClient.get("/academic/registration/status", { params }),
};

// ==================== TIMETABLE API ====================
export const timetableApi = {
  getMyTimetable: (params: { academic_year_id: number; semester: number }) =>
    apiClient.get("/academic/timetable/me", { params }),
};

// ==================== POSTS API ====================
export const postApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    apiClient.get("/posts/", { params }),
  get: (postId: number) => apiClient.get(`/posts/${postId}`),
};

// ==================== ALERTS API ====================
export const alertApi = {
  list: (params?: { page?: number; page_size?: number; alert_type?: string }) =>
    apiClient.get("/alerts/", { params }),
  getUnreadCount: () => apiClient.get("/alerts/unread-count"),
};
