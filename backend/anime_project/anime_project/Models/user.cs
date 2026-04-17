using System;
using System.Collections.Generic;

namespace anime_project.Models;

public partial class user
{
    public int user_id { get; set; }

    public string nickname { get; set; } = null!;

    public string email { get; set; } = null!;

    public string phone { get; set; } = null!;

    public string password_hash { get; set; } = null!;

    public string? avatar_url { get; set; }

    public DateTime registration_date { get; set; }

    public string status { get; set; } = null!;

    public virtual ICollection<action_log> action_logs { get; set; } = new List<action_log>();

    public virtual ICollection<bookmark> bookmarks { get; set; } = new List<bookmark>();

    public virtual ICollection<complaint_user> complaint_users { get; set; } = new List<complaint_user>();

    public virtual ICollection<complaint> complaints { get; set; } = new List<complaint>();

    public virtual ICollection<notification> notifications { get; set; } = new List<notification>();

    public virtual ICollection<review> reviews { get; set; } = new List<review>();

    public virtual ICollection<user_list> user_lists { get; set; } = new List<user_list>();

    public virtual ICollection<visit_stat> visit_stats { get; set; } = new List<visit_stat>();

    public virtual ICollection<watch_history> watch_histories { get; set; } = new List<watch_history>();

    public virtual ICollection<genre> genres { get; set; } = new List<genre>();

    public virtual ICollection<user> subscribers { get; set; } = new List<user>();

    public virtual ICollection<tag> tags { get; set; } = new List<tag>();

    public virtual ICollection<user> target_users { get; set; } = new List<user>();
}
