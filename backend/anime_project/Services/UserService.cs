using anime_project.Data;
using anime_project.DTOs;
using anime_project.Models;
using Microsoft.EntityFrameworkCore;
using System.Data;
using Npgsql;

namespace anime_project.Services;

public class UserService : IUserService
{
    private readonly AnimeProjectContext _context;

    public UserService(AnimeProjectContext context)
    {
        _context = context;
    }

    public async Task<List<UserDto>> GetUsersAsync()
    {
        return await _context.users
            .AsNoTracking()
            .Select(u => new UserDto
            {
                UserId = u.user_id,
                Nickname = u.nickname,
                Email = u.email,
                AvatarUrl = u.avatar_url,
                RegistrationDate = u.registration_date,
                Status = u.status
            })
            .ToListAsync();
    }

    public async Task<UserDto?> GetUserByIdAsync(int id)
    {
        var user = await _context.users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.user_id == id);

        if (user == null)
            return null;

        return new UserDto
        {
            UserId = user.user_id,
            Nickname = user.nickname,
            Email = user.email,
            AvatarUrl = user.avatar_url,
            RegistrationDate = user.registration_date,
            Status = user.status
        };
    }

    public async Task<int> CreateUserAsync(CreateUserDto dto)
    {
        var emailExists = await _context.users
            .AnyAsync(u => u.email == dto.Email);

        if (emailExists)
            throw new Exception("Пользователь с таким email уже существует");

        var user = new user
        {
            nickname = dto.Nickname,
            email = dto.Email,
            phone = dto.Phone,
            password_hash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            registration_date = DateTime.Now,
            status = "active"
        };

        _context.users.Add(user);
        await _context.SaveChangesAsync();

        return user.user_id;
    }

    public async Task<object?> LoginAsync(LoginDto dto)
    {
        var user = await _context.users
            .FirstOrDefaultAsync(u => u.email == dto.Email);

        if (user == null)
            return null;

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.password_hash))
            return null;

        return new
        {
            message = "Вход успешен",
            userId = user.user_id,
            nickname = user.nickname,
            email = user.email
        };
    }

    public async Task<List<UserListDto>> GetUserListAsync(int userId)
    {
        return await _context.user_lists
            .Where(x => x.user_id == userId)
            .Include(x => x.anime)
                .ThenInclude(a => a.genres)
            .AsNoTracking()
            .Select(x => new UserListDto
            {
                AnimeId = x.anime_id,
                Title = x.anime.title_ru ?? x.anime.title_original,
                TitleRu = x.anime.title_ru,
                TitleOriginal = x.anime.title_original,
                ReleaseYear = x.anime.release_year,
                Type = x.anime.type,
                EpisodesTotal = x.anime.episodes_total,
                PosterUrl = x.anime.poster_url,
                AverageRating = x.anime.average_rating,
                Status = x.status,
                Score = x.personal_score,
                UpdatedAt = x.updated_at,
                Genres = x.anime.genres.Select(g => g.name).ToList()
            })
            .ToListAsync();
    }

    public async Task AddToListAsync(int userId, AddToUserListDto dto)
    {
        await using var connection = (NpgsqlConnection)_context.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
        {
            await connection.OpenAsync();
        }

        await using var command = new NpgsqlCommand(
            "select add_to_user_list(@userId, @animeId, @status, @personalScore);",
            connection
        );

        command.Parameters.AddWithValue("@userId", userId);
        command.Parameters.AddWithValue("@animeId", dto.AnimeId);
        command.Parameters.AddWithValue("@status", (object?)dto.Status ?? DBNull.Value);
        command.Parameters.AddWithValue("@personalScore", (object?)dto.Score ?? DBNull.Value);

        try
        {
            var result = await command.ExecuteScalarAsync();

            if (result == null || result == DBNull.Value)
            {
                throw new Exception("Функция add_to_user_list не вернула list_id");
            }

            await RecalculateAnimeRatingAsync(dto.AnimeId);
        }
        catch (PostgresException ex)
        {
            throw new Exception(ex.MessageText);
        }
    }

    public async Task UpdateUserListAsync(int userId, int animeId, UpdateUserListDto dto)
    {
        await using var connection = (NpgsqlConnection)_context.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
        {
            await connection.OpenAsync();
        }

        await using var command = new NpgsqlCommand(
            "select update_user_list(@userId, @animeId, @status, @personalScore);",
            connection
        );

        command.Parameters.AddWithValue("@userId", userId);
        command.Parameters.AddWithValue("@animeId", animeId);
        command.Parameters.AddWithValue("@status", (object?)dto.Status ?? DBNull.Value);
        command.Parameters.AddWithValue("@personalScore", (object?)dto.Score ?? DBNull.Value);

        try
        {
            var result = await command.ExecuteScalarAsync();

            if (result == null || result == DBNull.Value)
            {
                throw new Exception("Функция update_user_list не вернула результат");
            }

            var updated = Convert.ToBoolean(result);

            if (!updated)
            {
                throw new Exception("Запись списка не была обновлена");
            }

            await RecalculateAnimeRatingAsync(animeId);
        }
        catch (PostgresException ex)
        {
            throw new Exception(ex.MessageText);
        }
    }

    public async Task DeleteFromUserListAsync(int userId, int animeId)
    {
        await using var connection = (NpgsqlConnection)_context.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
        {
            await connection.OpenAsync();
        }

        await using var command = new NpgsqlCommand(
            "select delete_from_user_list(@userId, @animeId);",
            connection
        );

        command.Parameters.AddWithValue("@userId", userId);
        command.Parameters.AddWithValue("@animeId", animeId);

        try
        {
            var result = await command.ExecuteScalarAsync();

            if (result == null || result == DBNull.Value)
            {
                throw new Exception("Функция delete_from_user_list не вернула результат");
            }

            var deleted = Convert.ToBoolean(result);

            if (!deleted)
            {
                throw new Exception("Запись списка не была удалена");
            }

            await RecalculateAnimeRatingAsync(animeId);
        }
        catch (PostgresException ex)
        {
            throw new Exception(ex.MessageText);
        }
    }

    private async Task RecalculateAnimeRatingAsync(int animeId)
    {
        var scores = await _context.user_lists
            .Where(x => x.anime_id == animeId && x.personal_score != null)
            .Select(x => x.personal_score!.Value)
            .ToListAsync();

        var anime = await _context.animes.FindAsync(animeId);

        if (anime == null)
            return;

        anime.average_rating = scores.Any()
            ? (decimal?)scores.Average()
            : null;

        await _context.SaveChangesAsync();
    }
}