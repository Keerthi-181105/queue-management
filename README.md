# Healthcare Queue Management System

A comprehensive smart queue management system for healthcare facilities, featuring separate patient and doctor dashboards with real-time queue tracking, appointment booking, and advanced analytics.

## 🏥 Features

### Patient Portal

- **Join Queue**: Select a doctor and join the queue with real-time position tracking
- **Live Updates**: See your position, estimated wait time, and status updates
- **Smart Notifications**: Get notified when it's almost your turn
- **Appointment Booking**: Schedule appointments with preferred doctors
- **Doctor Search**: Find doctors by specialty with ratings and availability

### Doctor Dashboard

- **Queue Management**: View all patients in queue with priority levels
- **Call Next Patient**: Efficiently manage patient flow
- **Real-time Stats**: Monitor patient count, wait times, and efficiency
- **Patient Details**: View comprehensive patient information
- **Quick Actions**: Complete appointments with one click

### Analytics Dashboard

- **Performance Metrics**: Track total patients, wait times, satisfaction, and revenue
- **Hourly Patient Flow**: Visualize patient distribution throughout the day
- **Specialty Performance**: Compare performance across different specialties
- **Top Performers**: See ranking of top-rated doctors
- **Smart Recommendations**: AI-powered insights for optimization

### Booking System

- **Doctor Directory**: Browse doctors by specialty with detailed profiles
- **Search & Filter**: Find doctors by name, specialty, or availability
- **Appointment Scheduling**: Select date, time, and provide consultation reason
- **Email Integration**: Book appointments with email confirmation

## 🛠️ Technology Stack

### Backend

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Data JPA**
- **PostgreSQL** (Database)
- **Maven** (Build tool)

### Frontend

- **React 18.2.0**
- **Vite** (Build tool)
- **React Router** (Navigation)
- **Axios** (HTTP client)
- **React Icons**
- **React Toastify** (Notifications)

## 📋 Prerequisites

Before running this application, make sure you have:

- **Java 17** or higher installed
- **Maven 3.6+** installed
- **Node.js 18+** and **npm** installed
- **PostgreSQL 12+** installed and running

## 🚀 Installation & Setup

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE queue_management;
```

Update database credentials in `backend/src/main/resources/application.properties` if needed:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/queue_management
spring.datasource.username=postgres
spring.datasource.password=postgres
```

### 2. Backend Setup

Navigate to the backend directory and run:

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend server will start on `http://localhost:8080`

**Note**: Sample doctors are automatically initialized on first run:

- Dr. Sarah Mitchell (Dermatology)
- Dr. Michael Thompson (Cardiology)
- Dr. Emily Rodriguez (Pediatrics)
- Dr. James Wilson (Orthopedics)
- Dr. Lisa Chen (Neurology)
- Dr. Robert Anderson (General Medicine)

### 3. Frontend Setup

Navigate to the frontend directory and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

## 🎯 Usage

### For Patients

1. **Visit** `http://localhost:3000`
2. **Select** "Patient Portal"
3. **Enter** your name and email
4. **Choose** a doctor and join the queue OR book an appointment
5. **Track** your position and wait time in real-time

### For Doctors

1. **Visit** `http://localhost:3000`
2. **Select** "Doctor Dashboard"
3. **Login** with one of the sample doctor emails:
   - `sarah.mitchell@hospital.com`
   - `michael.thompson@hospital.com`
   - `emily.rodriguez@hospital.com`
   - `james.wilson@hospital.com`
   - `lisa.chen@hospital.com`
   - `robert.anderson@hospital.com`
4. **Manage** your queue and call next patient
5. **View** analytics and performance metrics

## 📁 Project Structure

```
queue-Management/
├── backend/
│   ├── src/main/java/com/healthcare/queuemanagement/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/      # REST API controllers
│   │   ├── model/           # Entity models
│   │   ├── repository/      # Data repositories
│   │   ├── service/         # Business logic
│   │   └── QueueManagementApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
└── frontend/
    ├── src/
    │   ├── pages/           # Page components
    │   │   ├── LandingPage.jsx
    │   │   ├── PatientDashboard.jsx
    │   │   ├── DoctorDashboard.jsx
    │   │   ├── BookingPage.jsx
    │   │   └── AnalyticsDashboard.jsx
    │   ├── services/        # API services
    │   ├── App.jsx          # Main app component
    │   └── main.jsx         # Entry point
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## 🔌 API Endpoints

### Doctors

- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/{id}` - Get doctor by ID
- `GET /api/doctors/email/{email}` - Get doctor by email
- `GET /api/doctors/specialty/{specialty}` - Get doctors by specialty
- `POST /api/doctors` - Create doctor
- `PUT /api/doctors/{id}` - Update doctor

### Patients

- `GET /api/patients` - Get all patients
- `GET /api/patients/{id}` - Get patient by ID
- `GET /api/patients/email/{email}` - Get patient by email
- `POST /api/patients` - Create patient
- `PUT /api/patients/{id}` - Update patient

### Queue

- `GET /api/queue` - Get all queue entries
- `GET /api/queue/doctor/{doctorId}` - Get queue by doctor
- `GET /api/queue/doctor/{doctorId}/active` - Get active queue
- `POST /api/queue` - Add to queue
- `POST /api/queue/doctor/{doctorId}/next` - Call next patient
- `PUT /api/queue/{id}/complete` - Complete appointment
- `DELETE /api/queue/{id}` - Cancel queue entry

### Appointments

- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/doctor/{doctorId}?date={date}` - Get by doctor and date
- `GET /api/appointments/patient/{patientId}` - Get by patient
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/{id}` - Update appointment

### Analytics

- `GET /api/analytics` - Get all analytics
- `GET /api/analytics/doctor/{doctorId}` - Get by doctor
- `GET /api/analytics/range?startDate={start}&endDate={end}` - Get by date range
- `POST /api/analytics` - Create/update analytics

## 🎨 Design Features

- **Medical-themed color palette** with professional blues and greens
- **Card-based layouts** with subtle shadows and gradients
- **Real-time updates** with polling every 3-5 seconds
- **Toast notifications** for important events
- **Responsive design** for mobile and desktop
- **Smooth animations** for enhanced UX
- **Status color coding** for quick visual feedback

## 🔒 Security Notes

This is a demonstration application. For production use, you should:

- Implement proper authentication and authorization
- Add JWT tokens for secure API access
- Encrypt sensitive data
- Add input validation and sanitization
- Implement rate limiting
- Use HTTPS for all communications
- Add logging and monitoring

## 🚧 Future Enhancements

- Real-time WebSocket updates instead of polling
- SMS/Email notification integration
- Patient medical records management
- Prescription management
- Payment integration
- Mobile app (React Native)
- Advanced analytics with machine learning
- Multi-language support
- Video consultation integration

## 📝 License

This project is created for educational and demonstration purposes.

## 👨‍💻 Author

Healthcare Queue Management System - 2026

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- React team for the powerful UI library
- PostgreSQL for the robust database
- All contributors to the open-source libraries used

---

**Happy Queue Managing! 🏥**
#   q u e u e - m a n a g e m e n t  
 