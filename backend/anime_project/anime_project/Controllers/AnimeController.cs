using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using anime_project.Data;
using anime_project.DTOs;
using anime_project.Models;

namespace anime_project.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnimeController : ControllerBase
{
    private readonly AnimeProjectContext _context;

    public AnimeController(AnimeProjectContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get(string? search ,int page = 1, int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 50) pageSize = 10;

        var query = _context.animes.AsNoTracking();

        var totalCount = await query.CountAsync();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(a =>
                a.title_ru!.ToLower().Contains(search.ToLower()) ||
                a.title_original.ToLower().Contains(search.ToLower()));
        }

        var items = await query
            .OrderBy(a => a.anime_id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AnimeListDto
            {
                AnimeId = a.anime_id,
                TitleRu = a.title_ru,
                TitleOriginal = a.title_original,
                AverageRating = a.average_rating,
                PosterUrl = a.poster_url
            })
            .ToListAsync();

        var result = new
        {
            page,
            pageSize,
            totalCount,
            totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
            items
        };

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
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
            return NotFound();


        var result = new AnimeDto
        {
            AnimeId = anime.anime_id,
            TitleRu = anime.title_ru,
            TitleOriginal = anime.title_original,
            Description = anime.description,
            ReleaseYear = anime.release_year,
            EpisodesTotal = anime.episodes_total,
            AverageRating = anime.average_rating,

            Genres = anime.genres.Select(g => g.name).ToList(),
            Studios = anime.studios.Select(s => s.name).ToList(),
            Tags = anime.tags.Select(t => t.name).ToList()
        };

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateAnimeDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.TitleOriginal))
            return BadRequest("TitleOriginal is required");

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

        return Ok(new
        {
            message = "Anime created",
            animeId = anime.anime_id
        });
    }
}