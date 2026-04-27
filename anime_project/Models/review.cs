using System;
using System.Collections.Generic;

namespace anime_project.Models;

public partial class review
{
    public int review_id { get; set; }

    public int user_id { get; set; }

    public int anime_id { get; set; }

    public string? title { get; set; }

    public string text { get; set; } = null!;

    public int score { get; set; }

    public DateTime created_at { get; set; }

    public bool is_spoiler { get; set; }

    public virtual anime anime { get; set; } = null!;

    public virtual ICollection<complaint_review> complaint_reviews { get; set; } = new List<complaint_review>();

    public virtual user user { get; set; } = null!;
}
