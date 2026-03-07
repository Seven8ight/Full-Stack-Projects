CREATE TYPE verification_type AS ENUM("email_verification","password_reset");

CREATE TABLE verification(
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID REFERENCES users(id),
    token_hash             TEXT NOT NULL,
    type                   verification_type NOT NULL,
    expires_at             TIMESTAMP,
    created_at             TIMESTAMP DEFAULT NOW(),
    revoked_at             TIMESTAMP

);