namespace anime_project.DTOs;

public class BookmarkDto
{
    public int BookmarkId { get; set; }
    public int AnimeId { get; set; }
    public string? TitleRu { get; set; }
    public string? TitleOriginal { get; set; }
    public int? ReleaseYear { get; set; }
    public string? Type { get; set; }
    public int? EpisodesTotal { get; set; }
    public string? PosterUrl { get; set; }
    public decimal? AverageRating { get; set; }
    public DateTime? CreatedAt { get; set; }
}