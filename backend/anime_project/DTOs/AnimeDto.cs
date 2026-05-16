namespace anime_project.DTOs;

public class AnimeDto
{
    public int AnimeId { get; set; }

    public string? TitleRu { get; set; }

    public string TitleOriginal { get; set; } = null!;

    public string? Description { get; set; }

    public string? FullDescription { get; set; }

    public int? ReleaseYear { get; set; }

    public int? EpisodesTotal { get; set; }

    public decimal? AverageRating { get; set; }

    public List<string> Genres { get; set; } = new();

    public List<string> Studios { get; set; } = new();

    public List<string> Tags { get; set; } = new();

    public List<AnimeCharacterDto> Characters { get; set; } = new();

    public string? PosterUrl { get; set; }
}

public class AnimeCharacterDto
{
    public int CharacterId { get; set; }

    public string Name { get; set; } = null!;

    public string? NameOriginal { get; set; }

    public string? Description { get; set; }

    public string? Gender { get; set; }

    public string? RoleType { get; set; }

    public string? ImageUrl { get; set; }

    public List<AnimeSeiyuDto> Seiyus { get; set; } = new();
}

public class AnimeSeiyuDto
{
    public int SeiyuId { get; set; }

    public string Name { get; set; } = null!;

    public string? NameOriginal { get; set; }

    public string? Country { get; set; }

    public string? PhotoUrl { get; set; }
}