namespace anime_project.DTOs;

public class CreateAnimeDto
{
    public string TitleOriginal { get; set; } = null!;
    public string? TitleRu { get; set; }
    public string? Description { get; set; }
    public int? ReleaseYear { get; set; }
    public int? EpisodesTotal { get; set; }
    public int? DurationMinutes { get; set; }
    public string? PosterUrl { get; set; }
}