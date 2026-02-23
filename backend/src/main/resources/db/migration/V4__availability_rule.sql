-- V4__availability_rule.sql
-- Bloque 3: Disponibilidad
-- Intenta habilitar btree_gist para exclusion constraints con provider_id.
-- En entornos sin privilegios (dev local), no bloquea la migración.
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS btree_gist;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Sin privilegios para CREATE EXTENSION btree_gist. Se omitirán constraints EXCLUDE.';
END $$;

-- 1) Reglas semanales (patrones)
-- Nota: en tu proyecto la tabla es "providers" (plural)
CREATE TABLE IF NOT EXISTS provider_availability_rules (
  id              BIGSERIAL PRIMARY KEY,
  provider_id     BIGINT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  day_of_week     SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Lun ... 7=Dom (defínelo así en código)
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  slot_step_min   INT NOT NULL DEFAULT 15 CHECK (slot_step_min BETWEEN 5 AND 240),
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_rule_time CHECK (start_time < end_time)
);

-- Evita duplicados exactos del mismo tramo (solo para reglas activas)
-- (Aún permite tener 2 reglas el mismo día con tramos distintos)
CREATE UNIQUE INDEX IF NOT EXISTS ux_av_rules_no_duplicates_active
  ON provider_availability_rules(provider_id, day_of_week, start_time, end_time)
  WHERE active = TRUE;

-- Índice para listar reglas por provider/día
CREATE INDEX IF NOT EXISTS ix_av_rules_provider_day_active
  ON provider_availability_rules(provider_id, day_of_week)
  WHERE active = TRUE;

-- Recomendado: evita solapamientos de reglas activas por provider y día.
-- Solo se crea si btree_gist está disponible.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'btree_gist') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'ex_av_rules_no_overlap'
    ) THEN
      ALTER TABLE provider_availability_rules
      ADD CONSTRAINT ex_av_rules_no_overlap
      EXCLUDE USING gist (
        provider_id WITH =,
        day_of_week WITH =,
        int4range(
          ((extract(epoch from start_time))::int / 60),
          ((extract(epoch from end_time))::int / 60),
          '[)'
        ) WITH &&
      )
      WHERE (active = TRUE);
    END IF;
  END IF;
END $$;

-- 2) Excepciones (bloqueos / aperturas especiales por fecha-hora real)
CREATE TABLE IF NOT EXISTS provider_availability_exceptions (
  id              BIGSERIAL PRIMARY KEY,
  provider_id     BIGINT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  start_at        TIMESTAMPTZ NOT NULL,
  end_at          TIMESTAMPTZ NOT NULL,
  type            VARCHAR(20) NOT NULL CHECK (type IN ('BLOCK','EXTRA_OPEN')),
  reason          VARCHAR(200),
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_exception_time CHECK (start_at < end_at)
);

-- Índice para buscar excepciones por provider y rango de fechas
CREATE INDEX IF NOT EXISTS ix_av_exceptions_provider_start_end_active
  ON provider_availability_exceptions(provider_id, start_at, end_at)
  WHERE active = TRUE;

-- Evita solapamientos de excepciones activas por provider.
-- Solo se crea si btree_gist está disponible.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'btree_gist') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'ex_av_exceptions_no_overlap'
    ) THEN
      ALTER TABLE provider_availability_exceptions
      ADD CONSTRAINT ex_av_exceptions_no_overlap
      EXCLUDE USING gist (
        provider_id WITH =,
        tstzrange(start_at, end_at, '[)') WITH &&
      )
      WHERE (active = TRUE);
    END IF;
  END IF;
END $$;
