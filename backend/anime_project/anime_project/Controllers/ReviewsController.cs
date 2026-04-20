using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using anime_project.Data;
using anime_project.Models;
using anime_project.DTOs;

namespace anime_project.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly AnimeProjectContext _context;

    public ReviewsController(AnimeProjectContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateReviewDto dto)
    {
        if (dto.Score < 1 || dto.Score > 10)
            return BadRequest("Score must be between 1 and 10");

        var review = new review
        {
            user_id = dto.UserId,
            anime_id = dto.AnimeId,
            text = dto.Text,
            score = dto.Score,
            created_at = DateTime.Now
        };

        _context.reviews.Add(review);
        await _context.SaveChangesAsync();

        return Ok("Review created");
    }

    [HttpGet("/api/anime/{animeId}/reviews")]
    public async Task<IActionResult> GetByAnime(int animeId)
    {
        var reviews = await _context.reviews
            .Where(r => r.anime_id == animeId)
            .Include(r => r.user)
            .Select(r => new
            {
                r.review_id,
                r.text,
                r.score,
                user = r.user.nickname
            })
            .ToListAsync();

        return Ok(reviews);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var review = await _context.reviews.FindAsync(id);

        if (review == null)
            return NotFound();

        _context.reviews.Remove(review);
        await _context.SaveChangesAsync();

        return Ok("Deleted");
    }
}