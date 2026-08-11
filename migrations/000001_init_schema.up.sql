CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    landmark TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drop_off_locations (
    id UUID PRIMARY KEY REFERENCES locations(id) ON DELETE CASCADE,
    has_private_borewell BOOLEAN NOT NULL DEFAULT FALSE,
    traffic_risk VARCHAR(20) NOT NULL DEFAULT 'Low',
    normal_travel_time INT NOT NULL DEFAULT 0,
    is_school_or_hospital BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS normal_persons (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    address TEXT,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS district_managers (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    normal_person_id UUID REFERENCES normal_persons(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS administrations (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    mail VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    contact_number VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'Dispatcher',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    phone_type VARCHAR(20) NOT NULL DEFAULT 'Basic',
    total_rating DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    total_deliveries INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Available',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    current_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Available',
    assigned_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS filling_stations (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    current_truck_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY,
    request_type VARCHAR(20) NOT NULL,
    requester_id UUID NOT NULL REFERENCES normal_persons(id) ON DELETE CASCADE,
    drop_off_location_id UUID NOT NULL REFERENCES drop_off_locations(id) ON DELETE CASCADE,
    filling_station_id UUID REFERENCES filling_stations(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    priority_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    otp_hash TEXT,
    otp_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    dispatched_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_requests_driver ON requests(driver_id);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON requests(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_requests_drop_off_loc ON requests(drop_off_location_id);
CREATE INDEX IF NOT EXISTS idx_filling_stations_truck_count ON filling_stations(current_truck_count);
CREATE INDEX IF NOT EXISTS idx_requests_completed_driver_loc ON requests(driver_id, drop_off_location_id) WHERE status = 'COMPLETED';