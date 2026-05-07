using anime_project.DTOs;

namespace anime_project.Services;

public interface IReviewService
{
    Task CreateReviewAsync(CreateReviewDto dto);
    Task<List<ReviewDto>> GetReviewsByAnimeAsync(int animeId);
    Task DeleteReviewAsync(int reviewId);
}
