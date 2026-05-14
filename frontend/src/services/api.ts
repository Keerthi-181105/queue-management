import axios, { AxiosResponse } from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Type Definitions
export interface Doctor {
  id: number;
  name: string;
  email: string;
  specialty: string;
  qualification: string;
  experience: number;
  rating: number;
  availability: boolean;
}

export interface Patient {
  id: number;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: string;
  pregnant?: boolean;
}

export interface QueueEntry {
  id: number;
  patient: Patient;
  doctor: Doctor;
  position?: number;
  status: "WAITING" | "NEXT" | "CALLED" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "URGENT";
  reason: string;
  emergency?: boolean;
  priorityReason?: string;
  estimatedWaitTime?: number;
  joinedAt?: string;
  calledAt?: string;
  completedAt?: string;
}

export interface CreateQueueEntry {
  patient: { id: number };
  doctor: { id: number };
  priority?: "LOW" | "MEDIUM" | "URGENT";
  reason: string;
  emergency?: boolean;
}

export interface Appointment {
  id: number;
  patient: Patient;
  doctor: Doctor;
  appointmentDate: string;
  appointmentTime: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  reason: string;
}

export interface CreateAppointment {
  patient: { id: number };
  doctor: { id: number };
  appointmentDate: string;
  appointmentTime: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  reason: string;
}

export interface Analytics {
  id: number;
  doctor?: Doctor;
  date: string;
  totalPatients: number;
  averageWaitTime: number;
  satisfactionScore: number;
  revenue: number;
  completedAppointments: number;
  efficiencyScore: number;
}

// API Response Types
type ApiResponse<T> = Promise<AxiosResponse<T>>;

// Doctor APIs
export const doctorAPI = {
  getAll: (): ApiResponse<Doctor[]> => api.get("/doctors"),
  getById: (id: number): ApiResponse<Doctor> => api.get(`/doctors/${id}`),
  getByEmail: (email: string): ApiResponse<Doctor> =>
    api.get(`/doctors/email/${email}`),
  getBySpecialty: (specialty: string): ApiResponse<Doctor[]> =>
    api.get(`/doctors/specialty/${specialty}`),
  create: (doctor: Partial<Doctor>): ApiResponse<Doctor> =>
    api.post("/doctors", doctor),
  update: (id: number, doctor: Partial<Doctor>): ApiResponse<Doctor> =>
    api.put(`/doctors/${id}`, doctor),
  delete: (id: number): ApiResponse<void> => api.delete(`/doctors/${id}`),
};

// Patient APIs
export const patientAPI = {
  getAll: (): ApiResponse<Patient[]> => api.get("/patients"),
  getById: (id: number): ApiResponse<Patient> => api.get(`/patients/${id}`),
  getByEmail: (email: string): ApiResponse<Patient> =>
    api.get(`/patients/email/${email}`),
  create: (patient: Partial<Patient>): ApiResponse<Patient> =>
    api.post("/patients", patient),
  update: (id: number, patient: Partial<Patient>): ApiResponse<Patient> =>
    api.put(`/patients/${id}`, patient),
  delete: (id: number): ApiResponse<void> => api.delete(`/patients/${id}`),
};

// Queue APIs
export const queueAPI = {
  getAll: (): ApiResponse<QueueEntry[]> => api.get("/queue"),
  getById: (id: number): ApiResponse<QueueEntry> => api.get(`/queue/${id}`),
  getByDoctor: (doctorId: number): ApiResponse<QueueEntry[]> =>
    api.get(`/queue/doctor/${doctorId}`),
  getActiveByDoctor: (doctorId: number): ApiResponse<QueueEntry[]> =>
    api.get(`/queue/doctor/${doctorId}/active`),
  getActiveByPatient: (patientId: number): ApiResponse<QueueEntry> =>
    api.get(`/queue/patient/${patientId}/active`),
  addToQueue: (queueEntry: CreateQueueEntry): ApiResponse<QueueEntry> =>
    api.post("/queue", queueEntry),
  callNext: (doctorId: number): ApiResponse<QueueEntry> =>
    api.post(`/queue/doctor/${doctorId}/next`),
  complete: (id: number): ApiResponse<QueueEntry> =>
    api.put(`/queue/${id}/complete`),
  cancel: (id: number): ApiResponse<void> => api.delete(`/queue/${id}`),
};

// Appointment APIs
export const appointmentAPI = {
  getAll: (): ApiResponse<Appointment[]> => api.get("/appointments"),
  getById: (id: number): ApiResponse<Appointment> =>
    api.get(`/appointments/${id}`),
  getByDoctorAndDate: (
    doctorId: number,
    date: string,
  ): ApiResponse<Appointment[]> =>
    api.get(`/appointments/doctor/${doctorId}`, { params: { date } }),
  getByPatient: (patientId: number): ApiResponse<Appointment[]> =>
    api.get(`/appointments/patient/${patientId}`),
  create: (appointment: CreateAppointment): ApiResponse<Appointment> =>
    api.post("/appointments", appointment),
  update: (
    id: number,
    appointment: Partial<Appointment>,
  ): ApiResponse<Appointment> => api.put(`/appointments/${id}`, appointment),
  delete: (id: number): ApiResponse<void> => api.delete(`/appointments/${id}`),
};

// Analytics APIs
export const analyticsAPI = {
  getAll: (): ApiResponse<Analytics[]> => api.get("/analytics"),
  getById: (id: number): ApiResponse<Analytics> => api.get(`/analytics/${id}`),
  getByDateRange: (
    startDate: string,
    endDate: string,
  ): ApiResponse<Analytics[]> =>
    api.get("/analytics/range", { params: { startDate, endDate } }),
  getByDoctor: (doctorId: number): ApiResponse<Analytics> =>
    api.get(`/analytics/doctor/${doctorId}`),
  createOrUpdate: (analytics: Partial<Analytics>): ApiResponse<Analytics> =>
    api.post("/analytics", analytics),
};

export default api;
