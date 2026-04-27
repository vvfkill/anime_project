using System;
using System.Collections.Generic;

namespace anime_project.Models;

public partial class action_log
{
    public int log_id { get; set; }

    public int user_id { get; set; }

    public string action_type { get; set; } = null!;

    public string entity_type { get; set; } = null!;

    public int entity_id { get; set; }

    public DateTime created_at { get; set; }

    public virtual user user { get; set; } = null!;
}
