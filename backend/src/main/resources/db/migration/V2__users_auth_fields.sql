-- opcional si ya existe la tabla users del V1
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(120);

-- Asegura email case-insensitive (opcional pero pro).
-- Requiere extensión citext; si no quieres, omite esto.
-- CREATE EXTENSION IF NOT EXISTS citext;
-- ALTER TABLE users ALTER COLUMN email TYPE citext;

-- Índice por email (si no existe)
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email ON users(email);
