using System;
using System.Collections.Generic;

namespace anime_project.Models;

public partial class complaint
{
    public int complaint_id { get; set; }

    public int user_id { get; set; }

    public string reason { get; set; } = null!;

    public string? description { get; set; }

    public string status { get; set; } = null!;

    public DateTime created_at { get; set; }

    public virtual complaint_anime? complaint_anime { get; set; }

    public virtual complaint_review? complaint_review { get; set; }

    public virtual complaint_user? complaint_user { get; set; }

    public virtual user user { get; set; } = null!;
}
