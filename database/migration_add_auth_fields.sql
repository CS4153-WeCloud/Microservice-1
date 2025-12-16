USE user_service_db;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE NULL AFTER email,
ADD INDEX IF NOT EXISTS idx_google_id (google_id);