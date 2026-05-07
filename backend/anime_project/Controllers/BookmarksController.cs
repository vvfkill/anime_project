using anime_project.DTOs;
using anime_project.Services;
using Microsoft.AspNetCore.Mvc;

namespace anime_project.Controllers;

[ApiController]
[Route("api/bookmarks")]
public class BookmarksController : ControllerBase {
    private readonly IBookmarkService _bookmarkService;
    public BookmarksController(IBookmarkService bookmarkService)

{
    _bookmarkService = bookmarkService;
}

[HttpPost]
public async Task<IActionResult > AddBookmark([FromBody] AddBookmarkDto dto) {
    try

{
    await _bookmarkService.AddBookmarkAsync(dto);
    return Ok(new { message = "Аниме добавлено в закладки" });
}

catch (Exception ex) {
    return BadRequest(new { message = ex.Message });
}

}

[HttpDelete]
public async Task<IActionResult > RemoveBookmark([FromQuery] int userId, [FromQuery] int animeId) {
    try

{
    await _bookmarkService.RemoveBookmarkAsync(userId, animeId);
    return Ok(new { message = "Аниме удалено из закладок" });
}

catch (Exception ex) {
    return BadRequest(new { message = ex.Message });
}

}

[HttpGet("user/{userId}")]
public async Task<IActionResult> GetUserBookmarks(int userId)
{
    var result = await _bookmarkService.GetUserBookmarksAsync(userId);
    return Ok(result);
}

[HttpGet("check")]
public async Task<IActionResult > CheckBookmark([FromQuery] int userId, [FromQuery] int animeId) {
    var result = await _bookmarkService.IsBookmarkedAsync(userId, animeId);
    return Ok(new { isBookmarked = result });
}
}
