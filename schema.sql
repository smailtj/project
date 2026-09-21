-- PostgreSQL schema for the OCP Zone 4 fleet management API.

CREATE TABLE equipment (
    sap_id VARCHAR(32) PRIMARY KEY,
    equipment_code VARCHAR(64) NOT NULL UNIQUE,
    type VARCHAR(64) NOT NULL,
    model VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'UNKNOWN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE telemetry (
    timestamp TIMESTAMPTZ NOT NULL,
    sap_id VARCHAR(32) NOT NULL REFERENCES equipment (sap_id),
    engine_temp DOUBLE PRECISION,
    hydraulic_pressure DOUBLE PRECISION,
    speed DOUBLE PRECISION,
    payload DOUBLE PRECISION,
    PRIMARY KEY (timestamp, sap_id)
);

CREATE INDEX idx_telemetry_timestamp ON telemetry (timestamp);
CREATE INDEX idx_telemetry_sap_id_timestamp ON telemetry (sap_id, timestamp DESC);

CREATE TABLE shift_logs (
    date DATE NOT NULL,
    shift_type VARCHAR(16) NOT NULL CHECK (shift_type IN ('Matin', 'Soir', 'Nuit')),
    sap_id VARCHAR(32) NOT NULL REFERENCES equipment (sap_id),
    operating_hours DOUBLE PRECISION,
    downtime_code VARCHAR(64),
    production_tonnage DOUBLE PRECISION,
    PRIMARY KEY (date, shift_type, sap_id)
);

CREATE INDEX idx_shift_logs_date ON shift_logs (date);
CREATE INDEX idx_shift_logs_sap_id_date ON shift_logs (sap_id, date DESC);

CREATE TABLE anomalies (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sap_id VARCHAR(32) NOT NULL REFERENCES equipment (sap_id),
    timestamp TIMESTAMPTZ NOT NULL,
    anomaly_type VARCHAR(128) NOT NULL,
    health_score INTEGER NOT NULL CHECK (health_score BETWEEN 0 AND 100),
    is_critical BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (sap_id, timestamp, anomaly_type)
);

CREATE INDEX idx_anomalies_timestamp ON anomalies (timestamp);
CREATE INDEX idx_anomalies_sap_id_timestamp ON anomalies (sap_id, timestamp DESC);

-- Raw downtime events are kept separately from shift-level aggregates.
CREATE TABLE downtime_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sap_id VARCHAR(32) REFERENCES equipment (sap_id),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    downtime_duration DOUBLE PRECISION,
    downtime_code VARCHAR(64)
);

CREATE INDEX idx_downtime_events_sap_id_started_at
    ON downtime_events (sap_id, started_at DESC);
