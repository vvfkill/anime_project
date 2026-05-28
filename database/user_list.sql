--таблица для логов
create table if not exists user_list_log(
	id serial primary key,
	action varchar(10),
	list_id integer,
	old_data json,
	new_data json,
	changed_at timestamp default current_timestamp,
	changed_by varchar(50) default current_user
);

create or replace function add_to_user_list (
	p_user_id int,
	p_anime_id int,
	p_status varchar(50),
	p_personal_score int)
returns int
as $$
declare new_list_id int;
begin
	if p_user_id is null or p_user_id <= 0 then 
		raise exception 'Некорректный user_id: %', p_user_id;
	end if;
	if p_anime_id is null or p_anime_id <=0 then
		raise exception 'Некорректный anime_id: %', p_anime_id;
	end if;
	if not exists (
		select 1
		from users
		where user_id = p_user_id
	) then 
		raise exception 'Пользователя с id % не существует', p_user_id;
	end if;
	if not exists (
		select 1
		from anime
		where anime_id = p_anime_id
	) then 
		raise exception 'Аниме с id % не существует', p_anime_id;
	end if;
	if p_status is null or trim(p_status) = '' then
		raise exception 'Ошибка. Статус не может быть пустым';
	end if;
	if p_status not in(
		'Просмотрено', 
		'Запланировано', 
		'Смотрю',
		'Брошено',
		'Пересматриваю',
		'Отложено')  then
		raise exception 'Ошибка. Такого статуса не существует';
	end if;
	if p_personal_score is not null and
		(p_personal_score < 1 or p_personal_score > 10)
		raise exception 'Ошибка. Диапазон от 1 до 10';
	end if;
	if exists (
		select 1
		from user_list
		where user_id = p_user_id and anime_id = p_anime_id
	) then
		raise exception 'Такая запись уже существует. id пользователя: %', p_user_id;
	end if;
	insert into user_list(user_id, anime_id, status, personal_score)
	values (p_user_id, p_anime_id, p_status, p_personal_score) 
	returning list_id into new_list_id;
	return new_list_id;
end;
$$
language plpgsql;

