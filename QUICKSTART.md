# Quick Start Guide

## Prerequisites Check

Before starting, verify you have:

```bash
# Check Java version (should be 17+)
java -version

# Check Maven version
mvn -version

# Check Node.js version (should be 18+)
node -v

# Check npm version
npm -v

# Check PostgreSQL is running
psql --version
```

## Step-by-Step Setup

### 1. Clone/Download the Project

Navigate to the project directory:

```bash
cd queue-Management
```

### 2. Setup PostgreSQL Database

**Option A - Command Line (Recommended):**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE queue_management;

# Exit
\q
```

**Option B - pgAdmin:**

1. Open pgAdmin
2. Right-click Databases → Create → Database
3. Name: `queue_management`
4. Save

### 3. Start Backend

Open a terminal in the project root:

**Windows:**

```bash
cd backend
set JAVA_HOME=C:\Program Files\Java\jdk-24
mvnw.cmd spring-boot:run
```

**Linux/Mac:**

```bash
cd backend
./mvnw spring-boot:run
```

Wait for message: `Started QueueManagementApplication`

Backend runs on: `http://localhost:8080`

### 4. Start Frontend

Open a NEW terminal in the project root:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

## Testing the Application

### Test as Patient

1. Open browser: `http://localhost:3000`
2. Click **"Continue as Patient"**
3. Enter:
   - Name: `John Doe`
   - Email: `john@example.com`
4. Click **Continue**
5. Select a doctor and join queue
6. Watch real-time updates!

### Test as Doctor

1. Open browser: `http://localhost:3000`
2. Click **"Continue as Doctor"**
3. Enter email: `sarah.mitchell@hospital.com`
4. Click **Continue**
5. Try:
   - Call Next Patient
   - Complete Appointment
   - View Analytics

## Available Sample Doctors

Use these emails to login as doctors:

- **Dermatology**: `sarah.mitchell@hospital.com`
- **Cardiology**: `michael.thompson@hospital.com`
- **Pediatrics**: `emily.rodriguez@hospital.com`
- **Orthopedics**: `james.wilson@hospital.com`
- **Neurology**: `lisa.chen@hospital.com`
- **General Medicine**: `robert.anderson@hospital.com`

## Common Issues

### Backend won't start

- **Error**: `Port 8080 already in use`
  - Solution: Stop other applications on port 8080 or change port in `application.properties`

- **Error**: `Connection refused to PostgreSQL`
  - Solution: Make sure PostgreSQL is running
  - Windows: Check Services
  - Linux/Mac: `sudo systemctl status postgresql`

### Frontend won't start

- **Error**: `Port 3000 already in use`
  - Solution: Kill process or use different port:
    ```bash
    # In vite.config.js, change:
    server: { port: 3001 }
    ```

- **Error**: `Module not found`
  - Solution: Delete node_modules and reinstall:
    ```bash
    rm -rf node_modules package-lock.json
    npm install
    ```

### Database connection issues

- **Error**: `Authentication failed`
  - Solution: Update credentials in `backend/src/main/resources/application.properties`
  ```properties
  spring.datasource.username=YOUR_USERNAME
  spring.datasource.password=YOUR_PASSWORD
  ```

## Stopping the Application

1. **Stop Frontend**: Press `Ctrl + C` in frontend terminal
2. **Stop Backend**: Press `Ctrl + C` in backend terminal

## Next Steps

- 📖 Read the full [README.md](README.md) for detailed documentation
- 🗄️ Check [DATABASE_SETUP.md](DATABASE_SETUP.md) for database configuration
- 🔌 Test API endpoints using Postman or curl
- 🎨 Customize the UI by editing CSS files in `frontend/src/pages/`

## Need Help?

- Check console logs for errors
- Verify all services are running
- Ensure database is accessible
- Check firewall settings

---

**You're all set! Happy coding! 🚀**
