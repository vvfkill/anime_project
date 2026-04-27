namespace anime_project.DTOs;

public class CreateReviewDto
{
    public int UserId { get; set; }
    public int AnimeId { get; set; }
    public string Text { get; set; } = null!;
    public int Score { get; set; }
}