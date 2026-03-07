CREATE TYPE media_type AS ENUM("image","video");

CREATE TABLE blog_media(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id     UUID REFERENCES blogs(id),
    url         TEXT NOT NULL,
    type        media_type NOT NULL,
    size        INT,
    created_at  TIMESTAMP DEFAULT NOW()
);