CREATE TABLE IF NOT EXISTS refresh_tokens(
    id UUID DEFAULT uuid_generate_v4(),
    token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at DATE NOT NULL
);