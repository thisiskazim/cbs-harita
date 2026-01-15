using CBSapp.Server.Models;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using Npgsql; 

namespace CBSapp.Server.Data
{
    public class AppDbContext:DbContext
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

            //haskey  adaparsel ve adress için 

            modelBuilder.Entity<Address>(entity =>
            {
               // entity.ToTable("Adresler");
                entity.HasKey(e => e.Id);

                // İsteğe bağlı: aynı şehir-ilçe-mahalle kombinasyonunu unique yapmak istersen
                // entity.HasIndex(e => new { e.Sehir, e.Ilce, e.Mahalle }).IsUnique();
            });

            modelBuilder.Entity<AdaParsel>(entity =>
    {
        entity.ToTable("AdaParseller");
        entity.HasKey(e => e.Id);

        entity.Property(e => e.Geom)
             .HasColumnType("geometry(Polygon, 4326)");  // SRID 4326 açıkça belirtilmiş

        // Spatial index → PostGIS'te olmazsa olmaz
        entity.HasIndex(e => e.Geom)
              .HasMethod("GIST");

        // Yeni unique / hızlı arama index'i
        // Artık şehir/ilçe/mahalle Adres tablosunda olduğu için:
        entity.HasIndex(e => new { e.AddressId, e.Ada, e.Parsel })
              .IsUnique();   // unique istemiyorsan false, istiyorsan true

        // İlişki tanımı (opsiyonel – AdresId null olabilir)
        entity.HasOne(d => d.Address)
              .WithMany(a => a.AdaParsels)
              .HasForeignKey(d => d.AddressId)
              .OnDelete(DeleteBehavior.SetNull);   // adres silinirse AdresId → null
    });












            //modelBuilder.Entity<AdaParsel>(entity =>
            //    {
            //    entity.Property(e => e.Geom)
            //        .HasColumnType("geometry(Polygon, 4326)");

            //    entity.HasIndex(e => e.Geom)
            //        .HasMethod("GIST");

            //    entity.HasIndex(e => new { e.Sehir, e.Ilce, e.Mahalle, e.Ada, e.Parsel });
            //});

        }
    }
}
