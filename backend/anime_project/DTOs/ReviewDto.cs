namespace anime_project.DTOs;

public class ReviewDto
{
    public int ReviewId { get; set; }
    public int AnimeId { get; set; }
    public int UserId { get; set; }

    public string? UserNickname { get; set; }

    public string Text { get; set; } = null!;
    public int Score { get; set; }
    public DateTime CreatedAt { get; set; }
}