using System;
using System.Collections.Generic;

namespace anime_project.Models;

public partial class visit_stat
{
    public int stat_id { get; set; }

    public int user_id { get; set; }

    public DateTime visited_at { get; set; }

    public string page_url { get; set; } = null!;

    public string? device_type { get; set; }

    public virtual user user { get; set; } = null!;
}
