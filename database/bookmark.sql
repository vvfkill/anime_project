--таблица для логов
create table if not exists bookmark_log(
	id serial primary key,
	action varchar(10),
	bookmark_id integer,
	old_data json,
	new_data json,
	changed_at timestamp default current_timestamp,
	changed_by varchar(50) default current_user
)

--добавление закладок
create or replace function add_bookmark (p_userId integer, p_animeId integer)
returns integer 
as $$
declare new_id integer;
begin 
	if exists (
		select 1 
		from bookmark
		where user_id = p_userId and anime_id = p_animeId) then
		raise exception 'Закладка уже существует';
	end if;
	insert into bookmark(user_id, anime_id)
	values (p_userId, p_animeId)
	returning bookmark_id into new_id; -- автоматическое создание
	return new_id; 
end;
$$
language plpgsql;

--удаление
create or replace function delete_bookmark(p_bookmarkId integer,p_userId integer, p_animeId integer)
returns boolean
as $$
begin 
	if not exists (
		select 1 
		from bookmark
		where bookmark_id = p_bookmarkId) then
		return false;
	end if;
	delete 
	from bookmark where bookmark_id = p_bookmarkId;
	return true;
end;
$$
language plpgsql;

--функция обработчик
create or replace function log_bookmark_changes()
returns trigger
as $$
begin 
	if (tg_op = 'INSERT') then 
		insert into bookmark_log (action, bookmark_id, new_data)
		values ('INSERT', new.bookmark_id, row_to_json(new));
		return new;
	end if;
	if (tg_op = 'DELETE') then
		insert into bookmark_log (action, bookmark_id, old_data)
		values ('DELETE', old.bookmark_id, row_to_json(old));
		return old;
	end if;
end;
$$
language plpgsql;

--триггер
drop trigger if exists trigger_log_bookmark on bookmark;

create trigger trigger_log_bookmark
	after insert or delete on bookmark
	for each row
	execute function log_bookmark_changes();


