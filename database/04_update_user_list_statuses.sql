ALTER TABLE user_list
DROP CONSTRAINT IF EXISTS chk_user_list_status;

ALTER TABLE user_list
ADD CONSTRAINT chk_user_list_status
CHECK (status IN (
    'Запланировано',
    'Смотрю',
    'Просмотрено',
    'Брошено',
    'Отложено',
    'Пересматриваю'
));
