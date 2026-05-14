import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaChartLine,
  FaClock,
  FaDollarSign,
  FaSmile,
  FaTrophy,
  FaUsers,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { Doctor, doctorAPI, queueAPI } from "../services/api";
import "./AnalyticsDashboard.css";

interface Analytics {
  totalPatients: number;
  averageWaitTime: number;
  satisfactionScore: number;
  revenue: number;
  completedAppointments: number;
  efficiencyScore: number;
}

interface HourlyData {
  hour: string;
  patients: number;
}

interface SpecialtyPerformance {
  specialty: string;
  patients: number;
  percentage: number;
}

function AnalyticsDashboard() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalPatients: 0,
    averageWaitTime: 0,
    satisfactionScore: 0,
    revenue: 0,
    completedAppointments: 0,
    efficiencyScore: 0,
  });
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [specialtyPerformance, setSpecialtyPerformance] = useState<
    SpecialtyPerformance[]
  >([]);
  const [topDoctors, setTopDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [doctorId]);

  const loadAnalyticsData = async () => {
    if (!doctorId) return;

    try {
      const doctorResponse = await doctorAPI.getById(parseInt(doctorId));
      setDoctor(doctorResponse.data);

      // Get queue data for analytics
      const queueResponse = await queueAPI.getByDoctor(parseInt(doctorId));
      const queueData = queueResponse.data;

      const completed = queueData.filter(
        (entry) => entry.status === "COMPLETED",
      );
      const totalWaitTime = completed.reduce(
        (sum, entry) => sum + (entry.estimatedWaitTime || 15),
        0,
      );

      // Calculate analytics
      const calculatedAnalytics: Analytics = {
        totalPatients: queueData.length,
        averageWaitTime:
          completed.length > 0
            ? Math.round(totalWaitTime / completed.length)
            : 15,
        satisfactionScore: 87 + Math.floor(Math.random() * 10),
        revenue: completed.length * 150,
        completedAppointments: completed.length,
        efficiencyScore: Math.min(95, 70 + completed.length * 3),
      };

      setAnalytics(calculatedAnalytics);

      // Generate hourly data (simulated)
      setHourlyData(generateHourlyData());

      // Generate specialty performance (simulated)
      setSpecialtyPerformance(generateSpecialtyData());

      // Load top doctors
      const allDoctors = await doctorAPI.getAll();
      const topPerformers = allDoctors.data
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);
      setTopDoctors(topPerformers);
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  const generateHourlyData = (): HourlyData[] => {
    const hours = [
      "9 AM",
      "10 AM",
      "11 AM",
      "12 PM",
      "1 PM",
      "2 PM",
      "3 PM",
      "4 PM",
      "5 PM",
    ];
    return hours.map((hour) => ({
      hour,
      patients: Math.floor(Math.random() * 10) + 3,
    }));
  };

  const generateSpecialtyData = (): SpecialtyPerformance[] => {
    return [
      { specialty: "Dermatology", patients: 45, percentage: 23 },
      { specialty: "Cardiology", patients: 38, percentage: 19 },
      { specialty: "Pediatrics", patients: 35, percentage: 18 },
      { specialty: "Orthopedics", patients: 32, percentage: 16 },
      { specialty: "Neurology", patients: 28, percentage: 14 },
      { specialty: "General Medicine", patients: 22, percentage: 10 },
    ];
  };

  if (!doctor) {
    return (
      <div className="analytics-dashboard">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard fade-in">
      <div className="analytics-container">
        <button
          className="btn btn-secondary back-btn"
          onClick={() => navigate(`/doctor/${doctorId}`)}
        >
          <FaArrowLeft /> Back to Dashboard
        </button>

        <header className="analytics-header">
          <div>
            <h1>Analytics Dashboard</h1>
            <p className="subtitle">
              Dr. {doctor.name} - {doctor.specialty}
            </p>
          </div>
        </header>

        <div className="metrics-grid">
          <div className="metric-card card">
            <div className="metric-icon" style={{ background: "#DBEAFE" }}>
              <FaUsers style={{ color: "#3B82F6" }} />
            </div>
            <div className="metric-content">
              <p className="metric-label">Total Patients</p>
              <p className="metric-value">{analytics.totalPatients}</p>
              <p className="metric-change positive">+12% from last week</p>
            </div>
          </div>

          <div className="metric-card card">
            <div className="metric-icon" style={{ background: "#FEF3C7" }}>
              <FaClock style={{ color: "#F59E0B" }} />
            </div>
            <div className="metric-content">
              <p className="metric-label">Avg Wait Time</p>
              <p className="metric-value">{analytics.averageWaitTime} min</p>
              <p className="metric-change negative">-5% improvement</p>
            </div>
          </div>

          <div className="metric-card card">
            <div className="metric-icon" style={{ background: "#D1FAE5" }}>
              <FaSmile style={{ color: "#10B981" }} />
            </div>
            <div className="metric-content">
              <p className="metric-label">Satisfaction</p>
              <p className="metric-value">{analytics.satisfactionScore}%</p>
              <p className="metric-change positive">+3% this month</p>
            </div>
          </div>

          <div className="metric-card card">
            <div className="metric-icon" style={{ background: "#E0E7FF" }}>
              <FaDollarSign style={{ color: "#6366F1" }} />
            </div>
            <div className="metric-content">
              <p className="metric-label">Revenue</p>
              <p className="metric-value">
                ${analytics.revenue.toLocaleString()}
              </p>
              <p className="metric-change positive">+8% growth</p>
            </div>
          </div>
        </div>

        <div className="analytics-content">
          <div className="chart-section">
            <div className="card">
              <h2>Hourly Patient Flow</h2>
              <div className="bar-chart">
                {hourlyData.map((data, index) => (
                  <div key={index} className="bar-item">
                    <div
                      className="bar"
                      style={{ height: `${data.patients * 10}px` }}
                      title={`${data.patients} patients`}
                    >
                      <span className="bar-value">{data.patients}</span>
                    </div>
                    <span className="bar-label">{data.hour}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2>Specialty Performance</h2>
              <div className="specialty-list">
                {specialtyPerformance.map((item, index) => (
                  <div key={index} className="specialty-item">
                    <div className="specialty-info">
                      <span className="specialty-name">{item.specialty}</span>
                      <span className="specialty-count">
                        {item.patients} patients
                      </span>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="specialty-percentage">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="side-section">
            <div className="card">
              <h2>
                <FaChartLine /> Key Metrics
              </h2>
              <div className="metrics-list">
                <div className="metric-item">
                  <span className="metric-item-label">
                    Completed Appointments
                  </span>
                  <span className="metric-item-value">
                    {analytics.completedAppointments}
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-item-label">Efficiency Score</span>
                  <span className="metric-item-value success">
                    {analytics.efficiencyScore}%
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-item-label">No-Show Rate</span>
                  <span className="metric-item-value">4.2%</span>
                </div>
                <div className="metric-item">
                  <span className="metric-item-label">
                    Avg Consultation Time
                  </span>
                  <span className="metric-item-value">18 min</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h2>
                <FaTrophy /> Top Performing Doctors
              </h2>
              <div className="doctors-ranking">
                {topDoctors.map((doc, index) => (
                  <div key={doc.id} className="ranking-item">
                    <div className="rank-badge">#{index + 1}</div>
                    <div className="doctor-ranking-info">
                      <span className="doctor-ranking-name">{doc.name}</span>
                      <span className="doctor-ranking-specialty">
                        {doc.specialty}
                      </span>
                    </div>
                    <div className="doctor-rating-badge">⭐ {doc.rating}</div>
                  </div>
                ))}
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
