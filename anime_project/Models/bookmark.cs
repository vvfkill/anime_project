using System;
using System.Collections.Generic;

namespace anime_project.Models;

public partial class bookmark
{
    public int bookmark_id { get; set; }

    public int user_id { get; set; }

    public int anime_id { get; set; }

    public DateTime created_at { get; set; }

    public virtual anime anime { get; set; } = null!;

    public virtual user user { get; set; } = null!;
}
