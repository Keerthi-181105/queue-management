# Database Configuration Guide

## PostgreSQL Setup

### Windows

1. **Download PostgreSQL**: Visit https://www.postgresql.org/download/windows/
2. **Install PostgreSQL**: Run the installer and follow the wizard
3. **Remember the password** you set for the `postgres` user
4. **Open pgAdmin** (installed with PostgreSQL)
5. **Create Database**:
   - Right-click on "Databases"
   - Select "Create" > "Database"
   - Name: `queue_management`
   - Click "Save"

### Linux

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE queue_management;
\q
```

### macOS

```bash
# Install using Homebrew
brew install postgresql

# Start PostgreSQL
brew services start postgresql

# Create database
createdb queue_management
```

## Database Connection

The application connects to PostgreSQL using these default settings:

```properties
URL: jdbc:postgresql://localhost:5432/queue_management
Username: postgres
Password: postgres
```

### Changing Database Credentials

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/queue_management
spring.datasource.username=your_username
spring.datasource.password=your_password
```

## Database Schema

The application automatically creates tables on first run:

- **doctors** - Doctor information
- **patients** - Patient records
- **queue_entries** - Queue management
- **appointments** - Scheduled appointments
- **analytics** - Performance metrics

## Sample Data

Sample doctors are automatically inserted on first run:

| Name                 | Specialty        | Email                         |
| -------------------- | ---------------- | ----------------------------- |
| Dr. Sarah Mitchell   | Dermatology      | sarah.mitchell@hospital.com   |
| Dr. Michael Thompson | Cardiology       | michael.thompson@hospital.com |
| Dr. Emily Rodriguez  | Pediatrics       | emily.rodriguez@hospital.com  |
| Dr. James Wilson     | Orthopedics      | james.wilson@hospital.com     |
| Dr. Lisa Chen        | Neurology        | lisa.chen@hospital.com        |
| Dr. Robert Anderson  | General Medicine | robert.anderson@hospital.com  |

## Troubleshooting

### Connection Refused

- Ensure PostgreSQL is running: `sudo systemctl status postgresql` (Linux)
- Check if port 5432 is available
- Verify firewall settings

### Authentication Failed

- Verify username and password in application.properties
- Check PostgreSQL pg_hba.conf for authentication methods

### Database Does Not Exist

- Create the database manually using pgAdmin or psql
- Or run: `CREATE DATABASE queue_management;`

## Backup and Restore

### Backup

```bash
pg_dump -U postgres queue_management > backup.sql
```

### Restore

```bash
psql -U postgres queue_management < backup.sql
```
