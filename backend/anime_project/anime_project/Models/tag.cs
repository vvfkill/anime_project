using System;
using System.Collections.Generic;

namespace anime_project.Models;

public partial class tag
{
    public int tag_id { get; set; }

    public string name { get; set; } = null!;

    public string? description { get; set; }

    public virtual ICollection<anime> animes { get; set; } = new List<anime>();

    public virtual ICollection<user> users { get; set; } = new List<user>();
}
