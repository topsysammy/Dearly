-- Dearly schema. The app also applies this automatically on first use.
-- gen_random_uuid() is built in from PostgreSQL 13 (use the pgcrypto extension on older versions).

CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT NOT NULL UNIQUE,          -- stored lower-cased
  name           TEXT NOT NULL,
  password_hash  TEXT NOT NULL,                 -- scrypt$N$r$p$salt$hash
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash  TEXT PRIMARY KEY,                 -- sha256(cookie token); the token itself is never stored
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);

CREATE TABLE IF NOT EXISTS letters (
  id          TEXT PRIMARY KEY,                 -- client-generated UUID
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document    JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS letters_user_idx ON letters (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS shared_letters (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash       TEXT NOT NULL UNIQUE,        -- sha256(public token)
  revoke_key_hash  TEXT NOT NULL,               -- sha256(sender revocation key)
  letter_document  JSONB NOT NULL,              -- immutable snapshot at share time
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at       TIMESTAMPTZ NULL,
  revoked_at       TIMESTAMPTZ NULL,
  open_count       INTEGER NOT NULL DEFAULT 0,
  first_opened_at  TIMESTAMPTZ NULL
);
ALTER TABLE shared_letters ADD COLUMN IF NOT EXISTS user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE shared_letters ADD COLUMN IF NOT EXISTS letter_id TEXT NULL;
ALTER TABLE shared_letters ADD COLUMN IF NOT EXISTS label TEXT NULL;
-- The owner's copy of the public link, so it can be shown on any of their devices.
-- (The snapshot itself already lives in this table, so this adds no new exposure.)
ALTER TABLE shared_letters ADD COLUMN IF NOT EXISTS owner_token TEXT NULL;
CREATE INDEX IF NOT EXISTS shared_letters_expires_idx ON shared_letters (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS shared_letters_user_idx ON shared_letters (user_id, created_at DESC);
