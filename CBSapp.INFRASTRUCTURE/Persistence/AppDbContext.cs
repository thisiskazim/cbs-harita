using CBSapp.DOMAIN.Entities;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using Npgsql;

namespace CBSapp.INFRASTRUCTURE.Persistence
{
    public class AppDbContext : DbContext
    {

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<MeasurementEntity> Measurements => Set<MeasurementEntity>();
        public DbSet<Address> Addresses => Set<Address>();
        public DbSet<AdaParsel> AdaParsels => Set<AdaParsel>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {


            modelBuilder.HasPostgresExtension("postgis");
            modelBuilder.Entity<MeasurementEntity>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Geom)
                    .HasColumnType("geometry");
            });

            modelBuilder.Entity<Address>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<AdaParsel>(entity =>
            {
            
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Geom)
                      .HasColumnType("geometry(Polygon, 4326)");

                
                entity.HasIndex(e => e.Geom)
                      .HasMethod("GIST");


                entity.HasIndex(e => new { e.AddressId, e.Ada, e.Parsel })
                      .IsUnique();

                entity.HasOne(d => d.Address)
                      .WithMany(a => a.AdaParsels)
                      .HasForeignKey(d => d.AddressId)
                      .OnDelete(DeleteBehavior.Restrict);
            });












        }
    }
}
