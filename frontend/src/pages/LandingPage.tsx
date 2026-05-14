import { AxiosError } from "axios";
import { FormEvent, useState } from "react";
import {
  FaCalendarCheck,
  FaChartLine,
  FaClock,
  FaUserMd,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { doctorAPI, patientAPI } from "../services/api";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, try to find as doctor
      try {
        const doctorResponse = await doctorAPI.getByEmail(email);
        if (doctorResponse.data) {
          toast.success("Welcome, Doctor!");
          navigate(`/doctor/${doctorResponse.data.id}`);
          return;
        }
      } catch (error) {
        // Doctor not found, try patient
      }

      // Try to find as patient
      try {
        const patientResponse = await patientAPI.getByEmail(email);
        if (patientResponse.data) {
          toast.success("Welcome back!");
          navigate(`/patient/${patientResponse.data.id}`);
          return;
        }
      } catch (error) {
        // Patient not found, create new patient
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          if (!name.trim()) {
            toast.error("Please enter your name to create a new account.");
            setLoading(false);
            return;
          }
          const newPatient = await patientAPI.create({ name, email });
          toast.success("Account created successfully!");
          navigate(`/patient/${newPatient.data.id}`);
          return;
        } else {
          throw error;
        }
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      <div className="landing-container fade-in">
        <header className="landing-header">
          <div className="logo-section">
            <FaUserMd className="logo-icon" />
            <h1>Healthcare Queue Management</h1>
          </div>
          <p className="tagline">Smart, Efficient, Patient-Centered Care</p>
        </header>

        <div className="login-section">
          <div className="login-card card">
            <div className="login-header">
              <FaUserMd className="header-icon" />
              <h2>Welcome Back</h2>
              <p className="login-subtitle">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name (required for new patients)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-login"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>

        </div>

        <div className="features-section">
          <h2>Why Choose Our System?</h2>
          <div className="feature-grid">
            <div className="feature-card card">
              <FaClock className="feature-icon" />
              <h3>Save Time</h3>
              <p>Reduce wait times with smart queue management</p>
            </div>
            <div className="feature-card card">
              <FaCalendarCheck className="feature-icon" />
              <h3>Simple Scheduling</h3>
              <p>Manage appointments with your preferred doctor</p>
            </div>
            <div className="feature-card card">
              <FaChartLine className="feature-icon" />
              <h3>Analytics</h3>
              <p>Track performance and optimize patient flow</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
