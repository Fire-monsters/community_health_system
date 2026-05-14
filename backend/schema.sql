-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for fuzzy name search

-- ========== ENUM TYPES ==========
CREATE TYPE user_role AS ENUM ('admin', 'nurse', 'clinical_officer', 'records_officer', 'chw');
CREATE TYPE sex_type AS ENUM ('male', 'female', 'other');
CREATE TYPE visit_type AS ENUM ('outpatient', 'inpatient', 'antenatal', 'immunization', 'follow_up', 'emergency');
CREATE TYPE sync_status AS ENUM ('pending', 'synced', 'conflict', 'failed');
CREATE TYPE sync_operation AS ENUM ('INSERT', 'UPDATE', 'DELETE');
CREATE TYPE queue_status AS ENUM ('pending', 'processing', 'synced', 'failed');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE referral_status AS ENUM ('pending', 'accepted', 'completed', 'rejected');
CREATE TYPE sms_status AS ENUM ('pending', 'sent', 'failed', 'retry');

-- ========== FACILITIES ==========
CREATE TABLE facilities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(150) NOT NULL,
  district      VARCHAR(100),
  region        VARCHAR(100),
  country       VARCHAR(100) DEFAULT 'Uganda',
  contact_phone VARCHAR(20),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ========== USERS ==========
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id   UUID NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  full_name     VARCHAR(150) NOT NULL,
  role          user_role NOT NULL,
  username      VARCHAR(80) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  last_login    TIMESTAMPTZ
);

-- ========== PATIENTS (with soft delete) ==========
CREATE TABLE patients (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id    UUID NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  patient_number VARCHAR(30) UNIQUE NOT NULL,
  full_name      VARCHAR(150) NOT NULL,
  date_of_birth  DATE,
  sex            sex_type,
  village        VARCHAR(100),
  phone_number   VARCHAR(20),
  next_of_kin    VARCHAR(150),
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ NULL
);

-- ========== ENCOUNTERS (visits) ==========
CREATE TABLE encounters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  recorded_by     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  facility_id     UUID NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  visit_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  visit_type      visit_type NOT NULL DEFAULT 'outpatient',
  chief_complaint TEXT,
  diagnosis       TEXT,
  treatment_given TEXT,
  notes           TEXT,
  sync_status     sync_status DEFAULT 'pending',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ========== VITALS ==========
CREATE TABLE vitals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id        UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
  weight_kg           NUMERIC(5,2),
  height_cm           NUMERIC(5,1),
  temperature_c       NUMERIC(4,1),
  blood_pressure_sys  SMALLINT,
  blood_pressure_dia  SMALLINT,
  pulse_rate          SMALLINT,
  respiratory_rate    SMALLINT,
  recorded_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ========== APPOINTMENTS ==========
CREATE TABLE appointments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  facility_id   UUID NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status        appointment_status DEFAULT 'scheduled',
  reminder_sent BOOLEAN DEFAULT FALSE,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ========== PRESCRIPTIONS ==========
CREATE TABLE prescriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id    UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
  medication_name VARCHAR(200) NOT NULL,
  dosage          VARCHAR(100),
  frequency       VARCHAR(100),
  duration_days   SMALLINT,
  prescribed_by   UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ========== REFERRALS ==========
CREATE TABLE referrals (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id         UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  from_facility_id   UUID NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  to_facility_name   VARCHAR(200) NOT NULL,
  to_facility_id     UUID NULL REFERENCES facilities(id) ON DELETE SET NULL,
  reason             TEXT,
  referral_date      DATE DEFAULT CURRENT_DATE,
  status             referral_status DEFAULT 'pending',
  follow_up_notes    TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ========== SMS QUEUE ==========
CREATE TABLE sms_queue (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  message      TEXT NOT NULL,
  status       sms_status DEFAULT 'pending',
  sent_at      TIMESTAMPTZ,
  retry_count  SMALLINT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ========== SYNC QUEUE (generic for all tables) ==========
CREATE TABLE sync_queue (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name   VARCHAR(50) NOT NULL,
  operation    sync_operation NOT NULL,
  record_id    UUID NOT NULL,      -- ID of the affected row
  payload      JSONB,               -- full record snapshot
  status       queue_status DEFAULT 'pending',
  retry_count  SMALLINT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  synced_at    TIMESTAMPTZ
);

-- ========== CONFLICTS TABLE ==========
CREATE TABLE sync_conflicts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name       VARCHAR(50) NOT NULL,
  record_id        UUID NOT NULL,
  local_payload    JSONB,
  remote_payload   JSONB,
  resolution_status VARCHAR(20) DEFAULT 'pending',
  resolved_by      UUID REFERENCES users(id),
  resolved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ========== INDEXES ==========
-- Patients
CREATE INDEX idx_patients_facility ON patients(facility_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_number ON patients(patient_number);
CREATE INDEX idx_patients_phone ON patients(phone_number);
CREATE INDEX idx_patients_name_trgm ON patients USING GIN (full_name gin_trgm_ops);
CREATE INDEX idx_patients_active ON patients(is_active) WHERE is_active = true;

-- Encounters
CREATE INDEX idx_encounters_patient ON encounters(patient_id);
CREATE INDEX idx_encounters_facility ON encounters(facility_id);
CREATE INDEX idx_encounters_sync ON encounters(sync_status);
CREATE INDEX idx_encounters_date ON encounters(visit_date);

-- Vitals
CREATE INDEX idx_vitals_encounter ON vitals(encounter_id);

-- Appointments
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_for) WHERE status = 'scheduled';

-- Prescriptions
CREATE INDEX idx_prescriptions_encounter ON prescriptions(encounter_id);

-- Referrals
CREATE INDEX idx_referrals_patient ON referrals(patient_id);
CREATE INDEX idx_referrals_from_facility ON referrals(from_facility_id);
CREATE INDEX idx_referrals_date ON referrals(referral_date);

-- Sync queue
CREATE INDEX idx_sync_queue_status ON sync_queue(status) WHERE status = 'pending';
CREATE INDEX idx_sync_queue_table_record ON sync_queue(table_name, record_id);
CREATE INDEX idx_sync_queue_created ON sync_queue(created_at);

-- Conflicts
CREATE INDEX idx_conflicts_record ON sync_conflicts(table_name, record_id) WHERE resolution_status = 'pending';

-- SMS
CREATE INDEX idx_sms_queue_status ON sms_queue(status) WHERE status = 'pending';

-- ========== AUTO-UPDATE TRIGGERS ==========
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_patients_updated BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_encounters_updated BEFORE UPDATE ON encounters FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_referrals_updated BEFORE UPDATE ON referrals FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ========== SOFT DELETE HELPER FUNCTION ==========
-- Instead of DELETE, use: UPDATE patients SET deleted_at = NOW() WHERE id = ...;
-- Queries should filter WHERE deleted_at IS NULL unless explicitly including deleted records.