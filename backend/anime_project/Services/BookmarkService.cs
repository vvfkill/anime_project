using anime_project.Data;
using anime_project.DTOs;
using anime_project.Models;
using Microsoft.EntityFrameworkCore;

namespace anime_project.Services;

public class BookmarkService : IBookmarkService
{
    private readonly AnimeProjectContext _context;

    public BookmarkService(AnimeProjectContext context)
    {
        _context = context;
    }

    public async Task AddBookmarkAsync(AddBookmarkDto dto)
    {
        var userExists = await _context.users
            .AnyAsync(u => u.user_id == dto.UserId);

        if (!userExists)
            throw new Exception("Пользователь не найден");

        var animeExists = await _context.animes
            .AnyAsync(a => a.anime_id == dto.AnimeId);

        if (!animeExists)
            throw new Exception("Аниме не найдено");

        var bookmarkExists = await _context.bookmarks
            .AnyAsync(b => b.user_id == dto.UserId && b.anime_id == dto.AnimeId);

        if (bookmarkExists)
            throw new Exception("Аниме уже добавлено в закладки");

        var bookmark = new bookmark
        {
            user_id = dto.UserId,
            anime_id = dto.AnimeId,
            created_at = DateTime.Now
        };

        _context.bookmarks.Add(bookmark);
        await _context.SaveChangesAsync();
    }

    public async Task RemoveBookmarkAsync(int userId, int animeId)
    {
        var bookmark = await _context.bookmarks
            .FirstOrDefaultAsync(b => b.user_id == userId && b.anime_id == animeId);

        if (bookmark == null)
            throw new Exception("Закладка не найдена");

        _context.bookmarks.Remove(bookmark);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> IsBookmarkedAsync(int userId, int animeId)
    {
        return await _context.bookmarks
            .AnyAsync(b => b.user_id == userId && b.anime_id == animeId);
    }

    public async Task<List<BookmarkDto>> GetUserBookmarksAsync(int userId)
    {
        return await _context.bookmarks
            .Include(b => b.anime)
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
                CreatedAt = b.created_at
            })
            .ToListAsync();
    }
}