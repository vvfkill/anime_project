namespace anime_project.DTOs;

public class CreateUserDto
{
    public string Nickname { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public string Password { get; set; } = null!;
}