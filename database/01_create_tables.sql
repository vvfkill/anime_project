CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    nickname VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL
);

CREATE TABLE notification (
    notification_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE anime (
    anime_id SERIAL PRIMARY KEY,
    title_ru VARCHAR(255),
    title_original VARCHAR(255) NOT NULL,
    description TEXT,
    release_year INT,
    type VARCHAR(50),
    status VARCHAR(50),
    episodes_total INT,
    duration_minutes INT,
    poster_url TEXT,
    average_rating NUMERIC(3,2)
);

CREATE TABLE studio (
    studio_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    foundation_year INT,
    description TEXT,
    logo_url TEXT
);

CREATE TABLE genre (
    genre_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE tag (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE season (
    season_id SERIAL PRIMARY KEY,
    anime_id INT NOT NULL,
    season_number INT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    release_date DATE,
    episodes_count INT
);

CREATE TABLE episode (
    episode_id SERIAL PRIMARY KEY,
    season_id INT NOT NULL,
    episode_number INT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    duration_minutes INT,
    release_date DATE,
    video_url TEXT
);

CREATE TABLE anime_character (
    character_id SERIAL PRIMARY KEY,
    anime_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_original VARCHAR(255),
    description TEXT,
    gender VARCHAR(50),
    role_type VARCHAR(50),
    image_url TEXT
);

CREATE TABLE seiyu (
    seiyu_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_original VARCHAR(255),
    birth_date DATE,
    country VARCHAR(100),
    photo_url TEXT
);

CREATE TABLE user_list (
    list_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    anime_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    personal_score INT,
    episodes_watched INT DEFAULT 0,
    note TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookmark (
    bookmark_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    anime_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE watch_history (
    history_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    episode_id INT NOT NULL,
    watched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    progress_seconds INT DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE review (
    review_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    anime_id INT NOT NULL,
    title VARCHAR(255),
    text TEXT NOT NULL,
    score INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_spoiler BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE complaint (
    complaint_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE action_log (
    log_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE visit_stats (
    stat_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    visited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    page_url TEXT NOT NULL,
    device_type VARCHAR(100)
);

CREATE TABLE subscription (
    subscriber_id INT NOT NULL,
    target_user_id INT NOT NULL,
    PRIMARY KEY (subscriber_id, target_user_id)
);

CREATE TABLE user_genre (
    user_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (user_id, genre_id)
);

CREATE TABLE user_tag (
    user_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (user_id, tag_id)
);

CREATE TABLE anime_studio (
    anime_id INT NOT NULL,
    studio_id INT NOT NULL,
    PRIMARY KEY (anime_id, studio_id)
);

CREATE TABLE anime_genre (
    anime_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (anime_id, genre_id)
);

CREATE TABLE anime_tag (
    anime_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (anime_id, tag_id)
);

CREATE TABLE anime_category (
    anime_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (anime_id, category_id)
);

CREATE TABLE character_seiyu (
    character_id INT NOT NULL,
    seiyu_id INT NOT NULL,
    PRIMARY KEY (character_id, seiyu_id)
);

CREATE TABLE similar_anime (
    anime_id INT NOT NULL,
    related_anime_id INT NOT NULL,
    PRIMARY KEY (anime_id, related_anime_id)
);

CREATE TABLE complaint_user (
    complaint_id INT PRIMARY KEY,
    target_user_id INT NOT NULL
);

CREATE TABLE complaint_anime (
    complaint_id INT PRIMARY KEY,
    anime_id INT NOT NULL
);

CREATE TABLE complaint_review (
    complaint_id INT PRIMARY KEY,
    review_id INT NOT NULL
);