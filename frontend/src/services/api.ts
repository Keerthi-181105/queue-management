import axios, { AxiosResponse } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const USE_DEMO_MODE = import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL;

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

type DemoState = {
  doctors: Doctor[];
  patients: Patient[];
  queueEntries: QueueEntry[];
  appointments: Appointment[];
  analytics: Analytics[];
  counters: {
    doctor: number;
    patient: number;
    queue: number;
    appointment: number;
    analytics: number;
  };
};

const DEMO_DB_KEY = "queue-management-demo-db";

const seedDoctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Sarah Mitchell",
    email: "sarah.mitchell@hospital.com",
    specialty: "Dermatology",
    qualification: "MD, Board Certified Dermatologist",
    experience: 12,
    rating: 4.8,
    availability: true,
  },
  {
    id: 2,
    name: "Dr. Michael Thompson",
    email: "michael.thompson@hospital.com",
    specialty: "Cardiology",
    qualification: "MD, FACC, Cardiology Specialist",
    experience: 15,
    rating: 4.9,
    availability: true,
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    email: "emily.rodriguez@hospital.com",
    specialty: "Pediatrics",
    qualification: "MD, Pediatrics Specialist",
    experience: 8,
    rating: 4.7,
    availability: true,
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    email: "james.wilson@hospital.com",
    specialty: "Orthopedics",
    qualification: "MD, Orthopedic Surgeon",
    experience: 10,
    rating: 4.6,
    availability: true,
  },
  {
    id: 5,
    name: "Dr. Lisa Chen",
    email: "lisa.chen@hospital.com",
    specialty: "Neurology",
    qualification: "MD, PhD, Neurology Specialist",
    experience: 14,
    rating: 4.9,
    availability: true,
  },
  {
    id: 6,
    name: "Dr. Robert Anderson",
    email: "robert.anderson@hospital.com",
    specialty: "General Medicine",
    qualification: "MD, Family Medicine",
    experience: 20,
    rating: 4.5,
    availability: true,
  },
];

const createDemoState = (): DemoState => ({
  doctors: seedDoctors,
  patients: [],
  queueEntries: [],
  appointments: [],
  analytics: [],
  counters: {
    doctor: seedDoctors.length + 1,
    patient: 1,
    queue: 1,
    appointment: 1,
    analytics: 1,
  },
});

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const demoResponse = <T,>(data: T): Promise<AxiosResponse<T>> =>
  Promise.resolve({
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {},
    request: {},
  } as AxiosResponse<T>);

const demoNotFoundError = (message: string) =>
  Promise.reject({
    isAxiosError: true,
    message,
    response: {
      data: { message },
      status: 404,
      statusText: "Not Found",
      headers: {},
      config: {},
      request: {},
    },
  });

const loadDemoState = (): DemoState => {
  if (typeof window === "undefined") {
    return createDemoState();
  }

  try {
    const stored = window.localStorage.getItem(DEMO_DB_KEY);
    if (!stored) {
      return createDemoState();
    }

    const parsed = JSON.parse(stored) as DemoState;
    return {
      ...createDemoState(),
      ...parsed,
      doctors: parsed.doctors?.length ? parsed.doctors : seedDoctors,
      patients: parsed.patients ?? [],
      queueEntries: parsed.queueEntries ?? [],
      appointments: parsed.appointments ?? [],
      analytics: parsed.analytics ?? [],
      counters: parsed.counters ?? createDemoState().counters,
    };
  } catch {
    return createDemoState();
  }
};

const saveDemoState = (state: DemoState) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DEMO_DB_KEY, JSON.stringify(state));
};

const nextId = (counter: keyof DemoState["counters"], state: DemoState) => {
  const id = state.counters[counter];
  state.counters[counter] += 1;
  return id;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const isActiveQueueStatus = (status: QueueEntry["status"]) =>
  status === "WAITING" || status === "NEXT" || status === "CALLED";

const computeAnalyticsForDoctor = (state: DemoState, doctorId: number): Analytics => {
  const doctor = state.doctors.find((item) => item.id === doctorId);
  const queueEntries = state.queueEntries.filter(
    (entry) => entry.doctor.id === doctorId,
  );
  const completedAppointments = queueEntries.filter(
    (entry) => entry.status === "COMPLETED",
  ).length;
  const activeEntries = queueEntries.filter((entry) => isActiveQueueStatus(entry.status));
  const appointments = state.appointments.filter(
    (appointment) => appointment.doctor.id === doctorId,
  );

  return {
    id: doctorId,
    doctor,
    date: new Date().toISOString().slice(0, 10),
    totalPatients: activeEntries.length,
    averageWaitTime: Math.max(10, 12 + activeEntries.length * 3),
    satisfactionScore: Math.min(98, 88 + completedAppointments),
    revenue: appointments.length * 125,
    completedAppointments,
    efficiencyScore: Math.min(99, 72 + completedAppointments * 4),
  };
};

const ensureDemoAnalytics = (state: DemoState, doctorId: number) => {
  const record = computeAnalyticsForDoctor(state, doctorId);
  const index = state.analytics.findIndex((item) => item.id === doctorId);
  if (index >= 0) {
    state.analytics[index] = record;
  } else {
    state.analytics.push(record);
  }
  return record;
};

const getDemoState = () => loadDemoState();
const setDemoState = (state: DemoState) => saveDemoState(state);

const demoDoctorAPI = {
  getAll: (): ApiResponse<Doctor[]> => demoResponse(getDemoState().doctors),
  getById: async (id: number): ApiResponse<Doctor> => {
    const state = getDemoState();
    const doctor = state.doctors.find((item) => item.id === id);
    return doctor ? demoResponse(doctor) : demoNotFoundError("Doctor not found");
  },
  getByEmail: async (email: string): ApiResponse<Doctor> => {
    const state = getDemoState();
    const doctor = state.doctors.find(
      (item) => normalizeEmail(item.email) === normalizeEmail(email),
    );
    return doctor ? demoResponse(doctor) : demoNotFoundError("Doctor not found");
  },
  getBySpecialty: async (specialty: string): ApiResponse<Doctor[]> => {
    const state = getDemoState();
    const doctors = state.doctors.filter(
      (item) => item.specialty.toLowerCase() === specialty.trim().toLowerCase(),
    );
    return demoResponse(doctors);
  },
  create: async (doctor: Partial<Doctor>): ApiResponse<Doctor> => {
    const state = getDemoState();
    const created: Doctor = {
      id: nextId("doctor", state),
      name: doctor.name ?? "New Doctor",
      email: doctor.email ?? `doctor-${Date.now()}@demo.local`,
      specialty: doctor.specialty ?? "General Medicine",
      qualification: doctor.qualification ?? "MD",
      experience: doctor.experience ?? 0,
      rating: doctor.rating ?? 5,
      availability: doctor.availability ?? true,
    };
    state.doctors.push(created);
    setDemoState(state);
    return demoResponse(created);
  },
  update: async (id: number, doctor: Partial<Doctor>): ApiResponse<Doctor> => {
    const state = getDemoState();
    const index = state.doctors.findIndex((item) => item.id === id);
    if (index < 0) {
      return demoNotFoundError("Doctor not found");
    }

    state.doctors[index] = { ...state.doctors[index], ...doctor };
    setDemoState(state);
    return demoResponse(state.doctors[index]);
  },
  delete: async (id: number): ApiResponse<void> => {
    const state = getDemoState();
    state.doctors = state.doctors.filter((item) => item.id !== id);
    setDemoState(state);
    return demoResponse(void 0);
  },
};

const demoPatientAPI = {
  getAll: (): ApiResponse<Patient[]> => demoResponse(getDemoState().patients),
  getById: async (id: number): ApiResponse<Patient> => {
    const state = getDemoState();
    const patient = state.patients.find((item) => item.id === id);
    return patient ? demoResponse(patient) : demoNotFoundError("Patient not found");
  },
  getByEmail: async (email: string): ApiResponse<Patient> => {
    const state = getDemoState();
    const patient = state.patients.find(
      (item) => normalizeEmail(item.email) === normalizeEmail(email),
    );
    return patient ? demoResponse(patient) : demoNotFoundError("Patient not found");
  },
  create: async (patient: Partial<Patient>): ApiResponse<Patient> => {
    const state = getDemoState();
    const created: Patient = {
      id: nextId("patient", state),
      name: patient.name ?? "New Patient",
      email: patient.email ?? `patient-${Date.now()}@demo.local`,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender,
      pregnant: patient.pregnant,
    };
    state.patients.push(created);
    setDemoState(state);
    return demoResponse(created);
  },
  update: async (id: number, patient: Partial<Patient>): ApiResponse<Patient> => {
    const state = getDemoState();
    const index = state.patients.findIndex((item) => item.id === id);
    if (index < 0) {
      return demoNotFoundError("Patient not found");
    }

    state.patients[index] = { ...state.patients[index], ...patient };
    setDemoState(state);
    return demoResponse(state.patients[index]);
  },
  delete: async (id: number): ApiResponse<void> => {
    const state = getDemoState();
    state.patients = state.patients.filter((item) => item.id !== id);
    setDemoState(state);
    return demoResponse(void 0);
  },
};

const demoQueueAPI = {
  getAll: (): ApiResponse<QueueEntry[]> => demoResponse(getDemoState().queueEntries),
  getById: async (id: number): ApiResponse<QueueEntry> => {
    const state = getDemoState();
    const entry = state.queueEntries.find((item) => item.id === id);
    return entry ? demoResponse(entry) : demoNotFoundError("Queue entry not found");
  },
  getByDoctor: async (doctorId: number): ApiResponse<QueueEntry[]> => {
    const state = getDemoState();
    return demoResponse(state.queueEntries.filter((entry) => entry.doctor.id === doctorId));
  },
  getActiveByDoctor: async (doctorId: number): ApiResponse<QueueEntry[]> => {
    const state = getDemoState();
    return demoResponse(
      state.queueEntries.filter(
        (entry) => entry.doctor.id === doctorId && isActiveQueueStatus(entry.status),
      ),
    );
  },
  getActiveByPatient: async (patientId: number): ApiResponse<QueueEntry> => {
    const state = getDemoState();
    const entry = [...state.queueEntries]
      .reverse()
      .find(
        (item) => item.patient.id === patientId && isActiveQueueStatus(item.status),
      );
    return entry ? demoResponse(entry) : demoNotFoundError("No active queue entry found");
  },
  addToQueue: async (queueEntry: CreateQueueEntry): ApiResponse<QueueEntry> => {
    const state = getDemoState();
    const patient = state.patients.find((item) => item.id === queueEntry.patient.id);
    const doctor = state.doctors.find((item) => item.id === queueEntry.doctor.id);

    if (!patient || !doctor) {
      return demoNotFoundError("Patient or doctor not found");
    }

    const doctorQueue = state.queueEntries.filter((entry) => entry.doctor.id === doctor.id && isActiveQueueStatus(entry.status));
    const created: QueueEntry = {
      id: nextId("queue", state),
      patient,
      doctor,
      position: doctorQueue.length + 1,
      status: "WAITING",
      priority: queueEntry.priority ?? (queueEntry.emergency ? "URGENT" : "LOW"),
      reason: queueEntry.reason,
      emergency: queueEntry.emergency ?? false,
      priorityReason: queueEntry.emergency ? "Emergency flagged by patient" : undefined,
      estimatedWaitTime: Math.max(5, doctorQueue.length * 10 + 10),
      joinedAt: new Date().toISOString(),
    };

    state.queueEntries.push(created);
    ensureDemoAnalytics(state, doctor.id);
    setDemoState(state);
    return demoResponse(created);
  },
  callNext: async (doctorId: number): ApiResponse<QueueEntry> => {
    const state = getDemoState();
    const entry = state.queueEntries.find(
      (item) => item.doctor.id === doctorId && item.status === "WAITING",
    );

    if (!entry) {
      return demoNotFoundError("No patients in queue");
    }

    entry.status = "CALLED";
    entry.calledAt = new Date().toISOString();
    entry.position = 1;
    state.queueEntries = state.queueEntries.map((item) =>
      item.id === entry.id ? entry : item,
    );
    ensureDemoAnalytics(state, doctorId);
    setDemoState(state);
    return demoResponse(entry);
  },
  complete: async (id: number): ApiResponse<QueueEntry> => {
    const state = getDemoState();
    const entry = state.queueEntries.find((item) => item.id === id);
    if (!entry) {
      return demoNotFoundError("Queue entry not found");
    }

    entry.status = "COMPLETED";
    entry.completedAt = new Date().toISOString();
    state.queueEntries = state.queueEntries.map((item) =>
      item.id === entry.id ? entry : item,
    );
    ensureDemoAnalytics(state, entry.doctor.id);
    setDemoState(state);
    return demoResponse(entry);
  },
  cancel: async (id: number): ApiResponse<void> => {
    const state = getDemoState();
    const entry = state.queueEntries.find((item) => item.id === id);
    if (!entry) {
      return demoNotFoundError("Queue entry not found");
    }

    entry.status = "CANCELLED";
    state.queueEntries = state.queueEntries.map((item) =>
      item.id === entry.id ? entry : item,
    );
    ensureDemoAnalytics(state, entry.doctor.id);
    setDemoState(state);
    return demoResponse(void 0);
  },
};

const demoAppointmentAPI = {
  getAll: (): ApiResponse<Appointment[]> => demoResponse(getDemoState().appointments),
  getById: async (id: number): ApiResponse<Appointment> => {
    const state = getDemoState();
    const appointment = state.appointments.find((item) => item.id === id);
    return appointment ? demoResponse(appointment) : demoNotFoundError("Appointment not found");
  },
  getByDoctorAndDate: async (
    doctorId: number,
    date: string,
  ): ApiResponse<Appointment[]> => {
    const state = getDemoState();
    return demoResponse(
      state.appointments.filter(
        (appointment) =>
          appointment.doctor.id === doctorId && appointment.appointmentDate === date,
      ),
    );
  },
  getByPatient: async (patientId: number): ApiResponse<Appointment[]> => {
    const state = getDemoState();
    return demoResponse(
      state.appointments.filter((appointment) => appointment.patient.id === patientId),
    );
  },
  create: async (appointment: CreateAppointment): ApiResponse<Appointment> => {
    const state = getDemoState();
    const patient = state.patients.find((item) => item.id === appointment.patient.id);
    const doctor = state.doctors.find((item) => item.id === appointment.doctor.id);

    if (!patient || !doctor) {
      return demoNotFoundError("Patient or doctor not found");
    }

    const created: Appointment = {
      id: nextId("appointment", state),
      patient,
      doctor,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      status: appointment.status,
      reason: appointment.reason,
    };

    state.appointments.push(created);
    state.queueEntries.push({
      id: nextId("queue", state),
      patient,
      doctor,
      position: state.queueEntries.filter(
        (entry) => entry.doctor.id === doctor.id && isActiveQueueStatus(entry.status),
      ).length,
      status: "WAITING",
      priority: "LOW",
      reason: appointment.reason,
      estimatedWaitTime: 10,
      joinedAt: new Date().toISOString(),
    });
    ensureDemoAnalytics(state, doctor.id);
    setDemoState(state);
    return demoResponse(created);
  },
  update: async (
    id: number,
    appointment: Partial<Appointment>,
  ): ApiResponse<Appointment> => {
    const state = getDemoState();
    const index = state.appointments.findIndex((item) => item.id === id);
    if (index < 0) {
      return demoNotFoundError("Appointment not found");
    }

    state.appointments[index] = { ...state.appointments[index], ...appointment };
    setDemoState(state);
    return demoResponse(state.appointments[index]);
  },
  delete: async (id: number): ApiResponse<void> => {
    const state = getDemoState();
    state.appointments = state.appointments.filter((item) => item.id !== id);
    setDemoState(state);
    return demoResponse(void 0);
  },
};

const demoAnalyticsAPI = {
  getAll: (): ApiResponse<Analytics[]> => {
    const state = getDemoState();
    const records = state.doctors.map((doctor) => ensureDemoAnalytics(state, doctor.id));
    setDemoState(state);
    return demoResponse(records);
  },
  getById: async (id: number): ApiResponse<Analytics> => {
    const state = getDemoState();
    const analytics = ensureDemoAnalytics(state, id);
    setDemoState(state);
    return demoResponse(analytics);
  },
  getByDateRange: async (
    startDate: string,
    endDate: string,
  ): ApiResponse<Analytics[]> => {
    const state = getDemoState();
    const records = state.doctors.map((doctor) => ensureDemoAnalytics(state, doctor.id));
    const filtered = records.filter(
      (record) => record.date >= startDate && record.date <= endDate,
    );
    setDemoState(state);
    return demoResponse(filtered);
  },
  getByDoctor: async (doctorId: number): ApiResponse<Analytics> => {
    const state = getDemoState();
    const analytics = ensureDemoAnalytics(state, doctorId);
    setDemoState(state);
    return demoResponse(analytics);
  },
  createOrUpdate: async (analytics: Partial<Analytics>): ApiResponse<Analytics> => {
    const state = getDemoState();
    const doctorId = analytics.doctor?.id ?? analytics.id ?? 0;
    const record = {
      ...ensureDemoAnalytics(state, doctorId),
      ...analytics,
      id: doctorId,
      doctor: analytics.doctor ?? state.doctors.find((item) => item.id === doctorId),
    } as Analytics;
    const index = state.analytics.findIndex((item) => item.id === doctorId);
    if (index >= 0) {
      state.analytics[index] = record;
    } else {
      state.analytics.push(record);
    }
    setDemoState(state);
    return demoResponse(record);
  },
};

const liveDoctorAPI = {
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

const livePatientAPI = {
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

const liveQueueAPI = {
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

const liveAppointmentAPI = {
  getAll: (): ApiResponse<Appointment[]> => api.get("/appointments"),
  getById: (id: number): ApiResponse<Appointment> => api.get(`/appointments/${id}`),
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

const liveAnalyticsAPI = {
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

// Doctor APIs
export const doctorAPI = USE_DEMO_MODE ? demoDoctorAPI : liveDoctorAPI;

// Patient APIs
export const patientAPI = USE_DEMO_MODE ? demoPatientAPI : livePatientAPI;

// Queue APIs
export const queueAPI = USE_DEMO_MODE ? demoQueueAPI : liveQueueAPI;

// Appointment APIs
export const appointmentAPI = USE_DEMO_MODE ? demoAppointmentAPI : liveAppointmentAPI;

// Analytics APIs
export const analyticsAPI = USE_DEMO_MODE ? demoAnalyticsAPI : liveAnalyticsAPI;

export default api;
