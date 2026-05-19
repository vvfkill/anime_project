using anime_project.DTOs;
using anime_project.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace anime_project.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var users = await _userService.GetUsersAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _userService.GetUserByIdAsync(id);

        if (user == null)
            return NotFound();

        return Ok(user);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateUserDto dto)
    {
        try
        {
            var userId = await _userService.CreateUserAsync(dto);

            return Ok(new
            {
                message = "User created",
                userId
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var result = await _userService.LoginAsync(dto);

        if (result == null)
            return Unauthorized(new { message = "Invalid email or password" });

        return Ok(result);
    }

    [HttpGet("{id}/list")]
    public async Task<IActionResult> GetUserList(int id)
    {
        var list = await _userService.GetUserListAsync(id);
        return Ok(list);
    }

    [HttpPost("{id}/list")]
    public async Task<IActionResult> AddToList(int id, AddToUserListDto dto)
    {
        try
        {
            await _userService.AddToListAsync(id, dto);
            return Ok(new { message = "Added to list" });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (DbUpdateException ex)
{
            return BadRequest(new
            {
                message = ex.InnerException?.Message ?? ex.Message
            });
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPut("{userId}/list/{animeId}")]
    public async Task<IActionResult> UpdateUserList(int userId, int animeId, UpdateUserListDto dto)
    {
        try
        {
            await _userService.UpdateUserListAsync(userId, animeId, dto);
            return Ok(new { message = "Updated" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (DbUpdateException)
        {
            return BadRequest(new { message = "Не удалось сохранить статус. Проверьте ограничение chk_user_list_status в базе данных." });
        }
    }

    [HttpDelete("{userId}/list/{animeId}")]
    public async Task<IActionResult> DeleteFromUserList(int userId, int animeId)
    {
        try
        {
            await _userService.DeleteFromUserListAsync(userId, animeId);
            return Ok(new { message = "Deleted" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
