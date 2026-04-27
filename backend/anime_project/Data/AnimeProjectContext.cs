using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using anime_project.Models;

namespace anime_project.Data;

public partial class AnimeProjectContext : DbContext
{
    public AnimeProjectContext()
    {
    }

    public AnimeProjectContext(DbContextOptions<AnimeProjectContext> options)
        : base(options)
    {
    }

    public virtual DbSet<action_log> action_logs { get; set; }

    public virtual DbSet<anime> animes { get; set; }

    public virtual DbSet<anime_character> anime_characters { get; set; }

    public virtual DbSet<bookmark> bookmarks { get; set; }

    public virtual DbSet<category> categories { get; set; }

    public virtual DbSet<complaint> complaints { get; set; }

    public virtual DbSet<complaint_anime> complaint_animes { get; set; }

    public virtual DbSet<complaint_review> complaint_reviews { get; set; }

    public virtual DbSet<complaint_user> complaint_users { get; set; }

    public virtual DbSet<episode> episodes { get; set; }

    public virtual DbSet<genre> genres { get; set; }

    public virtual DbSet<notification> notifications { get; set; }

    public virtual DbSet<review> reviews { get; set; }

    public virtual DbSet<season> seasons { get; set; }

    public virtual DbSet<seiyu> seiyus { get; set; }

    public virtual DbSet<studio> studios { get; set; }

    public virtual DbSet<tag> tags { get; set; }

    public virtual DbSet<user> users { get; set; }

    public virtual DbSet<user_list> user_lists { get; set; }

    public virtual DbSet<visit_stat> visit_stats { get; set; }

    public virtual DbSet<watch_history> watch_histories { get; set; }

    //protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
//#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        //=> optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=anime_project;Username=postgres;Password=123");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<action_log>(entity =>
        {
            entity.HasKey(e => e.log_id).HasName("action_log_pkey");

            entity.ToTable("action_log");

            entity.Property(e => e.action_type).HasMaxLength(100);
            entity.Property(e => e.created_at)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone");
            entity.Property(e => e.entity_type).HasMaxLength(100);

            entity.HasOne(d => d.user).WithMany(p => p.action_logs)
                .HasForeignKey(d => d.user_id)
                .HasConstraintName("fk_action_log_user");
        });

        modelBuilder.Entity<anime>(entity =>
        {
            entity.HasKey(e => e.anime_id).HasName("anime_pkey");

            entity.ToTable("anime");

            entity.Property(e => e.average_rating).HasPrecision(3, 2);
            entity.Property(e => e.status).HasMaxLength(50);
            entity.Property(e => e.title_original).HasMaxLength(255);
            entity.Property(e => e.title_ru).HasMaxLength(255);
            entity.Property(e => e.type).HasMaxLength(50);

            entity.HasMany(d => d.animes).WithMany(p => p.related_animes)
                .UsingEntity<Dictionary<string, object>>(
                    "similar_anime",
                    r => r.HasOne<anime>().WithMany()
                        .HasForeignKey("anime_id")
                        .HasConstraintName("fk_similar_anime_left"),
                    l => l.HasOne<anime>().WithMany()
                        .HasForeignKey("related_anime_id")
                        .HasConstraintName("fk_similar_anime_right"),
                    j =>
                    {
                        j.HasKey("anime_id", "related_anime_id").HasName("similar_anime_pkey");
                        j.ToTable("similar_anime");
                    });

            entity.HasMany(d => d.categories).WithMany(p => p.animes)
                .UsingEntity<Dictionary<string, object>>(
                    "anime_category",
                    r => r.HasOne<category>().WithMany()
                        .HasForeignKey("category_id")
                        .HasConstraintName("fk_anime_category_category"),
                    l => l.HasOne<anime>().WithMany()
                        .HasForeignKey("anime_id")
                        .HasConstraintName("fk_anime_category_anime"),
                    j =>
                    {
                        j.HasKey("anime_id", "category_id").HasName("anime_category_pkey");
                        j.ToTable("anime_category");
                    });

            entity.HasMany(d => d.genres).WithMany(p => p.animes)
                .UsingEntity<Dictionary<string, object>>(
                    "anime_genre",
                    r => r.HasOne<genre>().WithMany()
                        .HasForeignKey("genre_id")
                        .HasConstraintName("fk_anime_genre_genre"),
                    l => l.HasOne<anime>().WithMany()
                        .HasForeignKey("anime_id")
                        .HasConstraintName("fk_anime_genre_anime"),
                    j =>
                    {
                        j.HasKey("anime_id", "genre_id").HasName("anime_genre_pkey");
                        j.ToTable("anime_genre");
                    });

            entity.HasMany(d => d.related_animes).WithMany(p => p.animes)
                .UsingEntity<Dictionary<string, object>>(
                    "similar_anime",
                    r => r.HasOne<anime>().WithMany()
                        .HasForeignKey("related_anime_id")
                        .HasConstraintName("fk_similar_anime_right"),
                    l => l.HasOne<anime>().WithMany()
                        .HasForeignKey("anime_id")
                        .HasConstraintName("fk_similar_anime_left"),
                    j =>
                    {
                        j.HasKey("anime_id", "related_anime_id").HasName("similar_anime_pkey");
                        j.ToTable("similar_anime");
                    });

            entity.HasMany(d => d.studios).WithMany(p => p.animes)
                .UsingEntity<Dictionary<string, object>>(
                    "anime_studio",
                    r => r.HasOne<studio>().WithMany()
                        .HasForeignKey("studio_id")
                        .HasConstraintName("fk_anime_studio_studio"),
                    l => l.HasOne<anime>().WithMany()
                        .HasForeignKey("anime_id")
                        .HasConstraintName("fk_anime_studio_anime"),
                    j =>
                    {
                        j.HasKey("anime_id", "studio_id").HasName("anime_studio_pkey");
                        j.ToTable("anime_studio");
                    });

            entity.HasMany(d => d.tags).WithMany(p => p.animes)
                .UsingEntity<Dictionary<string, object>>(
                    "anime_tag",
                    r => r.HasOne<tag>().WithMany()
                        .HasForeignKey("tag_id")
                        .HasConstraintName("fk_anime_tag_tag"),
                    l => l.HasOne<anime>().WithMany()
                        .HasForeignKey("anime_id")
                        .HasConstraintName("fk_anime_tag_anime"),
                    j =>
                    {
                        j.HasKey("anime_id", "tag_id").HasName("anime_tag_pkey");
                        j.ToTable("anime_tag");
                    });
        });

        modelBuilder.Entity<anime_character>(entity =>
        {
            entity.HasKey(e => e.character_id).HasName("anime_character_pkey");

            entity.ToTable("anime_character");

            entity.Property(e => e.gender).HasMaxLength(50);
            entity.Property(e => e.name).HasMaxLength(255);
            entity.Property(e => e.name_original).HasMaxLength(255);
            entity.Property(e => e.role_type).HasMaxLength(50);

            entity.HasOne(d => d.anime).WithMany(p => p.anime_characters)
                .HasForeignKey(d => d.anime_id)
                .HasConstraintName("fk_character_anime");

            entity.HasMany(d => d.seiyus).WithMany(p => p.characters)
                .UsingEntity<Dictionary<string, object>>(
                    "character_seiyu",
                    r => r.HasOne<seiyu>().WithMany()
                        .HasForeignKey("seiyu_id")
                        .HasConstraintName("fk_character_seiyu_seiyu"),
                    l => l.HasOne<anime_character>().WithMany()
                        .HasForeignKey("character_id")
                        .HasConstraintName("fk_character_seiyu_character"),
                    j =>
                    {
                        j.HasKey("character_id", "seiyu_id").HasName("character_seiyu_pkey");
                        j.ToTable("character_seiyu");
                    });
        });

        modelBuilder.Entity<bookmark>(entity =>
        {
            entity.HasKey(e => e.bookmark_id).HasName("bookmark_pkey");

            entity.ToTable("bookmark");

            entity.HasIndex(e => new { e.user_id, e.anime_id }, "uq_bookmark").IsUnique();

            entity.Property(e => e.created_at)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone");

            entity.HasOne(d => d.anime).WithMany(p => p.bookmarks)
                .HasForeignKey(d => d.anime_id)
                .HasConstraintName("fk_bookmark_anime");

            entity.HasOne(d => d.user).WithMany(p => p.bookmarks)
                .HasForeignKey(d => d.user_id)
                .HasConstraintName("fk_bookmark_user");
        });

        modelBuilder.Entity<category>(entity =>
        {
            entity.HasKey(e => e.category_id).HasName("category_pkey");

            entity.ToTable("category");

            entity.HasIndex(e => e.name, "category_name_key").IsUnique();

            entity.Property(e => e.name).HasMaxLength(100);
        });

        modelBuilder.Entity<complaint>(entity =>
        {
            entity.HasKey(e => e.complaint_id).HasName("complaint_pkey");

            entity.ToTable("complaint");

            entity.Property(e => e.created_at)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone");
            entity.Property(e => e.reason).HasMaxLength(255);
            entity.Property(e => e.status).HasMaxLength(50);

            entity.HasOne(d => d.user).WithMany(p => p.complaints)
                .HasForeignKey(d => d.user_id)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_complaint_user");
        });

        modelBuilder.Entity<complaint_anime>(entity =>
        {
            entity.HasKey(e => e.complaint_id).HasName("complaint_anime_pkey");

            entity.ToTable("complaint_anime");

            entity.Property(e => e.complaint_id).ValueGeneratedNever();

            entity.HasOne(d => d.anime).WithMany(p => p.complaint_animes)
                .HasForeignKey(d => d.anime_id)
                .HasConstraintName("fk_complaint_anime_target");

            entity.HasOne(d => d.complaint).WithOne(p => p.complaint_anime)
                .HasForeignKey<complaint_anime>(d => d.complaint_id)
                .HasConstraintName("fk_complaint_anime_complaint");
        });

        modelBuilder.Entity<complaint_review>(entity =>
        {
            entity.HasKey(e => e.complaint_id).HasName("complaint_review_pkey");

            entity.ToTable("complaint_review");

            entity.Property(e => e.complaint_id).ValueGeneratedNever();

            entity.HasOne(d => d.complaint).WithOne(p => p.complaint_review)
                .HasForeignKey<complaint_review>(d => d.complaint_id)
                .HasConstraintName("fk_complaint_review_complaint");

            entity.HasOne(d => d.review).WithMany(p => p.complaint_reviews)
                .HasForeignKey(d => d.review_id)
                .HasConstraintName("fk_complaint_review_target");
        });

        modelBuilder.Entity<complaint_user>(entity =>
        {
            entity.HasKey(e => e.complaint_id).HasName("complaint_user_pkey");

            entity.ToTable("complaint_user");

            entity.Property(e => e.complaint_id).ValueGeneratedNever();

            entity.HasOne(d => d.complaint).WithOne(p => p.complaint_user)
                .HasForeignKey<complaint_user>(d => d.complaint_id)
                .HasConstraintName("fk_complaint_user_complaint");

            entity.HasOne(d => d.target_user).WithMany(p => p.complaint_users)
                .HasForeignKey(d => d.target_user_id)
                .HasConstraintName("fk_complaint_user_target");
        });

        modelBuilder.Entity<episode>(entity =>
        {
            entity.HasKey(e => e.episode_id).HasName("episode_pkey");

            entity.ToTable("episode");

            entity.Property(e => e.title).HasMaxLength(255);

            entity.HasOne(d => d.season).WithMany(p => p.episodes)
                .HasForeignKey(d => d.season_id)
                .HasConstraintName("fk_episode_season");
        });

        modelBuilder.Entity<genre>(entity =>
        {
            entity.HasKey(e => e.genre_id).HasName("genre_pkey");

            entity.ToTable("genre");

            entity.HasIndex(e => e.name, "genre_name_key").IsUnique();

            entity.Property(e => e.name).HasMaxLength(100);
        });

        modelBuilder.Entity<notification>(entity =>
        {
            entity.HasKey(e => e.notification_id).HasName("notification_pkey");

            entity.ToTable("notification");

            entity.Property(e => e.created_at)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone");
            entity.Property(e => e.is_read).HasDefaultValue(false);
            entity.Property(e => e.title).HasMaxLength(255);
            entity.Property(e => e.type).HasMaxLength(100);

            entity.HasOne(d => d.user).WithMany(p => p.notifications)
                .HasForeignKey(d => d.user_id)
                .HasConstraintName("fk_notification_user");
        });

        modelBuilder.Entity<review>(entity =>
        {
            entity.HasKey(e => e.review_id).HasName("review_pkey");

            entity.ToTable("review");

            entity.Property(e => e.created_at)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone");
            entity.Property(e => e.is_spoiler).HasDefaultValue(false);
            entity.Property(e => e.title).HasMaxLength(255);

            entity.HasOne(d => d.anime).WithMany(p => p.reviews)
                .HasForeignKey(d => d.anime_id)
                .HasConstraintName("fk_review_anime");

            entity.HasOne(d => d.user).WithMany(p => p.reviews)
                .HasForeignKey(d => d.user_id)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_review_user");
        });

        modelBuilder.Entity<season>(entity =>
        {
            entity.HasKey(e => e.season_id).HasName("season_pkey");

            entity.ToTable("season");

            entity.Property(e => e.title).HasMaxLength(255);

            entity.HasOne(d => d.anime).WithMany(p => p.seasons)
                .HasForeignKey(d => d.anime_id)
                .HasConstraintName("fk_season_anime");
        });

        modelBuilder.Entity<seiyu>(entity =>
        {
            entity.HasKey(e => e.seiyu_id).HasName("seiyu_pkey");

            entity.ToTable("seiyu");

            entity.Property(e => e.country).HasMaxLength(100);
            entity.Property(e => e.name).HasMaxLength(255);
            entity.Property(e => e.name_original).HasMaxLength(255);
        });

        modelBuilder.Entity<studio>(entity =>
        {
            entity.HasKey(e => e.studio_id).HasName("studio_pkey");

            entity.ToTable("studio");

            entity.Property(e => e.country).HasMaxLength(100);
            entity.Property(e => e.name).HasMaxLength(255);
        });

        modelBuilder.Entity<tag>(entity =>
        {
            entity.HasKey(e => e.tag_id).HasName("tag_pkey");

            entity.ToTable("tag");

            entity.HasIndex(e => e.name, "tag_name_key").IsUnique();

            entity.Property(e => e.name).HasMaxLength(100);
        });

        modelBuilder.Entity<user>(entity =>
        {
            entity.HasKey(e => e.user_id).HasName("users_pkey");

            entity.HasIndex(e => e.email, "users_email_key").IsUnique();

            entity.HasIndex(e => e.phone, "users_phone_key").IsUnique();

            entity.Property(e => e.email).HasMaxLength(255);
            entity.Property(e => e.nickname).HasMaxLength(100);
            entity.Property(e => e.phone).HasMaxLength(20);
            entity.Property(e => e.registration_date)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone");
            entity.Property(e => e.status).HasMaxLength(50);

            entity.HasMany(d => d.genres).WithMany(p => p.users)
                .UsingEntity<Dictionary<string, object>>(
                    "user_genre",
                    r => r.HasOne<genre>().WithMany()
                        .HasForeignKey("genre_id")
                        .HasConstraintName("fk_user_genre_genre"),
                    l => l.HasOne<user>().WithMany()
                        .HasForeignKey("user_id")
                        .HasConstraintName("fk_user_genre_user"),
                    j =>
                    {
                        j.HasKey("user_id", "genre_id").HasName("user_genre_pkey");
                        j.ToTable("user_genre");
                    });

            entity.HasMany(d => d.subscribers).WithMany(p => p.target_users)
                .UsingEntity<Dictionary<string, object>>(
                    "subscription",
                    r => r.HasOne<user>().WithMany()
                        .HasForeignKey("subscriber_id")
                        .HasConstraintName("fk_subscription_subscriber"),
                    l => l.HasOne<user>().WithMany()
                        .HasForeignKey("target_user_id")
                        .HasConstraintName("fk_subscription_target"),
                    j =>
                    {
                        j.HasKey("subscriber_id", "target_user_id").HasName("subscription_pkey");
                        j.ToTable("subscription");
                    });

            entity.HasMany(d => d.tags).WithMany(p => p.users)
                .UsingEntity<Dictionary<string, object>>(
                    "user_tag",
                    r => r.HasOne<tag>().WithMany()
                        .HasForeignKey("tag_id")
                        .HasConstraintName("fk_user_tag_tag"),
                    l => l.HasOne<user>().WithMany()
                        .HasForeignKey("user_id")
                        .HasConstraintName("fk_user_tag_user"),
                    j =>
                    {
                        j.HasKey("user_id", "tag_id").HasName("user_tag_pkey");
                        j.ToTable("user_tag");
                    });

            entity.HasMany(d => d.target_users).WithMany(p => p.subscribers)
                .UsingEntity<Dictionary<string, object>>(
                    "subscription",
                    r => r.HasOne<user>().WithMany()
                        .HasForeignKey("target_user_id")
                        .HasConstraintName("fk_subscription_target"),
                    l => l.HasOne<user>().WithMany()
                        .HasForeignKey("subscriber_id")
                        .HasConstraintName("fk_subscription_subscriber"),
                    j =>
                    {
                        j.HasKey("subscriber_id", "target_user_id").HasName("subscription_pkey");
                        j.ToTable("subscription");
                    });
        });

        modelBuilder.Entity<user_list>(entity =>
        {
            entity.HasKey(e => e.list_id).HasName("user_list_pkey");

            entity.ToTable("user_list");

            entity.HasIndex(e => new { e.user_id, e.anime_id }, "uq_user_list").IsUnique();

            entity.Property(e => e.episodes_watched).HasDefaultValue(0);
            entity.Property(e => e.status).HasMaxLength(50);
            entity.Property(e => e.updated_at)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone");

            entity.HasOne(d => d.anime).WithMany(p => p.user_lists)
                .HasForeignKey(d => d.anime_id)
                .HasConstraintName("fk_user_list_anime");

            entity.HasOne(d => d.user).WithMany(p => p.user_lists)
                .HasForeignKey(d => d.user_id)
                .HasConstraintName("fk_user_list_user");
        });

        modelBuilder.Entity<visit_stat>(entity =>
        {
            entity.HasKey(e => e.stat_id).HasName("visit_stats_pkey");

            entity.Property(e => e.device_type).HasMaxLength(100);
            entity.Property(e => e.visited_at)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone");

            entity.HasOne(d => d.user).WithMany(p => p.visit_stats)
                .HasForeignKey(d => d.user_id)
                .HasConstraintName("fk_visit_stats_user");
        });

        modelBuilder.Entity<watch_history>(entity =>
        {
            entity.HasKey(e => e.history_id).HasName("watch_history_pkey");

            entity.ToTable("watch_history");

            entity.Property(e => e.completed).HasDefaultValue(false);
            entity.Property(e => e.progress_seconds).HasDefaultValue(0);
            entity.Property(e => e.watched_at)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone");

            entity.HasOne(d => d.episode).WithMany(p => p.watch_histories)
                .HasForeignKey(d => d.episode_id)
                .HasConstraintName("fk_watch_history_episode");

            entity.HasOne(d => d.user).WithMany(p => p.watch_histories)
                .HasForeignKey(d => d.user_id)
                .HasConstraintName("fk_watch_history_user");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
