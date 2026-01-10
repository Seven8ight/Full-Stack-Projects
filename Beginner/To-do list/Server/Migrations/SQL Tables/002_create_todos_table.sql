CREATE TABLE IF NOT EXISTS todos(
    id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    todo_status TEXT DEFAULT 'incomplete'
);