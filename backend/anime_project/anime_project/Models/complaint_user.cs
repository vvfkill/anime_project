using System;
using System.Collections.Generic;

namespace anime_project.Models;

public partial class complaint_user
{
    public int complaint_id { get; set; }

    public int target_user_id { get; set; }

    public virtual complaint complaint { get; set; } = null!;

    public virtual user target_user { get; set; } = null!;
}
