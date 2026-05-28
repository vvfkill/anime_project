using System.Data;
using anime_project.Data;
using anime_project.DTOs;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace anime_project.Services;

public class BookmarkService : IBookmarkService
{
    private readonly AnimeProjectContext _context;

    public BookmarkService(AnimeProjectContext context)
    {
        _context = context;
    }

    public async Task<int> AddBookmarkAsync(AddBookmarkDto dto)
    {
        await using var connection = (NpgsqlConnection)_context.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
        {
            await connection.OpenAsync();
        }

        await using var command = new NpgsqlCommand(
            "select add_bookmark(@userId, @animeId);",
            connection
        );

        command.Parameters.AddWithValue("@userId", dto.UserId);
        command.Parameters.AddWithValue("@animeId", dto.AnimeId);

        try
        {
            var result = await command.ExecuteScalarAsync();

            if (result == null || result == DBNull.Value)
            {
                throw new Exception("Функция add_bookmark не вернула bookmark_id");
            }

            return Convert.ToInt32(result);
        }
        catch (PostgresException ex)
        {
            throw new Exception(ex.MessageText);
        }
    }

    public async Task DeleteBookmarkAsync(int userId, int animeId)
    {
        var bookmark = await _context.bookmarks
            .AsNoTracking()
            .FirstOrDefaultAsync(b =>
                b.user_id == userId &&
                b.anime_id == animeId
            );

        if (bookmark == null)
        {
            throw new Exception("Закладка не найдена");
        }

        await using var connection = (NpgsqlConnection)_context.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
        {
            await connection.OpenAsync();
        }

        await using var command = new NpgsqlCommand(
            "select delete_bookmark(@bookmarkId, @userId, @animeId);",
            connection
        );

        command.Parameters.AddWithValue("@bookmarkId", bookmark.bookmark_id);
        command.Parameters.AddWithValue("@userId", userId);
        command.Parameters.AddWithValue("@animeId", animeId);

        try
        {
            var result = await command.ExecuteScalarAsync();

            if (result == null || result == DBNull.Value)
            {
                throw new Exception("Функция delete_bookmark не вернула результат");
            }

            var isDeleted = Convert.ToBoolean(result);

            if (!isDeleted)
            {
                throw new Exception("Закладка не была удалена");
            }
        }
        catch (PostgresException ex)
        {
            throw new Exception(ex.MessageText);
        }
    }

    public async Task<List<BookmarkDto>> GetUserBookmarksAsync(int userId)
    {
        return await _context.bookmarks
            .AsNoTracking()
            .Where(b => b.user_id == userId)
            .OrderByDescending(b => b.created_at)
            .Select(b => new BookmarkDto
            {
                BookmarkId = b.bookmark_id,
                AnimeId = b.anime_id,
                TitleRu = b.anime.title_ru,
                TitleOriginal = b.anime.title_original,
                ReleaseYear = b.anime.release_year,
                Type = b.anime.type,
                EpisodesTotal = b.anime.episodes_total,
                PosterUrl = b.anime.poster_url,
                AverageRating = b.anime.average_rating,
                CreatedAt = b.created_at,
                Genres = b.anime.genres
                    .Select(g => g.name)
                    .ToList()
            })
            .ToListAsync();
    }

    public async Task<bool> IsBookmarkedAsync(int userId, int animeId)
    {
        return await _context.bookmarks
            .AsNoTracking()
            .AnyAsync(b =>
                b.user_id == userId &&
                b.anime_id == animeId
            );
    }
}