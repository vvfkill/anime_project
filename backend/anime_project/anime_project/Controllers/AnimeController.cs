using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using anime_project.Data;
using anime_project.DTOs;

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
    public async Task<IActionResult> Get()
    {
        var animeList = await _context.animes
            .AsNoTracking()
            .ToListAsync();

        return Ok(animeList);
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
}