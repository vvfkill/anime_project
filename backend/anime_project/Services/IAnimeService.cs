using anime_project.DTOs;

namespace anime_project.Services;

public interface IAnimeService
{
    Task<AnimePagedResultDto> GetAnimeAsync(AnimeFilterDto filter);
    Task<AnimeDto?> GetAnimeByIdAsync(int id);
    Task<int> CreateAnimeAsync(CreateAnimeDto dto);
}
