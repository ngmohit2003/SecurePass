CREATE TABLE IF NOT EXISTS password_vault (
    id SERIAL PRIMARY KEY,
    owner_email TEXT NOT NULL,
    service_name TEXT NOT NULL,
    username TEXT NOT NULL,
    password_encrypted BYTEA NOT NULL,
    iv BYTEA NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
