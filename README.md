# District Water Supply Management System - Backend Service

A production-grade, layered REST API service written in **Go (Fiber)** and **PostgreSQL** for managing water tanker distribution during seasonal shortages, handling prioritized request dispatch, driver locality familiarity, filling station congestion tracking, and OTP-verified proof of delivery.

---

## 1. Scenario & Overview

- **Selected Scenario**: District Water-Tanker System (Scenario 1)
- **Problem Statement**: During summer water shortages, municipality dispatchers face hundreds of daily requests. Informal settlements lack formal addresses, influential representatives manipulate traditional call/letter channels, drivers encounter unexpected location constraints, and residents complain of unfulfilled deliveries.
- **Primary User**: Municipal Dispatchers and District Administration Officers managing tanker allocation and delivery verification.
- **Core Value Proposition**: Transparent, algorithm-driven request prioritization, locality-familiar driver recommendation, real-time filling station availability tracking, and secure OTP verification to eliminate delivery fraud.

---

## 2. Architecture & Request Workflow

### System Architecture Workflow Diagram

```text
+-------------------+      +-------------------+      +----------------------+
|  Letter / Call /  | ---> |   REST API (Go)   | ---> | PostgreSQL Database  |
|  Online Request   |      |  Fiber Framework  |      |   (UUIDv7 Keys)      |
+-------------------+      +-------------------+      +----------------------+
                                     |
                                     v
                        +--------------------------+
                        |   Service Layer Logic    |
                        +--------------------------+
                        | 1. Priority Calculation  |
                        | 2. Driver Recommendation |
                        | 3. Station Availability  |
                        | 4. OTP Delivery Proof    |
                        +--------------------------+
```

### End-to-End Request Lifecycle

```text
[ PENDING ] ──( Calculate Priority )──> [ VERIFIED ] ──( Driver & Vehicle Assign )──> [ ASSIGNED ]
                                                                                           │
[ COMPLETED ] <──( Validate OTP Code )── [ DISPATCHED ] <──────( Dispatch Tanker )─────────┘
```

---

## 3. Project Structure

```text
.
├── Docs/                       # System documentation (Problem, Design, LLD, AI-Review)
├── cmd/
│   ├── server/main.go          # Application server entrypoint with graceful shutdown
│   └── migrate/main.go         # Database migration CLI tool
├── internal/
│   ├── config/                 # Environment configuration loader
│   ├── database/               # PostgreSQL pool connection management
│   ├── models/                 # Domain entities (Request, Driver, Vehicle, Location, etc.)
│   ├── repositories/           # Data access layer (Parameterized PostgreSQL queries)
│   ├── services/               # Core business logic (Priority, Driver Rec, OTP, Lifecycle)
│   ├── controllers/            # HTTP request/response handlers & validation
│   ├── middleware/             # Auth JWT, logging, request ID, recovery
│   ├── routes/                 # Fiber API route declarations
│   └── utils/                  # UUIDv7, Bcrypt, JWT, OTP, Logger, Response helpers
├── migrations/                 # Up/Down SQL schema migrations
├── sample.env                  # Safe environment template
├── .env                        # Local runtime environment file
├── go.mod
├── go.sum
└── README.md
```

---

## 4. Key Design Choices & Business Rules

1. **Transparent Priority Algorithm**:
   - Base Score: `50.0`
   - Public Institution (School / Hospital): `+30.0`
   - Historical Unfulfilled Pending Requests: `+20.0` per pending request
   - Private Borewell Presence: `-30.0` (penalty as alternative water source exists)
   - High Traffic Risk Area: `-5.0` (delay/accessibility constraint)
2. **Driver Recommendation**:
   - Drivers are recommended based on historical completed deliveries to the target drop-off location (locality familiarity), driver availability, total deliveries, and rating.
3. **Filling Station Congestion**:
   - Classified by active truck queue: `0-2` trucks = `AVAILABLE`, `3-5` = `BUSY`, `>5` = `VERY_BUSY`.
4. **OTP-Based Proof of Delivery**:
   - A secure 6-digit OTP is generated upon dispatch.
   - The OTP hash (SHA-256) is stored with a 15-minute expiration time.
   - Request completion requires submitting the valid OTP received by the resident.
5. **Admin Bootstrapping**:
   - On initial launch, if no administration account exists, the server automatically bootstraps an initial admin using configured `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

---

## 5. Setup & Running Instructions

### Prerequisites
- **Go**: 1.22+ installed
- **PostgreSQL**: 14+ database instance running (or Docker)

### Environment Configuration
1. Copy `sample.env` to `.env`:
   ```bash
   cp sample.env .env
   ```
2. Update `.env` with your PostgreSQL credentials:
   ```env
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/watersupply?sslmode=disable
   JWT_SECRET=super-secret-jwt-key-water-supply-management-system-2026
   APP_PORT=8080
   ```

### Run Database Migrations
To initialize the PostgreSQL schema and indexes:
```bash
go run ./cmd/migrate/main.go -direction=up
```

### Start Server
To start the REST API server:
```bash
go run ./cmd/server/main.go
```

### Run Unit Tests
```bash
go test ./... -v
```

---

## 6. End-to-End API Usage (Curl Example Workflow)

### 1. Admin Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mail": "admin@water.gov",
    "password": "AdminPassword123!"
  }'
```

### 2. Create Drop-Off Location
```bash
curl -X POST http://localhost:8080/drop-off-locations \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Public Hospital Sector 4, Main Ward",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "landmark": "Near Gate 2",
    "hasPrivateBorewell": false,
    "trafficRisk": "Low",
    "normalTravelTime": 15,
    "isSchoolOrHospital": true
  }'
```

### 3. Register Requester Person
```bash
curl -X POST http://localhost:8080/persons \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajesh Kumar",
    "contactNumber": "+919876543210",
    "address": "Sector 4, Community Block A"
  }'
```

### 4. Create Water Supply Request
```bash
curl -X POST http://localhost:8080/requests \
  -H "Content-Type: application/json" \
  -d '{
    "requestType": "Online",
    "requesterId": "<PERSON_ID>",
    "dropOffLocationId": "<DROP_OFF_LOCATION_ID>"
  }'
```

### 5. Calculate Priority Score
```bash
curl -X POST http://localhost:8080/requests/<REQUEST_ID>/calculate-priority
```

### 6. Get Recommended Drivers for Location
```bash
curl -X GET "http://localhost:8080/drivers/recommended?dropOffLocationId=<DROP_OFF_LOCATION_ID>"
```

### 7. Assign Driver, Vehicle & Filling Station
```bash
curl -X POST http://localhost:8080/requests/<REQUEST_ID>/assign \
  -H "Content-Type: application/json" \
  -d '{
    "driverId": "<DRIVER_ID>",
    "vehicleId": "<VEHICLE_ID>",
    "fillingStationId": "<FILLING_STATION_ID>"
  }'
```

### 8. Dispatch Tanker Request
```bash
curl -X POST http://localhost:8080/requests/<REQUEST_ID>/dispatch
```

### 9. Generate Delivery OTP
```bash
curl -X POST http://localhost:8080/requests/<REQUEST_ID>/generate-otp
```

### 10. Complete Request via OTP
```bash
curl -X POST http://localhost:8080/requests/<REQUEST_ID>/complete \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "<GENERATED_OTP>"
  }'
```

---

## 7. Assumptions & Trade-offs

- **Offline Sync & Multi-channel Inputs**: Letter/Call requests are ingested by municipal representatives who submit digital requests on behalf of residents.
- **Geographic Drop-Off Locations**: Destinations are tied to GPS coordinates and landmarks to accommodate informal settlements without standard street addresses.
- **Driver Phones**: Supports drivers with basic non-smartphone devices via landmark-based navigation guidance.

---

## 8. What Would Be Done With 5 Additional Hours

1. **SMS/WhatsApp Gateway Integration**: Automatically transmit generated delivery OTPs directly to residents via SMS/WhatsApp API.
2. **PostGIS Spatial Queries**: Enable spatial distance calculation between available vehicles, filling stations, and drop-off points.
3. **Web Dashboard UI**: Build a responsive React/Vite dashboard for real-time tanker tracking and dispatch visualization.
