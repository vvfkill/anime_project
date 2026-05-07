using anime_project.Data;
using anime_project.DTOs;
using anime_project.Models;
using Microsoft.EntityFrameworkCore;

namespace anime_project.Services;

public class AnimeService : IAnimeService
{
    private readonly AnimeProjectContext _context;

    public AnimeService(AnimeProjectContext context)
    {
        _context = context;
    }

    public async Task<AnimePagedResultDto> GetAnimeAsync(AnimeFilterDto filter)
    {
        if (filter.Page < 1)
            filter.Page = 1;

        if (filter.PageSize < 1 || filter.PageSize > 50)
            filter.PageSize = 10;

        var query = _context.animes
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.ToLower();

            query = query.Where(a =>
                (a.title_ru != null && a.title_ru.ToLower().Contains(search)) ||
                (a.title_original != null && a.title_original.ToLower().Contains(search)));
        }

        if (filter.GenreId.HasValue)
        {
            query = query.Where(a =>
                a.genres.Any(g => g.genre_id == filter.GenreId.Value));
        }

        if (filter.TagId.HasValue)
        {
            query = query.Where(a =>
                a.tags.Any(t => t.tag_id == filter.TagId.Value));
        }

        if (filter.StudioId.HasValue)
        {
            query = query.Where(a =>
                a.studios.Any(s => s.studio_id == filter.StudioId.Value));
        }

        if (filter.Year.HasValue)
        {
            query = query.Where(a => a.release_year == filter.Year.Value);
        }

        if (filter.MinRating.HasValue)
        {
            query = query.Where(a => a.average_rating >= filter.MinRating.Value);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(a => a.anime_id)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(a => new AnimeListDto
            {
                AnimeId = a.anime_id,
                TitleRu = a.title_ru,
                TitleOriginal = a.title_original,
                AverageRating = a.average_rating,
                PosterUrl = a.poster_url
            })
            .ToListAsync();

        return new AnimePagedResultDto
        {
            Page = filter.Page,
            PageSize = filter.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize),
            Items = items
        };
    }

    public async Task<AnimeDto?> GetAnimeByIdAsync(int id)
    {
        var anime = await _context.animes
            .Include(a => a.genres)
            .Include(a => a.studios)
            .Include(a => a.tags)
            .Include(a => a.categories)
            .Include(a => a.seasons)
            .Include(a => a.anime_characters)
            .Include(a => a.reviews)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.anime_id == id);

        if (anime == null)
            return null;

        return new AnimeDto
        {
            AnimeId = anime.anime_id,
            TitleRu = anime.title_ru,
            TitleOriginal = anime.title_original,
            Description = anime.description,
            ReleaseYear = anime.release_year,
            EpisodesTotal = anime.episodes_total,
            AverageRating = anime.average_rating,
            PosterUrl = anime.poster_url,

            Genres = anime.genres.Select(g => g.name).ToList(),
            Studios = anime.studios.Select(s => s.name).ToList(),
            Tags = anime.tags.Select(t => t.name).ToList()
        };
    }

    public async Task<int> CreateAnimeAsync(CreateAnimeDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.TitleOriginal))
            throw new Exception("TitleOriginal is required");

        var anime = new anime
        {
            title_original = dto.TitleOriginal,
            title_ru = dto.TitleRu,
            description = dto.Description,
            release_year = dto.ReleaseYear,
            episodes_total = dto.EpisodesTotal,
            duration_minutes = dto.DurationMinutes,
            poster_url = dto.PosterUrl,
            status = "ongoing"
        };

        _context.animes.Add(anime);
        await _context.SaveChangesAsync();

        return anime.anime_id;
    }
}
