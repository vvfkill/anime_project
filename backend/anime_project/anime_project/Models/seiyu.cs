using System;
using System.Collections.Generic;

namespace anime_project.Models;

public partial class seiyu
{
    public int seiyu_id { get; set; }

    public string name { get; set; } = null!;

    public string? name_original { get; set; }

    public DateOnly? birth_date { get; set; }

    public string? country { get; set; }

    public string? photo_url { get; set; }

    public virtual ICollection<anime_character> characters { get; set; } = new List<anime_character>();
}
