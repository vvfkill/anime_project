using anime_project.DTOs;

namespace anime_project.Services;

public interface IBookmarkService
{
    Task<List<BookmarkDto>> GetUserBookmarksAsync(int userId);
    Task<bool> IsBookmarkedAsync(int userId, int animeId);
    Task AddBookmarkAsync(AddBookmarkDto dto);
    Task DeleteBookmarkAsync(int userId, int animeId);
}