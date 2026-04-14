ALTER TABLE notification
ADD CONSTRAINT fk_notification_user
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE season
ADD CONSTRAINT fk_season_anime
FOREIGN KEY (anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE;

ALTER TABLE episode
ADD CONSTRAINT fk_episode_season
FOREIGN KEY (season_id) REFERENCES season(season_id) ON DELETE CASCADE;

ALTER TABLE anime_character
ADD CONSTRAINT fk_character_anime
FOREIGN KEY (anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE;

ALTER TABLE user_list
ADD CONSTRAINT fk_user_list_user
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_user_list_anime
FOREIGN KEY (anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE,
ADD CONSTRAINT uq_user_list UNIQUE (user_id, anime_id),
ADD CONSTRAINT chk_user_list_status
CHECK (status IN ('Запланировано', 'Смотрю', 'Просмотрено', 'Брошено')),
ADD CONSTRAINT chk_user_list_score
CHECK (personal_score IS NULL OR personal_score BETWEEN 1 AND 10);

ALTER TABLE bookmark
ADD CONSTRAINT fk_bookmark_user
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_bookmark_anime
FOREIGN KEY (anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE,
ADD CONSTRAINT uq_bookmark UNIQUE (user_id, anime_id);

ALTER TABLE watch_history
ADD CONSTRAINT fk_watch_history_user
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_watch_history_episode
FOREIGN KEY (episode_id) REFERENCES episode(episode_id) ON DELETE CASCADE,
ADD CONSTRAINT chk_watch_history_progress
CHECK (progress_seconds >= 0);

ALTER TABLE review
ADD CONSTRAINT fk_review_user
FOREIGN KEY (user_id) REFERENCES users(user_id),
ADD CONSTRAINT fk_review_anime
FOREIGN KEY (anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE,
ADD CONSTRAINT chk_review_score
CHECK (score BETWEEN 1 AND 10);

ALTER TABLE complaint
ADD CONSTRAINT fk_complaint_user
FOREIGN KEY (user_id) REFERENCES users(user_id),
ADD CONSTRAINT chk_complaint_status
CHECK (status IN ('На рассмотрении', 'Решена', 'Отклонена'));

ALTER TABLE action_log
ADD CONSTRAINT fk_action_log_user
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE visit_stats
ADD CONSTRAINT fk_visit_stats_user
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE subscription
ADD CONSTRAINT fk_subscription_subscriber
FOREIGN KEY (subscriber_id) REFERENCES users(user_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_subscription_target
FOREIGN KEY (target_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
ADD CONSTRAINT chk_subscription_self
CHECK (subscriber_id <> target_user_id);

ALTER TABLE user_genre
ADD CONSTRAINT fk_user_genre_user
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_user_genre_genre
FOREIGN KEY (genre_id) REFERENCES genre(genre_id) ON DELETE CASCADE;

ALTER TABLE user_tag
ADD CONSTRAINT fk_user_tag_user
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_user_tag_tag
FOREIGN KEY (tag_id) REFERENCES tag(tag_id) ON DELETE CASCADE;

ALTER TABLE anime_studio
ADD CONSTRAINT fk_anime_studio_anime
FOREIGN KEY (anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_anime_studio_studio
FOREIGN KEY (studio_id) REFERENCES studio(studio_id) ON DELETE CASCADE;

ALTER TABLE anime_genre
ADD CONSTRAINT fk_anime_genre_anime
FOREIGN KEY (anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_anime_genre_genre
FOREIGN KEY (genre_id) REFERENCES genre(genre_id) ON DELETE CASCADE;

ALTER TABLE anime_tag
ADD CONSTRAINT fk_anime_tag_anime
FOREIGN KEY (anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_anime_tag_tag
FOREIGN KEY (tag_id) REFERENCES tag(tag_id) ON DELETE CASCADE;

ALTER TABLE anime_category
ADD CONSTRAINT fk_anime_category_anime
FOREIGN KEY (anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_anime_category_category
FOREIGN KEY (category_id) REFERENCES category(category_id) ON DELETE CASCADE;

ALTER TABLE character_seiyu
ADD CONSTRAINT fk_character_seiyu_character
FOREIGN KEY (character_id) REFERENCES anime_character(character_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_character_seiyu_seiyu
FOREIGN KEY (seiyu_id) REFERENCES seiyu(seiyu_id) ON DELETE CASCADE;

ALTER TABLE similar_anime
ADD CONSTRAINT fk_similar_anime_left
FOREIGN KEY (anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_similar_anime_right
FOREIGN KEY (related_anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE,
ADD CONSTRAINT chk_similar_anime_self
CHECK (anime_id <> related_anime_id);

ALTER TABLE complaint_user
ADD CONSTRAINT fk_complaint_user_complaint
FOREIGN KEY (complaint_id) REFERENCES complaint(complaint_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_complaint_user_target
FOREIGN KEY (target_user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE complaint_anime
ADD CONSTRAINT fk_complaint_anime_complaint
FOREIGN KEY (complaint_id) REFERENCES complaint(complaint_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_complaint_anime_target
FOREIGN KEY (anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE;

ALTER TABLE complaint_review
ADD CONSTRAINT fk_complaint_review_complaint
FOREIGN KEY (complaint_id) REFERENCES complaint(complaint_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_complaint_review_target
FOREIGN KEY (review_id) REFERENCES review(review_id) ON DELETE CASCADE;