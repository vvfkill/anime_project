using System;
using System.Collections.Generic;

namespace anime_project.Models;

public partial class user_list
{
    public int list_id { get; set; }

    public int user_id { get; set; }

    public int anime_id { get; set; }

    public string status { get; set; } = null!;

    public int? personal_score { get; set; }

    public int? episodes_watched { get; set; }

    public string? note { get; set; }

    public DateTime updated_at { get; set; }

    public virtual anime anime { get; set; } = null!;

    public virtual user user { get; set; } = null!;
}
