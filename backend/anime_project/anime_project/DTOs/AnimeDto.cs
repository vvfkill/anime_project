namespace anime_project.DTOs;

public class AnimeDto
{
    public int AnimeId { get; set; }

    public string? TitleRu { get; set; }

    public string TitleOriginal { get; set; } = null!;

    public string? Description { get; set; }

    public int? ReleaseYear { get; set; }

    public int? EpisodesTotal { get; set; }

    public decimal? AverageRating { get; set; }

    public List<string> Genres { get; set; } = new();

    public List<string> Studios { get; set; } = new();

    public List<string> Tags { get; set; } = new();
}