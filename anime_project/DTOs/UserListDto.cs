namespace anime_project.DTOs;

public class UserListDto
{
    public int AnimeId { get; set; }

    public string Title { get; set; } = null!;

    public string Status { get; set; } = null!;

    public int? Score { get; set; }
}