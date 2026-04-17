using System;
using System.Collections.Generic;

namespace anime_project.Models;

public partial class complaint_anime
{
    public int complaint_id { get; set; }

    public int anime_id { get; set; }

    public virtual anime anime { get; set; } = null!;

    public virtual complaint complaint { get; set; } = null!;
}
