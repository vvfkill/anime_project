using System;
using System.Collections.Generic;

namespace anime_project.Models;

public partial class category
{
    public int category_id { get; set; }

    public string name { get; set; } = null!;

    public string? description { get; set; }

    public virtual ICollection<anime> animes { get; set; } = new List<anime>();
}
