import { useEffect, useState } from "react";
import {
  FaBell,
  FaCalendarCheck,
  FaCheckCircle,
  FaClock,
  FaListOl,
  FaSearch,
  FaSignOutAlt,
  FaStar,
  FaUser,
  FaUserMd,
  FaFilter,
  FaCalendarAlt,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Appointment,
  appointmentAPI,
  Doctor,
  doctorAPI,
  Patient,
  patientAPI,
  queueAPI,
  QueueEntry,
} from "../services/api";
import "./PatientDashboard.css";

function PatientDashboard() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [queueEntry, setQueueEntry] = useState<QueueEntry | null>(null);
  const [previousPosition, setPreviousPosition] = useState<number | null>(null);
  const [movementMessage, setMovementMessage] = useState<string>("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [experienceFilter, setExperienceFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("rating");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showAppointments, setShowAppointments] = useState<boolean>(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState<boolean>(false);

  useEffect(() => {
    loadPatientData();
    loadDoctors();
    // Poll for queue updates for live movement tracking
    const interval = setInterval(loadPatientData, 3000);
    return () => clearInterval(interval);
  }, [patientId]);

  useEffect(() => {
    // Filter doctors based on search and specialty
    let result = doctors;

    if (searchQuery) {
      result = result.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (specialtyFilter !== "all") {
      result = result.filter(
        (doctor) =>
          doctor.specialty.toLowerCase() === specialtyFilter.toLowerCase()
      );
    }

    if (experienceFilter !== "all") {
      const minExp = parseInt(experienceFilter);
      result = result.filter((doctor) => doctor.experience >= minExp);
    }

    if (ratingFilter !== "all") {
      const minRating = parseFloat(ratingFilter);
      result = result.filter((doctor) => doctor.rating >= minRating);
    }

    // Sort doctors
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "experience":
          return b.experience - a.experience;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredDoctors(result);
  }, [searchQuery, specialtyFilter, experienceFilter, ratingFilter, sortBy, doctors]);

  const loadPatientData = async () => {
    if (!patientId) return;

    try {
      const [patientResponse, queueResponse] = await Promise.allSettled([
        patientAPI.getById(parseInt(patientId)),
        queueAPI.getActiveByPatient(parseInt(patientId)),
      ]);

      if (patientResponse.status === "fulfilled") {
        setPatient(patientResponse.value.data);
      }

      if (queueResponse.status === "fulfilled") {
        const latestEntry = queueResponse.value.data;

        if (!latestEntry || typeof latestEntry !== "object" || !("id" in latestEntry)) {
          setQueueEntry(null);
          setPreviousPosition(null);
          setMovementMessage("");
          return;
        }

        const latestPosition = latestEntry.position ?? null;

        setQueueEntry(latestEntry);
        if (latestPosition !== null && previousPosition !== null && latestPosition < previousPosition) {
          const moved = previousPosition - latestPosition;
          setMovementMessage(`Good news! You moved up ${moved} place${moved > 1 ? "s" : ""}.`);
        }
        if (latestPosition !== null) {
          setPreviousPosition(latestPosition);
        }
      } else {
        setQueueEntry(null);
        setPreviousPosition(null);
        setMovementMessage("");
      }
    } catch (error) {
      console.error("Error loading patient data:", error);
      toast.error("Error loading your information");
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await doctorAPI.getAll();
      setDoctors(response.data);
      setFilteredDoctors(response.data);
    } catch (error) {
      console.error("Error loading doctors:", error);
    }
  };

  const getSpecialties = (): string[] => {
    const specialties = Array.from(
      new Set(doctors.map((d) => d.specialty))
    ).sort();
    return specialties;
  };

  const getNextAvailableTime = (doctorId: number): string => {
    // Simulate next available slot in compact label format.
    const times = [
      "10:30 AM",
      "2:15 PM",
      "11:45 AM",
      "9:00 AM",
      "Tomorrow 8:00 AM",
      "10:00 AM",
      "3:30 PM",
      "1:00 PM",
      "11:00 AM",
    ];
    return times[doctorId % times.length];
  };

  const getDoctorAvailability = (
    doctor: Doctor,
  ): { label: "Available" | "Busy" | "Offline"; className: string } => {
    if (!doctor.availability) {
      return { label: "Offline", className: "offline" };
    }

    if (doctor.id % 4 === 0) {
      return { label: "Busy", className: "busy" };
    }

    return { label: "Available", className: "available" };
  };

  const handleBookAppointment = (doctorId: number) => {
    if (!patientId) {
      return;
    }

    navigate(`/booking/${patientId}/${doctorId}`);
  };

  const handleLeaveQueue = async () => {
    if (!queueEntry) return;

    try {
      await queueAPI.cancel(queueEntry.id);
      setQueueEntry(null);
      toast.info("You have left the queue");
    } catch (error) {
      console.error("Error leaving queue:", error);
      toast.error("Failed to leave queue");
    }
  };

  const formatAppointmentDate = (dateValue: string): string => {
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
      return dateValue;
    }

    return parsed.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAppointmentTime = (timeValue: string): string => {
    if (!timeValue) {
      return "--";
    }

    const [hours, minutes] = timeValue.split(":");
    if (!hours || !minutes) {
      return timeValue;
    }

    const parsed = new Date();
    parsed.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    return parsed.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getAppointmentStatusClass = (status: Appointment["status"]): string => {
    switch (status) {
      case "SCHEDULED":
        return "scheduled";
      case "COMPLETED":
        return "completed";
      case "CANCELLED":
        return "cancelled";
      default:
        return "scheduled";
    }
  };

  const loadAppointments = async () => {
    if (!patientId) {
      return;
    }

    try {
      setAppointmentsLoading(true);
      const response = await appointmentAPI.getByPatient(parseInt(patientId));
      const sortedAppointments = [...response.data].sort((a, b) => {
        const left = new Date(`${a.appointmentDate}T${a.appointmentTime}`).getTime();
        const right = new Date(`${b.appointmentDate}T${b.appointmentTime}`).getTime();
        return left - right;
      });
      setAppointments(sortedAppointments);
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("Unable to load appointments right now");
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handleShowAppointments = async () => {
    const nextShow = !showAppointments;
    setShowAppointments(nextShow);

    if (nextShow) {
      await loadAppointments();
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "WAITING":
        return "info";
      case "CALLED":
        return "success";
      case "NEXT":
        return "warning";
      default:
        return "info";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "WAITING":
        return "Waiting in Queue";
      case "NEXT":
        return "You Are Next";
      case "CALLED":
        return "Please Proceed to Doctor";
      default:
        return status;
    }
  };

  if (!patient) {
    return (
      <div className="patient-dashboard">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="patient-dashboard fade-in">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-left">
            <div className="profile-avatar">
              <FaUser />
            </div>
            <div className="header-info">
              <h1>{patient.name}</h1>
              <p className="subtitle">Patient Portal</p>
            </div>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-header"
              onClick={handleShowAppointments}
            >
              <FaCalendarAlt /> My Appointments
            </button>
            <button className="btn btn-logout" onClick={() => navigate("/")}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {showAppointments && (
            <section className="appointments-section card">
              <div className="appointments-header">
                <h2>
                  <FaCalendarCheck /> My Appointments
                </h2>
                <button
                  className="btn btn-header appointments-refresh-btn"
                  onClick={loadAppointments}
                  disabled={appointmentsLoading}
                >
                  {appointmentsLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {appointmentsLoading ? (
                <p className="appointments-loading">Loading appointments...</p>
              ) : appointments.length === 0 ? (
                <p className="appointments-empty">No appointments found yet.</p>
              ) : (
                <div className="appointments-list">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="appointment-card">
                      <div className="appointment-main-row">
                        <div>
                          <h4>Dr. {appointment.doctor.name.replace(/^Dr\.\s*/i, "")}</h4>
                          <p>{appointment.doctor.specialty}</p>
                        </div>
                        <span
                          className={`appointment-status ${getAppointmentStatusClass(appointment.status)}`}
                        >
                          {appointment.status}
                        </span>
                      </div>

                      <div className="appointment-meta">
                        <div>
                          <span className="meta-label">Date</span>
                          <span className="meta-value">
                            {formatAppointmentDate(appointment.appointmentDate)}
                          </span>
                        </div>
                        <div>
                          <span className="meta-label">Time</span>
                          <span className="meta-value">
                            {formatAppointmentTime(appointment.appointmentTime)}
                          </span>
                        </div>
                      </div>

                      {appointment.reason && (
                        <p className="appointment-reason">Reason: {appointment.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {!queueEntry ? (
            <>
              <div className="available-doctors-section">
                  <div className="section-header">
                    <h2 className="section-title">
                      <FaUserMd /> Available Doctors ({filteredDoctors.length})
                    </h2>
                    <p className="section-subtitle">
                      Find and book the right specialist for your needs
                    </p>
                  </div>

                  <div className="search-filter-container">
                    <div className="search-box">
                      <FaSearch className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search by doctor name or specialty..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                      />
                    </div>
                    
                    <div className="filters-group">
                      <div className="filter-box">
                        <FaFilter className="filter-icon" />
                        <select
                          value={specialtyFilter}
                          onChange={(e) => setSpecialtyFilter(e.target.value)}
                          className="filter-select"
                        >
                          <option value="all">All Specialties</option>
                          {getSpecialties().map((specialty) => (
                            <option key={specialty} value={specialty}>
                              {specialty}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="filter-box">
                        <select
                          value={experienceFilter}
                          onChange={(e) => setExperienceFilter(e.target.value)}
                          className="filter-select"
                        >
                          <option value="all">Experience</option>
                          <option value="5">5+ Years</option>
                          <option value="10">10+ Years</option>
                          <option value="15">15+ Years</option>
                        </select>
                      </div>

                      <div className="filter-box">
                        <select
                          value={ratingFilter}
                          onChange={(e) => setRatingFilter(e.target.value)}
                          className="filter-select"
                        >
                          <option value="all">Rating</option>
                          <option value="4.5">4.5+ ⭐</option>
                          <option value="4.0">4.0+ ⭐</option>
                          <option value="3.5">3.5+ ⭐</option>
                        </select>
                      </div>

                      <div className="filter-box sort-box">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="filter-select"
                        >
                          <option value="rating">Highest Rated</option>
                          <option value="experience">Most Experienced</option>
                          <option value="name">Name (A-Z)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="results-count">
                    Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""}
                  </div>

                  <div className="doctors-list">
                    {filteredDoctors.length === 0 ? (
                      <div className="no-doctors">
                        <FaUserMd className="no-doctors-icon" />
                        <p>
                          {searchQuery || specialtyFilter !== "all" || experienceFilter !== "all" || ratingFilter !== "all"
                            ? "No doctors found matching your criteria"
                            : "Loading doctors..."}
                        </p>
                        {(searchQuery || specialtyFilter !== "all" || experienceFilter !== "all" || ratingFilter !== "all") && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setSearchQuery("");
                              setSpecialtyFilter("all");
                              setExperienceFilter("all");
                              setRatingFilter("all");
                            }}
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredDoctors.map((doctor) => (
                        <div key={doctor.id} className="patient-doctor-card">
                          <div className="patient-doctor-top-row">
                            <div className="patient-doctor-avatar initials-avatar">
                              {doctor.name
                                .split(" ")
                                .map((name) => name[0])
                                .join("")}
                            </div>
                            <div className="patient-doctor-headline">
                              <h4 className="patient-doctor-name">Dr. {doctor.name.replace(/^Dr\.\s*/i, "")}</h4>
                              <p className="patient-doctor-specialty-inline">{doctor.specialty}</p>
                            </div>
                            {(() => {
                              const availability = getDoctorAvailability(doctor);
                              return (
                                <span className={`patient-doctor-status ${availability.className}`}>
                                  {availability.label}
                                </span>
                              );
                            })()}
                          </div>

                          <div className="patient-doctor-card-content">
                            <div className="patient-doctor-metrics-row">
                              <div className="detail-item rating-item">
                                <FaStar className="detail-item-icon" />
                                <span>{doctor.rating} rating</span>
                              </div>
                              <div className="detail-item experience-item">
                                <FaCheckCircle className="detail-item-icon" />
                                <span>{doctor.experience}+ years</span>
                              </div>
                            </div>

                            <div className="next-slot-pill">
                              <FaClock className="detail-item-icon" />
                              <span>
                                Next slot: <strong>{getNextAvailableTime(doctor.id)}</strong>
                              </span>
                            </div>

                            <div className="patient-doctor-card-actions">
                              <button
                                className="btn btn-primary"
                                disabled={getDoctorAvailability(doctor).label === "Offline"}
                                onClick={() => {
                                  if (getDoctorAvailability(doctor).label !== "Offline") {
                                    handleBookAppointment(doctor.id);
                                  }
                                }}
                              >
                                {getDoctorAvailability(doctor).label === "Offline"
                                  ? "Not Available"
                                  : "Book Appointment"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
            </>
          ) : (
            <div className="queue-status-section">
              <div className="status-card card">
                <div className="status-header">
                  <h2>Your Queue Status</h2>
                  <div
                    className={`status-badge badge-${getStatusColor(queueEntry.status)}`}
                  >
                    {getStatusText(queueEntry.status)}
                  </div>
                </div>

                <div className="queue-details">
                  <div className="detail-row">
                    <FaListOl className="detail-icon" />
                    <div>
                      <p className="detail-label">Your Position</p>
                      <p className="detail-value">
                        You are #{queueEntry.position ?? "-"} in queue
                      </p>
                    </div>
                  </div>

                  {movementMessage && (
                    <div className="detail-row">
                      <FaBell className="detail-icon" />
                      <div>
                        <p className="detail-label">Live Queue Movement</p>
                        <p className="detail-value">{movementMessage}</p>
                      </div>
                    </div>
                  )}

                  <div className="detail-row">
                    <FaClock className="detail-icon" />
                    <div>
                      <p className="detail-label">Estimated Wait Time</p>
                      <p className="detail-value">
                        {queueEntry.estimatedWaitTime || 15} minutes
                      </p>
                    </div>
                  </div>

                  <div className="detail-row">
                    <FaUser className="detail-icon" />
                    <div>
                      <p className="detail-label">Doctor</p>
                      <p className="detail-value">{queueEntry.doctor.name}</p>
                      <p className="detail-subtitle">
                        {queueEntry.doctor.specialty}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="progress-container">
                  <div className="progress-label">Queue Progress</div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.max(10, 100 - (queueEntry.position || 1) * 10)}%`,
                      }}
                    />
                  </div>
                </div>

                {queueEntry.status === "CALLED" && (
                  <div className="alert alert-success">
                    <FaBell className="alert-icon pulse" />
                    <div>
                      <strong>It's your turn!</strong>
                      <p>
                        Please proceed to Dr. {queueEntry.doctor.name}'s
                        consultation room.
                      </p>
                    </div>
                  </div>
                )}

                {queueEntry.status === "WAITING" &&
                  (queueEntry.position || 0) <= 3 && (
                    <div className="alert alert-warning">
                      <FaBell className="alert-icon" />
                      <div>
                        <strong>You're almost there!</strong>
                        <p>Please stay nearby, you'll be called soon.</p>
                      </div>
                    </div>
                  )}

                <button
                  className="btn btn-danger btn-full"
                  onClick={handleLeaveQueue}
                >
                  Leave Queue
                </button>
              </div>

              <div className="patient-info-card card">
                <h3>Your Information</h3>
                <div className="info-item">
                  <strong>Name:</strong> {patient.name}
                </div>
                <div className="info-item">
                  <strong>Email:</strong> {patient.email}
                </div>
                {patient.phone && (
                  <div className="info-item">
                    <strong>Phone:</strong> {patient.phone}
                  </div>
                )}
                <div className="info-item">
                  <strong>Priority:</strong>
                  <span
                    className={`badge badge-${queueEntry.priority === "URGENT" ? "danger" : "info"}`}
                  >
                    {queueEntry.priority}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;
