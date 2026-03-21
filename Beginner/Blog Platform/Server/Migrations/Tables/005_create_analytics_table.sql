CREATE TABLE IF NOT EXISTS blog_analytics (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    blog_id        UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    date           DATE DEFAULT NOW() NOT NULL,
    views          INT DEFAULT 0,
    unique_views   INT DEFAULT 0,
    likes_added    INT DEFAULT 0,
    comments_added INT DEFAULT 0,
);

CREATE UNIQUE INDEX blog_analytic_per_day on blog_analytics(blog_id,date);