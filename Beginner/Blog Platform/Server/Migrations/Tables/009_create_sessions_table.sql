CREATE TABLE sessions(
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID NOT NULL REFERENCES users(id),
    refresh_token_hash     TEXT NOT NULL,
    ip_address             TEXT NOT NULL,
    user_agent             TEXT NOT NULL,
    expires_at             TIMESTAMP,
    created_at             TIMESTAMP DEFAULT NOW(),
    revoked_at             TIMESTAMP
);