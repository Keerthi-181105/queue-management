import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import BookingPage from "./pages/BookingPage";
import LandingPage from "./pages/LandingPage";
import PatientDashboard from "./pages/PatientDashboard";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/patient/:patientId" element={<PatientDashboard />} />
          <Route path="/doctor/:doctorId" element={<DoctorDashboard />} />
          <Route path="/booking/:patientId/:doctorId" element={<BookingPage />} />
          <Route path="/analytics/:doctorId" element={<AnalyticsDashboard />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;
