CREATE TABLE IF NOT EXISTS migrations(
    id SERIAL PRIMARY KEY,
    table_name TEXT UNIQUE NOT NULL,
    executed_at TIMESTAMP DEFAULT now()
);