import { useEffect, useState } from "react";
import {
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaSignOutAlt,
  FaUserMd,
  FaUsers,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Doctor, doctorAPI, queueAPI, QueueEntry } from "../services/api";
import "./DoctorDashboard.css";

interface Stats {
  totalPatients: number;
  averageWaitTime: number;
  completedToday: number;
  efficiency: number;
}

function DoctorDashboard() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [currentPatient, setCurrentPatient] = useState<QueueEntry | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalPatients: 0,
    averageWaitTime: 15,
    completedToday: 0,
    efficiency: 92,
  });

  useEffect(() => {
    loadDoctorData();
    // Poll for queue updates every 3 seconds
    const interval = setInterval(loadDoctorData, 3000);
    return () => clearInterval(interval);
  }, [doctorId]);

  const loadDoctorData = async () => {
    if (!doctorId) return;

    try {
      const doctorResponse = await doctorAPI.getById(parseInt(doctorId));
      setDoctor(doctorResponse.data);

      const queueResponse = await queueAPI.getActiveByDoctor(
        parseInt(doctorId),
      );
      setQueue(queueResponse.data);

      // Find current patient (called status)
      const queueAllResponse = await queueAPI.getByDoctor(parseInt(doctorId));
      const called = queueAllResponse.data.find(
        (entry) => entry.status === "CALLED",
      );
      setCurrentPatient(called || null);

      // Calculate stats
      const completed = queueAllResponse.data.filter(
        (entry) => entry.status === "COMPLETED",
      );
      setStats({
        totalPatients: queueResponse.data.length,
        averageWaitTime: 15,
        completedToday: completed.length,
        efficiency: Math.min(95, 70 + completed.length * 3),
      });
    } catch (error) {
      console.error("Error loading doctor data:", error);
      toast.error("Error loading dashboard data");
    }
  };

  const handleCallNext = async () => {
    if (!doctorId) return;

    try {
      const response = await queueAPI.callNext(parseInt(doctorId));
      if (response.data) {
        setCurrentPatient(response.data);
        toast.success(`Called ${response.data.patient.name}`);
      } else {
        toast.info("No patients in queue");
      }
    } catch (error) {
      console.error("Error calling next patient:", error);
      toast.error("Failed to call next patient");
    }
  };

  const handleCompleteAppointment = async () => {
    if (!currentPatient) return;

    try {
      await queueAPI.complete(currentPatient.id);
      toast.success("Appointment completed");
      setCurrentPatient(null);
      loadDoctorData();
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast.error("Failed to complete appointment");
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "URGENT":
        return "danger";
      case "MEDIUM":
        return "warning";
      case "LOW":
        return "info";
      default:
        return "info";
    }
  };

  if (!doctor) {
    return (
      <div className="doctor-dashboard">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="doctor-dashboard fade-in">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-left">
            <FaUserMd className="header-icon" />
            <div>
              <h1>Dr. {doctor.name}</h1>
              <p className="subtitle">{doctor.specialty}</p>
            </div>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/analytics/${doctorId}`)}
            >
              <FaChartLine /> Analytics
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/")}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card card">
            <div
              className="stat-icon"
              style={{ background: "#DBEAFE", color: "#3B82F6" }}
            >
              <FaUsers />
            </div>
            <div className="stat-content">
              <p className="stat-label">Patients in Queue</p>
              <p className="stat-value">{stats.totalPatients}</p>
            </div>
          </div>
          <div className="stat-card card">
            <div
              className="stat-icon"
              style={{ background: "#D1FAE5", color: "#10B981" }}
            >
              <FaCheckCircle />
            </div>
            <div className="stat-content">
              <p className="stat-label">Completed Today</p>
              <p className="stat-value">{stats.completedToday}</p>
            </div>
          </div>
          <div className="stat-card card">
            <div
              className="stat-icon"
              style={{ background: "#FEF3C7", color: "#F59E0B" }}
            >
              <FaClock />
            </div>
            <div className="stat-content">
              <p className="stat-label">Avg Wait Time</p>
              <p className="stat-value">{stats.averageWaitTime} min</p>
            </div>
          </div>
          <div className="stat-card card">
            <div
              className="stat-icon"
              style={{ background: "#E0E7FF", color: "#6366F1" }}
            >
              <FaChartLine />
            </div>
            <div className="stat-content">
              <p className="stat-label">Efficiency</p>
              <p className="stat-value">{stats.efficiency}%</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="current-patient-section">
            <div className="card">
              <h2>Current Patient</h2>
              {currentPatient ? (
                <div className="current-patient-card">
                  <div className="patient-header">
                    <div className="patient-avatar">
                      {currentPatient.patient.name.charAt(0)}
                    </div>
                    <div className="patient-info">
                      <h3>{currentPatient.patient.name}</h3>
                      <p>{currentPatient.patient.email}</p>
                      {currentPatient.patient.phone && (
                        <p>{currentPatient.patient.phone}</p>
                      )}
                    </div>
                    <span
                      className={`badge badge-${getPriorityColor(currentPatient.priority)}`}
                    >
                      {currentPatient.priority}
                    </span>
                  </div>

                  {currentPatient.reason && (
                    <div className="patient-reason">
                      <strong>Reason for Visit:</strong>
                      <p>{currentPatient.reason}</p>
                    </div>
                  )}

                  {currentPatient.priorityReason && (
                    <div className="patient-reason">
                      <strong>Priority Basis:</strong>
                      <p>{currentPatient.priorityReason}</p>
                    </div>
                  )}

                  <button
                    className="btn btn-success"
                    onClick={handleCompleteAppointment}
                    style={{ width: "100%", marginTop: "20px" }}
                  >
                    <FaCheckCircle /> Complete Appointment
                  </button>
                </div>
              ) : (
                <div className="no-patient">
                  <FaUsers className="no-patient-icon" />
                  <p>No active patient</p>
                  {queue.length > 0 && (
                    <button
                      className="btn btn-primary"
                      onClick={handleCallNext}
                    >
                      Call Next Patient
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="queue-list-section">
            <div className="card">
              <div className="queue-header">
                <h2>Queue ({queue.length})</h2>
                {!currentPatient && queue.length > 0 && (
                  <button className="btn btn-primary" onClick={handleCallNext}>
                    Call Next
                  </button>
                )}
              </div>

              {queue.length === 0 ? (
                <div className="empty-queue">
                  <p>No patients in queue</p>
                </div>
              ) : (
                <div className="queue-list">
                  {queue.map((entry) => (
                    <div key={entry.id} className="queue-item">
                      <div className="queue-position">
                        #{(entry as any).position}
                      </div>
                      <div className="queue-patient-info">
                        <h4>{entry.patient.name}</h4>
                        <p>{entry.patient.email}</p>
                        {entry.reason && (
                          <p className="reason-text">{entry.reason}</p>
                        )}
                        {entry.priorityReason && (
                          <p className="reason-text">Priority: {entry.priorityReason}</p>
                        )}
                      </div>
                      <div className="queue-meta">
                        <span
                          className={`badge badge-${getPriorityColor(entry.priority)}`}
                        >
                          {entry.priority}
                        </span>
                        <span className="wait-time">
                          <FaClock /> {entry.estimatedWaitTime || 15} min
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
