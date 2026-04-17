using System;
using System.Collections.Generic;

namespace anime_project.Models;

public partial class season
{
    public int season_id { get; set; }

    public int anime_id { get; set; }

    public int season_number { get; set; }

    public string? title { get; set; }

    public string? description { get; set; }

    public DateOnly? release_date { get; set; }

    public int? episodes_count { get; set; }

    public virtual anime anime { get; set; } = null!;

    public virtual ICollection<episode> episodes { get; set; } = new List<episode>();
}
