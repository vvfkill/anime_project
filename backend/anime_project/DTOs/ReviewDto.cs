namespace anime_project.DTOs;

public class ReviewDto
{
    public int ReviewId { get; set; }

    public int AnimeId { get; set; }
    public string? AnimeTitleRu { get; set; }
    public string? AnimeTitleOriginal { get; set; }
    public string? AnimePosterUrl { get; set; }
    public int? AnimeReleaseYear { get; set; }
    public string? AnimeType { get; set; }
    public decimal? AnimeAverageRating { get; set; }

    public int UserId { get; set; }
    public string? UserNickname { get; set; }

    public string Text { get; set; } = null!;
    public int Score { get; set; }
    public DateTime CreatedAt { get; set; }
}