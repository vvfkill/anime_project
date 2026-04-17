using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using anime_project.Data;

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
}