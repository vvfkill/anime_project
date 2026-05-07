using anime_project.DTOs;

namespace anime_project.Services;

public interface IBookmarkService
{
    Task AddBookmarkAsync(AddBookmarkDto dto);
    Task RemoveBookmarkAsync(int userId, int animeId);
    Task<bool> IsBookmarkedAsync(int userId, int animeId);
    Task<List<BookmarkDto>> GetUserBookmarksAsync(int userId);
}