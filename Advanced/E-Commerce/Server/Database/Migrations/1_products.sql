CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    image_url TEXT,
    description TEXT,
    category TEXT NOT NULL,
    price INT NOT NULL CHECK (price >= 0),
    discount DECIMAL,
    created_at TIMESTAMP DEFAULT NOW()
);
