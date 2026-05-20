using anime_project.Data;
using anime_project.DTOs;
using anime_project.Models;
using Microsoft.EntityFrameworkCore;

namespace anime_project.Services;

public class UserService : IUserService
{
    private static readonly HashSet<string> AllowedListStatuses = new(StringComparer.Ordinal)
    {
        "Просмотрено",
        "Брошено",
        "Отложено",
        "Запланировано",
        "Пересматриваю",
        "Смотрю"
    };

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
                .Include(x => x.anime)
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
        ValidateListStatus(dto.Status);
        ValidateScore(dto.Score);

        var userExists = await _context.users
            .AnyAsync(u => u.user_id == userId);

        if (!userExists)
            throw new Exception("Пользователь не найден");

        var animeExists = await _context.animes
            .AnyAsync(a => a.anime_id == dto.AnimeId);

        if (!animeExists)
            throw new Exception("Аниме не найдено");

        var exists = await _context.user_lists
            .AnyAsync(x => x.user_id == userId && x.anime_id == dto.AnimeId);

        if (exists)
            throw new InvalidOperationException("Аниме уже добавлено в список");

        var item = new user_list
        {
            user_id = userId,
            anime_id = dto.AnimeId,
            status = dto.Status,
            personal_score = dto.Score,
            updated_at = DateTime.Now
        };

        _context.user_lists.Add(item);
        await _context.SaveChangesAsync();

        await RecalculateAnimeRatingAsync(dto.AnimeId);
    }

    public async Task UpdateUserListAsync(int userId, int animeId, UpdateUserListDto dto)
    {
        ValidateListStatus(dto.Status);
        ValidateScore(dto.Score);

        var item = await _context.user_lists
            .FirstOrDefaultAsync(x => x.user_id == userId && x.anime_id == animeId);

        if (item == null)
            throw new KeyNotFoundException("Запись списка не найдена");

        item.status = dto.Status;
        item.personal_score = dto.Score;
        item.updated_at = DateTime.Now;

        await _context.SaveChangesAsync();

        await RecalculateAnimeRatingAsync(animeId);
    }

    public async Task DeleteFromUserListAsync(int userId, int animeId)
    {
        var item = await _context.user_lists
            .FirstOrDefaultAsync(x => x.user_id == userId && x.anime_id == animeId);

        if (item == null)
            throw new KeyNotFoundException("Запись списка не найдена");

        _context.user_lists.Remove(item);
        await _context.SaveChangesAsync();

        await RecalculateAnimeRatingAsync(animeId);
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

    private static void ValidateListStatus(string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
            throw new ArgumentException("Статус списка обязателен");

        if (!AllowedListStatuses.Contains(status))
            throw new ArgumentException("Недопустимый статус списка");
    }

    private static void ValidateScore(int? score)
    {
        if (score is < 1 or > 10)
            throw new ArgumentException("Оценка должна быть от 1 до 10");
    }
}
