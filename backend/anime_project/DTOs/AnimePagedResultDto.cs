namespace anime_project.DTOs;

public class AnimePagedResultDto
{
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }

    public List<AnimeListDto> Items { get; set; } = new();
}
