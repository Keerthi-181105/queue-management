import { AxiosError } from "axios";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaSearch,
  FaStar,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  appointmentAPI,
  doctorAPI,
  patientAPI,
  Doctor,
  Patient,
} from "../services/api";
import "./BookingPage.css";

interface BookingFormState {
  name: string;
  email: string;
  phone: string;
  reason: string;
}

const timeSlots = [
  { label: "10:30 AM", value: "10:30" },
  { label: "11:45 AM", value: "11:45" },
  { label: "2:15 PM", value: "14:15" },
  { label: "3:30 PM", value: "15:30" },
];

function BookingPage() {
  const navigate = useNavigate();
  const { patientId, doctorId } = useParams<{ patientId: string; doctorId: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [formState, setFormState] = useState<BookingFormState>({
    name: "",
    email: "",
    phone: "",
    reason: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadBookingData = async () => {
      if (!patientId || !doctorId) {
        return;
      }

      try {
        const [patientResponse, doctorResponse] = await Promise.all([
          patientAPI.getById(parseInt(patientId)),
          doctorAPI.getById(parseInt(doctorId)),
        ]);

        setPatient(patientResponse.data);
        setDoctor(doctorResponse.data);
        setFormState({
          name: patientResponse.data.name || "",
          email: patientResponse.data.email || "",
          phone: patientResponse.data.phone || "",
          reason: "",
        });
      } catch (error) {
        console.error("Error loading booking data:", error);
        toast.error("Unable to load booking details");
      }
    };

    loadBookingData();
  }, [patientId, doctorId]);

  const nextSlot = useMemo(() => {
    const selectedSlot = timeSlots[(doctor?.id ?? 1) % timeSlots.length];
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 1 + ((doctor?.id ?? 1) % 3));

    return {
      display: selectedSlot.label,
      time: selectedSlot.value,
      date: appointmentDate.toISOString().split("T")[0],
    };
  }, [doctor]);

  const handleChange = (field: keyof BookingFormState, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!patientId || !doctorId || !patient || !doctor) {
      toast.error("Booking details are not ready yet");
      return;
    }

    if (!formState.name.trim() || !formState.email.trim() || !formState.reason.trim()) {
      toast.error("Please complete the required fields");
      return;
    }

    setSaving(true);

    try {
      const updatedPatient = {
        name: formState.name.trim(),
        email: formState.email.trim(),
        phone: formState.phone.trim() || undefined,
      };

      if (
        updatedPatient.name !== patient.name ||
        updatedPatient.email !== patient.email ||
        (updatedPatient.phone || "") !== (patient.phone || "")
      ) {
        await patientAPI.update(parseInt(patientId), updatedPatient);
      }

      await appointmentAPI.create({
        patient: { id: parseInt(patientId) },
        doctor: { id: parseInt(doctorId) },
        appointmentDate: nextSlot.date,
        appointmentTime: nextSlot.time,
        status: "SCHEDULED",
        reason: formState.reason.trim(),
      });

      toast.success("Appointment booked successfully");
      navigate(`/patient/${patientId}`);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error("Error booking appointment:", error);
      toast.error(axiosError.response?.data?.message || "Failed to book appointment");
    } finally {
      setSaving(false);
    }
  };

  if (!patient || !doctor) {
    return (
      <div className="booking-page">
        <div className="booking-shell">
          <div className="booking-loading card">Loading booking details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-shell fade-in">
        <button className="booking-back-button" onClick={() => navigate(-1)} type="button">
          <FaArrowLeft />
          Back
        </button>

        <header className="booking-header card">
          <h1>Book Appointment</h1>
          <p>Complete your booking with Dr. {doctor.name.replace(/^Dr\.\s*/i, "")}</p>
        </header>

        <section className="doctor-summary card">
          <div className="doctor-avatar">
            {doctor.name
              .split(" ")
              .map((part) => part[0])
              .join("")}
          </div>
          <div className="doctor-summary-main">
            <h2>Dr. {doctor.name.replace(/^Dr\.\s*/i, "")}</h2>
            <p>{doctor.specialty}</p>
            <div className="doctor-summary-meta">
              <span>
                <FaStar /> {doctor.rating} Rating
              </span>
              <span>
                <FaCalendarAlt /> {doctor.experience}+ years Experience
              </span>
              <span className="status-pill">Available</span>
            </div>
          </div>
        </section>

        <form className="booking-form card" onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>Patient Information</h2>
            <p>Please fill in your details to complete the booking</p>
          </div>

          <div className="form-grid">
            <label className="field-group">
              <span>Full Name *</span>
              <input
                type="text"
                value={formState.name}
                onChange={(event) => handleChange("name", event.target.value)}
                placeholder="Enter your full name"
                required
              />
            </label>

            <label className="field-group">
              <span>Email Address *</span>
              <input
                type="email"
                value={formState.email}
                onChange={(event) => handleChange("email", event.target.value)}
                placeholder="Enter your email"
                required
              />
            </label>

            <label className="field-group field-group-full">
              <span>Phone Number (Optional)</span>
              <input
                type="tel"
                value={formState.phone}
                onChange={(event) => handleChange("phone", event.target.value)}
                placeholder="Enter your phone number"
              />
            </label>

            <label className="field-group field-group-full">
              <span>Reason for Visit</span>
              <textarea
                rows={4}
                value={formState.reason}
                onChange={(event) => handleChange("reason", event.target.value)}
                placeholder="Briefly describe your symptoms or reason for the visit"
                required
              />
            </label>
          </div>

          <div className="slot-summary">
            <div className="slot-title">
              <FaClock /> Next Available Slot
            </div>
            <p>
              Your appointment is scheduled for: <strong>{nextSlot.display}</strong>
            </p>
            <p>You will receive email and SMS confirmations once the appointment is booked.</p>
          </div>

          <button className="btn btn-primary booking-submit" type="submit" disabled={saving}>
            <FaSearch /> {saving ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookingPage;
