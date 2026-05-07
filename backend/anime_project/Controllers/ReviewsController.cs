using Microsoft.AspNetCore.Mvc;
using anime_project.DTOs;
using anime_project.Services;

namespace anime_project.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateReviewDto dto)
    {
        try
        {
            await _reviewService.CreateReviewAsync(dto);
            return Ok(new { message = "Review created" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("/api/anime/{animeId}/reviews")]
    public async Task<IActionResult> GetByAnime(int animeId)
    {
        var reviews = await _reviewService.GetReviewsByAnimeAsync(animeId);
        return Ok(reviews);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _reviewService.DeleteReviewAsync(id);
            return Ok(new { message = "Deleted" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}