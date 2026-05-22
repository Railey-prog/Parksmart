
# ParkSmart: Smart Campus Parking Allocation System

This is the frontend prototype for the ParkSmart system, built with React, TypeScript, Tailwind CSS, and Framer Motion. It features a modern "Glassmorphism" design and implements role-based access control for Admins, Students/Faculty, and Security Staff.

## Current State (Frontend Prototype)
The application currently uses React Context (`AuthContext`, `ParkingContext`, `NotificationContext`) to simulate a backend. It includes mock data and `setInterval` loops to simulate real-time slot occupancy changes and reservation expirations.

## Connecting to a Python/Flask Backend

To convert this prototype into a full-stack application, you need to replace the React Context logic with API calls to your Flask backend.

### 1. Authentication (JWT)
Replace the mock `login` and `register` functions in `AuthContext.tsx` with `fetch` or `axios` calls to your Flask API.
- **POST /api/auth/login**: Send email/password, receive JWT token and user object.
- **POST /api/auth/register**: Send registration data.
Store the JWT in `localStorage` or an HTTP-only cookie, and attach it as a `Bearer` token in the `Authorization` header for all subsequent API requests.

### 2. Real-time Updates (WebSockets / Socket.IO)
Currently, `ParkingContext.tsx` uses a `setInterval` to randomly change slot statuses. 
To implement real real-time updates:
1. Install `socket.io-client` in the React app.
2. Connect to your Flask-SocketIO server.
3. Listen for events like `slot_status_changed`, `reservation_expired`, or `new_notification`.
4. Update the React state when these events are received.

### 3. API Endpoints Needed
Your Flask backend should implement the following REST endpoints:

**Zones & Slots**
- `GET /api/zones` - Get all zones and their slots
- `PUT /api/slots/<id>/status` - Update slot status (Admin/Security)

**Reservations**
- `POST /api/reservations` - Create a new reservation
- `DELETE /api/reservations/<id>` - Cancel a reservation
- `GET /api/reservations/user/<id>` - Get user's reservations

**Permits**
- `GET /api/permits/user/<id>` - Get user's permit
- `POST /api/permits/verify` - Verify a permit by QR data (Security)
- `PUT /api/permits/<id>/status` - Approve/revoke permit (Admin)

**Analytics (Python Pandas/Scikit-learn integration)**
- `GET /api/analytics/peak-hours` - Returns predicted peak hours data
- `GET /api/analytics/occupancy-trend` - Returns historical trend data

### 4. Predictive Analytics Module
The user requested predictive analytics using Python (Pandas, NumPy, Scikit-learn).
In your Flask backend, you can create a background job or an endpoint that:
1. Queries historical parking logs from PostgreSQL/MySQL.
2. Uses Pandas to clean and aggregate the data by hour/day.
3. Uses a Scikit-learn model (e.g., Random Forest Regressor) to predict future occupancy based on time of day, day of week, and academic calendar events.
4. Serves this prediction via the `/api/analytics/peak-hours` endpoint, which the React frontend will display in the `PeakHoursChart` component.

### 5. Database Schema Recommendation
- **Users**: id, name, email, password_hash, role, status
- **Zones**: id, name, capacity
- **Slots**: id, zone_id, name, status, is_ev, is_accessible
- **Reservations**: id, user_id, slot_id, start_time, end_time, status
- **Permits**: id, user_id, permit_number, vehicle_plate, expiry_date, status
- **Logs**: id, timestamp, type, description, vehicle_plate
