CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE appointments (
  id           BIGSERIAL PRIMARY KEY,
  provider_id  BIGINT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,  
  service_id   BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,   
  user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,      
  start_at     TIMESTAMPTZ NOT NULL,
  end_at       TIMESTAMPTZ NOT NULL,
  status       VARCHAR(20) NOT NULL CHECK (status IN ('PENDING','CONFIRMED','CANCELLED','COMPLETED')),
  notes        VARCHAR(300),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_appointment_time CHECK (start_at < end_at)
);

CREATE INDEX idx_appointments_provider_start
  ON appointments(provider_id, start_at);

CREATE INDEX idx_appointments_user_start
  ON appointments(user_id, start_at);

-- Regla PRO: evitar doble reserva por provider para citas "activas"
-- Permitimos solapamiento solo si está CANCELLED
ALTER TABLE appointments
ADD CONSTRAINT ex_appointment_no_overlap_per_provider
EXCLUDE USING gist (
  provider_id WITH =,
  tstzrange(start_at, end_at, '[)') WITH &&
)
WHERE (status <> 'CANCELLED');