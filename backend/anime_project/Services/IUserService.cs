
using anime_project.DTOs;

namespace anime_project.Services;

public interface IUserService
{
    Task<List<UserDto>> GetUsersAsync();
    Task<UserDto?> GetUserByIdAsync(int id);

    Task<int> CreateUserAsync(CreateUserDto dto);
    Task<object?> LoginAsync(LoginDto dto);

    Task<List<UserListDto>> GetUserListAsync(int userId);
    Task AddToListAsync(int userId, AddToUserListDto dto);
    Task UpdateUserListAsync(int userId, int animeId, UpdateUserListDto dto);
    Task DeleteFromUserListAsync(int userId, int animeId);
}