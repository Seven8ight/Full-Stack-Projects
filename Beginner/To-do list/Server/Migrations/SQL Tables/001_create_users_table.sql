CREATE TABLE IF NOT EXISTS users(
    id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT,
    profile_image TEXT,
    oauth BOOLEAN DEFAULT FALSE,
    oauthprovider TEXT
);