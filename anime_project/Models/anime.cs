using System;
using System.Collections.Generic;

namespace anime_project.Models;

public partial class anime
{
    public int anime_id { get; set; }

    public string? title_ru { get; set; }

    public string title_original { get; set; } = null!;

    public string? description { get; set; }

    public int? release_year { get; set; }

    public string? type { get; set; }

    public string? status { get; set; }

    public int? episodes_total { get; set; }

    public int? duration_minutes { get; set; }

    public string? poster_url { get; set; }

    public decimal? average_rating { get; set; }

    public virtual ICollection<anime_character> anime_characters { get; set; } = new List<anime_character>();

    public virtual ICollection<bookmark> bookmarks { get; set; } = new List<bookmark>();

    public virtual ICollection<complaint_anime> complaint_animes { get; set; } = new List<complaint_anime>();

    public virtual ICollection<review> reviews { get; set; } = new List<review>();

    public virtual ICollection<season> seasons { get; set; } = new List<season>();

    public virtual ICollection<user_list> user_lists { get; set; } = new List<user_list>();

    public virtual ICollection<anime> animes { get; set; } = new List<anime>();

    public virtual ICollection<category> categories { get; set; } = new List<category>();

    public virtual ICollection<genre> genres { get; set; } = new List<genre>();

    public virtual ICollection<anime> related_animes { get; set; } = new List<anime>();

    public virtual ICollection<studio> studios { get; set; } = new List<studio>();

    public virtual ICollection<tag> tags { get; set; } = new List<tag>();
}
