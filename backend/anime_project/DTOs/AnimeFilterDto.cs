namespace anime_project.DTOs;

public class AnimeFilterDto
{
    public string? Search { get; set; }

    public int? GenreId { get; set; }
    public int? TagId { get; set; }
    public int? StudioId { get; set; }

    public int? Year { get; set; }
    public decimal? MinRating { get; set; }

    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
