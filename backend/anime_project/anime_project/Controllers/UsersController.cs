using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using anime_project.Data;
using anime_project.DTOs;
using anime_project.Models;

namespace anime_project.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AnimeProjectContext _context;

    public UsersController(AnimeProjectContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var users = await _context.users
            .AsNoTracking()
            .Select(u => new UserDto
            {
                UserId = u.user_id,
                Nickname = u.nickname,
                Email = u.email,
                AvatarUrl = u.avatar_url,
                RegistrationDate = u.registration_date,
                Status = u.status
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _context.users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.user_id == id);

        if (user == null)
            return NotFound();

        var result = new UserDto
        {
            UserId = user.user_id,
            Nickname = user.nickname,
            Email = user.email,
            AvatarUrl = user.avatar_url,
            RegistrationDate = user.registration_date,
            Status = user.status
        };

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateUserDto dto)
    {
        var user = new user
        {
            nickname = dto.Nickname,
            email = dto.Email,
            phone = dto.Phone,
            password_hash = dto.Password, // пока без хеширования
            registration_date = DateTime.Now,
            status = "active"
        };

        _context.users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "User created",
            userId = user.user_id
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _context.users
            .FirstOrDefaultAsync(u => u.email == dto.Email);

        if (user == null)
            return Unauthorized("Invalid email or password");

        if (user.password_hash != dto.Password)
            return Unauthorized("Invalid email or password");

        return Ok(new
        {
            message = "Login successful",
            userId = user.user_id,
            nickname = user.nickname
        });
    }

    [HttpGet("{id}/list")]
    public async Task<IActionResult> GetUserList(int id)
    {
        var list = await _context.user_lists
            .Where(x => x.user_id == id)
            .Include(x => x.anime)
            .Select(x => new UserListDto
            {
                AnimeId = x.anime_id,
                Title = x.anime.title_original,
                Status = x.status,
                Score = x.personal_score
            })
            .ToListAsync();

        return Ok(list);
    }

    [HttpPost("{id}/list")]
    public async Task<IActionResult> AddToList(int id, AddToUserListDto dto)
    {
        var exists = await _context.user_lists
            .AnyAsync(x => x.user_id == id && x.anime_id == dto.AnimeId);

        if (exists)
            return Conflict("Anime already in list");

        var item = new user_list
        {
            user_id = id,
            anime_id = dto.AnimeId,
            status = dto.Status,
            personal_score = dto.Score
        };

        _context.user_lists.Add(item);
        await _context.SaveChangesAsync();

        return Ok("Added to list");
    }

}