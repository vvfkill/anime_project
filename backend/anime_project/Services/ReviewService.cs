using anime_project.Data;
using anime_project.DTOs;
using anime_project.Models;
using Microsoft.EntityFrameworkCore;

namespace anime_project.Services;

public class ReviewService : IReviewService
{
    private readonly AnimeProjectContext _context;

    public ReviewService(AnimeProjectContext context)
    {
        _context = context;
    }

    public async Task CreateReviewAsync(CreateReviewDto dto)
    {
        if (dto.Score < 1 || dto.Score > 10)
            throw new Exception("Оценка должна быть от 1 до 10");

        var userExists = await _context.users
            .AnyAsync(u => u.user_id == dto.UserId);

        if (!userExists)
            throw new Exception("Пользователь не найден");

        var animeExists = await _context.animes
            .AnyAsync(a => a.anime_id == dto.AnimeId);

        if (!animeExists)
            throw new Exception("Аниме не найдено");

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
    }

    public async Task<List<ReviewDto>> GetReviewsByAnimeAsync(int animeId)
    {
        return await _context.reviews
            .Where(r => r.anime_id == animeId)
            .Include(r => r.user)
            .AsNoTracking()
            .OrderByDescending(r => r.created_at)
            .Select(r => new ReviewDto
            {
                ReviewId = r.review_id,
                AnimeId = r.anime_id,
                UserId = r.user_id,
                UserNickname = r.user.nickname,
                Text = r.text,
                Score = r.score,
                CreatedAt = r.created_at
            })
            .ToListAsync();
    }

    public async Task DeleteReviewAsync(int reviewId)
    {
        var review = await _context.reviews
            .FirstOrDefaultAsync(r => r.review_id == reviewId);

        if (review == null)
            throw new Exception("Отзыв не найден");

        _context.reviews.Remove(review);
        await _context.SaveChangesAsync();
    }
}
