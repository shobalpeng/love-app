-- 用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 绑定关系表
CREATE TABLE bindings (
    id SERIAL PRIMARY KEY,
    user_id_1 INTEGER NOT NULL REFERENCES users(id),
    user_id_2 INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    bound_at TIMESTAMP DEFAULT NOW(),
    unbound_at TIMESTAMP,
    CHECK (user_id_1 < user_id_2)
);

-- 绑定申请表
CREATE TABLE bind_requests (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER NOT NULL REFERENCES users(id),
    to_user_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 任务表
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    publisher_id INTEGER NOT NULL REFERENCES users(id),
    assigned_to_id INTEGER NOT NULL REFERENCES users(id),
    bound_pair_id INTEGER REFERENCES bindings(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    points INTEGER NOT NULL CHECK (points > 0),
    deadline TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 任务提交记录
CREATE TABLE task_submissions (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id),
    submitter_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT,
    image_urls JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    review_comment TEXT,
    submitted_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP
);

-- 商品表
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    publisher_id INTEGER NOT NULL REFERENCES users(id),
    bound_pair_id INTEGER REFERENCES bindings(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    image_urls JSONB,
    price INTEGER NOT NULL CHECK (price > 0),
    deadline TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available',
    extended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 购买记录
CREATE TABLE purchase_records (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    buyer_id INTEGER NOT NULL REFERENCES users(id),
    points_frozen INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'frozen',
    frozen_at TIMESTAMP DEFAULT NOW(),
    verified_at TIMESTAMP,
    confirmed_at TIMESTAMP
);

-- 积分流水
CREATE TABLE integral_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL,
    type VARCHAR(30) NOT NULL,
    reference_id INTEGER,
    balance_after INTEGER NOT NULL,
    description VARCHAR(300),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 待办事项
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    creator_id INTEGER NOT NULL REFERENCES users(id),
    owner_id INTEGER NOT NULL REFERENCES users(id),
    bound_pair_id INTEGER REFERENCES bindings(id),
    title VARCHAR(300) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    visibility VARCHAR(20) NOT NULL DEFAULT 'private',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 菜谱
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES users(id),
    bound_pair_id INTEGER NOT NULL REFERENCES bindings(id),
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    image_urls JSONB,
    method TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 通知
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    reference_type VARCHAR(50),
    reference_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 纪念日
CREATE TABLE anniversaries (
    id SERIAL PRIMARY KEY,
    bound_pair_id INTEGER NOT NULL REFERENCES bindings(id),
    name VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
