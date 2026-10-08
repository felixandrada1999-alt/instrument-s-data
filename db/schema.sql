CREATE TABLE IF NOT EXISTS instruments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_name VARCHAR(120) NOT NULL,
  instrument_name VARCHAR(160) NOT NULL,
  part_number VARCHAR(120) NOT NULL,
  serial_number VARCHAR(120) NOT NULL,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);