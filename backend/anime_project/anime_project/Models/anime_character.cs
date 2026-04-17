using System;
using System.Collections.Generic;

namespace anime_project.Models;

public partial class anime_character
{
    public int character_id { get; set; }

    public int anime_id { get; set; }

    public string name { get; set; } = null!;

    public string? name_original { get; set; }

    public string? description { get; set; }

    public string? gender { get; set; }

    public string? role_type { get; set; }

    public string? image_url { get; set; }

    public virtual anime anime { get; set; } = null!;

    public virtual ICollection<seiyu> seiyus { get; set; } = new List<seiyu>();
}
