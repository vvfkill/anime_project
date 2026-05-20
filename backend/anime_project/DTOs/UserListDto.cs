namespace anime_project.DTOs;

public class UserListDto
{
    public int AnimeId { get; set; }

    public string Title { get; set; } = null!;

    public string? TitleRu { get; set; }

    public string? TitleOriginal { get; set; }

    public int? ReleaseYear { get; set; }

    public string? Type { get; set; }

    public List<string> Genres { get; set; } = new();

    public int? EpisodesTotal { get; set; }

    public string? PosterUrl { get; set; }

    public decimal? AverageRating { get; set; }

    public string Status { get; set; } = null!;

    public int? Score { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
