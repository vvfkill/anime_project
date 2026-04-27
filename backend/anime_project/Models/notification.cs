using System;
using System.Collections.Generic;

namespace anime_project.Models;

public partial class notification
{
    public int notification_id { get; set; }

    public int user_id { get; set; }

    public string title { get; set; } = null!;

    public string text { get; set; } = null!;

    public string type { get; set; } = null!;

    public bool is_read { get; set; }

    public DateTime created_at { get; set; }

    public virtual user user { get; set; } = null!;
}
