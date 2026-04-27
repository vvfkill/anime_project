using System;
using System.Collections.Generic;

namespace anime_project.Models;

public partial class complaint_review
{
    public int complaint_id { get; set; }

    public int review_id { get; set; }

    public virtual complaint complaint { get; set; } = null!;

    public virtual review review { get; set; } = null!;
}
