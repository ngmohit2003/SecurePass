CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE otp_sessions (
    email TEXT,
    otp_hash TEXT,
    expires_at TIMESTAMP
);
