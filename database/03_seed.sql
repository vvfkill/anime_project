INSERT INTO users (nickname, email, phone, password_hash, avatar_url, status)
VALUES
('naruto_fan', 'naruto@mail.com', '89000000001', 'hash_1', 'https://example.com/avatar1.jpg', 'active'),
('anime_lover', 'lover@mail.com', '89000000002', 'hash_2', 'https://example.com/avatar2.jpg', 'active');

INSERT INTO genre (name, description)
VALUES
('Сёнэн', 'Жанр для подростковой аудитории'),
('Драма', 'Эмоциональные и серьёзные произведения');

INSERT INTO tag (name, description)
VALUES
('сражения', 'Большое количество боевых сцен'),
('дружба', 'Важная роль дружеских отношений');

INSERT INTO category (name, description)
VALUES
('Популярное', 'Наиболее популярные аниме');

INSERT INTO studio (name, country, foundation_year, description, logo_url)
VALUES
('Pierrot', 'Япония', 1979, 'Известная студия анимации', 'https://example.com/pierrot.png');

INSERT INTO seiyu (name, name_original, birth_date, country, photo_url)
VALUES
('Дзюнко Такэути', '竹内 順子', '1972-04-05', 'Япония', 'https://example.com/seiyu1.jpg');

INSERT INTO anime (
    title_ru, title_original, description, release_year, type, status,
    episodes_total, duration_minutes, poster_url, average_rating
)
VALUES
('Наруто', 'Naruto', 'История ниндзя Наруто Узумаки', 2002, 'TV', 'completed', 220, 24, 'https://example.com/naruto.jpg', 8.50),
('Твоя апрельская ложь', 'Shigatsu wa Kimi no Uso', 'Музыкальная школьная драма', 2014, 'TV', 'completed', 22, 23, 'https://example.com/april.jpg', 8.70);

INSERT INTO anime_studio (anime_id, studio_id)
VALUES
(1, 1),
(2, 1);

INSERT INTO anime_genre (anime_id, genre_id)
VALUES
(1, 1),
(2, 2);

INSERT INTO anime_tag (anime_id, tag_id)
VALUES
(1, 1),
(1, 2),
(2, 2);

INSERT INTO anime_category (anime_id, category_id)
VALUES
(1, 1),
(2, 1);

INSERT INTO user_genre (user_id, genre_id)
VALUES
(1, 1),
(2, 2);

INSERT INTO user_tag (user_id, tag_id)
VALUES
(1, 1),
(2, 2);

INSERT INTO season (anime_id, season_number, title, description, release_date, episodes_count)
VALUES
(1, 1, 'Наруто: Сезон 1', 'Первый сезон', '2002-10-03', 220),
(2, 1, 'Твоя апрельская ложь: Сезон 1', 'Единственный сезон', '2014-10-10', 22);

INSERT INTO episode (season_id, episode_number, title, description, duration_minutes, release_date, video_url)
VALUES
(1, 1, 'Узумаки Наруто!', 'Первая серия', 24, '2002-10-03', 'https://example.com/ep1'),
(2, 1, 'Монотонность и яркость', 'Первая серия', 23, '2014-10-10', 'https://example.com/ep2');

INSERT INTO anime_character (anime_id, name, name_original, description, gender, role_type, image_url)
VALUES
(1, 'Наруто Узумаки', 'うずまき ナルト', 'Главный герой', 'male', 'main', 'https://example.com/ch1.jpg'),
(2, 'Каори Миядзоно', '宮園 かをり', 'Главная героиня', 'female', 'main', 'https://example.com/ch2.jpg');

INSERT INTO character_seiyu (character_id, seiyu_id)
VALUES
(1, 1),
(2, 1);

INSERT INTO subscription (subscriber_id, target_user_id)
VALUES
(1, 2);

INSERT INTO user_list (user_id, anime_id, status, personal_score, episodes_watched, note)
VALUES
(1, 1, 'Просмотрено', 9, 220, 'Любимое аниме'),
(2, 2, 'Смотрю', 8, 5, 'Очень нравится');

INSERT INTO bookmark (user_id, anime_id)
VALUES
(1, 2);

INSERT INTO watch_history (user_id, episode_id, progress_seconds, completed)
VALUES
(2, 2, 1200, FALSE);


INSERT INTO review (user_id, anime_id, title, text, score, is_spoiler)
VALUES
(1, 1, 'Отличное аниме', 'Очень атмосферное и интересное.', 9, FALSE);


INSERT INTO complaint (user_id, reason, description, status)
VALUES
(2, 'Спойлер', 'Отзыв раскрывает важные события', 'На рассмотрении');

INSERT INTO complaint_review (complaint_id, review_id)
VALUES
(1, 1);

INSERT INTO notification (user_id, title, text, type, is_read)
VALUES
(1, 'Новый подписчик', 'На вас подписался пользователь.', 'subscription', FALSE);

INSERT INTO action_log (user_id, action_type, entity_type, entity_id)
VALUES
(1, 'create_review', 'review', 1);


INSERT INTO visit_stats (user_id, page_url, device_type)
VALUES
(1, '/anime/1', 'desktop');

INSERT INTO similar_anime (anime_id, related_anime_id)
VALUES
(1, 2);