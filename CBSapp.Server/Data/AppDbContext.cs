using CBSapp.Server.Models;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using Npgsql; // BU SATIR EKLENECEK!


namespace CBSapp.Server.Data
{
    public class AppDbContext:DbContext
    {

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<MeasurementEntity> Measurements => Set<MeasurementEntity>();
        public DbSet<AdaParsel> Parcels => Set<AdaParsel>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            
             modelBuilder.HasPostgresExtension("postgis");
            modelBuilder.Entity<MeasurementEntity>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Geom)
                    .HasColumnType("geometry");
            });


            modelBuilder.Entity<AdaParsel>(entity =>
            {
                entity.Property(e => e.Geom)
                    .HasColumnType("geometry(Polygon, 4326)");

                entity.HasIndex(e => e.Geom)
                    .HasMethod("GIST");

                entity.HasIndex(e => new { e.Sehir, e.Ilce, e.Mahalle, e.Ada, e.Parsel });
            });

        }
    }
}
