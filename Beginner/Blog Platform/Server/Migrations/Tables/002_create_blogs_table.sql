DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname='content_status') THEN
        CREATE TYPE content_status AS ENUM ('draft', 'published', 'restricted');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS blogs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL CHECK (length(title) >= 1),
    slug            VARCHAR UNIQUE,
    content         JSONB NOT NULL,
    cover_image_url TEXT,
    status          content_status DEFAULT 'draft',
    tags            TEXT[] DEFAULT '{}',
    media_urls      TEXT[] DEFAULT '{}',
    view_count      INT DEFAULT 0,
    like_count      INT DEFAULT 0,
    comment_count   INT DEFAULT 0,
    restricted_reason TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at    TIMESTAMP WITH TIME ZONE,
    deleted_at      TIMESTAMP
);

CREATE INDEX idx_blogs_owner    ON blogs (owner_id);
CREATE INDEX idx_blogs_status   ON blogs (status);
CREATE INDEX idx_blogs_published ON blogs (published_at DESC) WHERE status = 'published';
CREATE INDEX idx_blogs_tags_gin ON blogs USING GIN (tags);