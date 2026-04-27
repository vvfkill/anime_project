using System;
using System.Collections.Generic;

namespace anime_project.Models;

public partial class watch_history
{
    public int history_id { get; set; }

    public int user_id { get; set; }

    public int episode_id { get; set; }

    public DateTime watched_at { get; set; }

    public int? progress_seconds { get; set; }

    public bool completed { get; set; }

    public virtual episode episode { get; set; } = null!;

    public virtual user user { get; set; } = null!;
}
