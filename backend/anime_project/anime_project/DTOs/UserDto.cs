namespace anime_project.DTOs;

public class UserDto
{
    public int UserId { get; set; }

    public string Nickname { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? AvatarUrl { get; set; }

    public DateTime RegistrationDate { get; set; }

    public string Status { get; set; } = null!;
}