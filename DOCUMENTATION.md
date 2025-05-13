# Clocking App Documentation

## System Overview
The Clocking App is a full-stack application for employee time tracking with:
- React frontend (Material-UI)
- Node.js/Express backend
- MySQL database
- JWT authentication
- Role-based access control (admin/user)

## Core Features
1. **Time Tracking**
   - Clock in/out with location tracking
   - Automatic break time calculations (default 30 mins)
   - Records management with hours worked calculation

2. **Admin Features**
   - User management
   - Records summary and reporting
   - Correction request approval workflow

3. **User Features**
   - View clock records
   - Submit correction requests
   - View profile information

## System Architecture

### Frontend (React)
- **Routes**:
  - `/` - Clock in/out interface
  - `/records` - View clock records
  - `/admin` - Admin dashboard
  - `/login`, `/register` - Authentication

- **State Management**:
  - Redux for global state
  - RTK Query for API calls

### Backend (Node.js/Express)
- **API Endpoints**:
  - `/api/auth` - Authentication
  - `/api/clock` - Time tracking
  - `/api/admin` - Admin functions
  - `/api/reminders` - Scheduled reminders

- **Database**:
  - MySQL with Knex.js query builder
  - Objection.js ORM

## Database Schema
Key tables:
- `users` - User accounts
- `clock_records` - Time tracking entries
- `correction_requests` - Time adjustment requests
- `audit_logs` - System activity tracking

## Deployment
The system is deployed using PM2 with:
- Frontend served as static files on port 3001
- Backend running on port 13000
- CORS configured for `clock.mmcwellness.ca`

### Production Environment Notes
1. **Critical Dependencies**:
   - Running alongside OPENOSP OSCAR EMR (in Docker)
   - MySQL database (credentials in environment variables)

2. **Security Considerations**:
   - All database operations are parameterized
   - Passwords hashed with bcrypt
   - JWT tokens with 24h expiration
   - Helmet middleware for security headers

3. **Maintenance**:
   - Database backups should be performed regularly
   - Logs should be monitored for errors
   - Updates should be tested in staging first

## Timezone Handling
- All timestamps are stored in UTC in the database
- The system converts to America/Vancouver timezone for display and calculations
- This ensures consistent time reporting across different devices/locations

## Environment Variables
Required configuration:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET` for authentication
- `PORT` for server (default 13000)
- `CORS_ORIGIN` for frontend URL

## Important Notes
1. This is a production system - changes should be carefully tested
2. The system integrates with existing OPENOSP OSCAR EMR
3. Database migrations should be run for schema changes
4. Admin users can be created via the `/api/auth/register` endpoint
