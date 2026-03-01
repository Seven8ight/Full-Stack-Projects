CREATE TABLE IF NOT EXISTS blog_analytics (
    blog_id      UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    date         DATE NOT NULL,
    views        INT DEFAULT 0,
    unique_views INT DEFAULT 0,
    likes_added  INT DEFAULT 0,
    comments_added INT DEFAULT 0,
    PRIMARY KEY (blog_id, date)
);