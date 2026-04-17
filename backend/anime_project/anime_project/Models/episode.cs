using System;
using System.Collections.Generic;

namespace anime_project.Models;

public partial class episode
{
    public int episode_id { get; set; }

    public int season_id { get; set; }

    public int episode_number { get; set; }

    public string? title { get; set; }

    public string? description { get; set; }

    public int? duration_minutes { get; set; }

    public DateOnly? release_date { get; set; }

    public string? video_url { get; set; }

    public virtual season season { get; set; } = null!;

    public virtual ICollection<watch_history> watch_histories { get; set; } = new List<watch_history>();
}
