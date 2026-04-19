namespace anime_project.DTOs;

public class BookmarkDto
{
    public int AnimeId { get; set; }
    public string Title { get; set; } = null!;
    public string? PosterUrl { get; set; }
}