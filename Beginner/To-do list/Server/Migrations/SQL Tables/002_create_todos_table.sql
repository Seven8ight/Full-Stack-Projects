CREATE TABLE IF NOT EXISTS todos(
    id UUID NOT NULL DEFALT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    todo_status TEXT DEFAULT incomplete
);