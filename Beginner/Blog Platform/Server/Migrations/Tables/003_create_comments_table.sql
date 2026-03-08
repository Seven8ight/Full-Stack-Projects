CREATE TABLE IF NOT EXISTS comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blog_id     UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    like_count  INT DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at  TIMESTAMP
);

-- Added semicolon here:
CREATE INDEX idx_comments_blog      ON comments (blog_id); 
CREATE INDEX idx_comments_blog_time ON comments (blog_id, created_at DESC);