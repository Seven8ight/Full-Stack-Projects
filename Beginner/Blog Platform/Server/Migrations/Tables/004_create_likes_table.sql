DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname='like_type') THEN
        CREATE TYPE like_type AS ENUM ('like', 'dislike');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS likes (
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blog_id     UUID          REFERENCES blogs(id) ON DELETE CASCADE,
    comment_id  UUID          REFERENCES comments(id) ON DELETE CASCADE,
    type        like_type NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (user_id, blog_id, comment_id, type),
    CONSTRAINT exactly_one_target CHECK (
        (blog_id IS NOT NULL AND comment_id IS NULL) OR
        (blog_id IS NULL AND comment_id IS NOT NULL)
    )
);