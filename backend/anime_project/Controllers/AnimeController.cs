using Microsoft.AspNetCore.Mvc;
using anime_project.DTOs;
using anime_project.Services;

namespace anime_project.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnimeController : ControllerBase
{
    private readonly IAnimeService _animeService;

    public AnimeController(IAnimeService animeService)
    {
        _animeService = animeService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] AnimeFilterDto filter)
    {
        var result = await _animeService.GetAnimeAsync(filter);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _animeService.GetAnimeByIdAsync(id);

        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateAnimeDto dto)
    {
        try
        {
            var animeId = await _animeService.CreateAnimeAsync(dto);

            return Ok(new
            {
                message = "Anime created",
                animeId
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}