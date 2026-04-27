namespace anime_project.DTOs;

public class AddToUserListDto
{
    public int AnimeId { get; set; }

    public string Status { get; set; } = null!;

    public int? Score { get; set; }
}