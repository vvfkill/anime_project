namespace anime_project.DTOs;

public class AnimeListDto
{
    public int AnimeId { get; set; }

    public string? TitleRu { get; set; }

    public string TitleOriginal { get; set; } = null!;

    public decimal? AverageRating { get; set; }

    public string? PosterUrl { get; set; }
}