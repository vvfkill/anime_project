using System;
using System.Collections.Generic;

namespace anime_project.Models;

public partial class studio
{
    public int studio_id { get; set; }

    public string name { get; set; } = null!;

    public string? country { get; set; }

    public int? foundation_year { get; set; }

    public string? description { get; set; }

    public string? logo_url { get; set; }

    public virtual ICollection<anime> animes { get; set; } = new List<anime>();
}
