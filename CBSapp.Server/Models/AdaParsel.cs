using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace CBSapp.Server.Models
{
    public class AdaParsel
    {
        [Key]
        public int Id { get; set; }

        public string Sehir { get; set; } = string.Empty;
        public string Ilce { get; set; } = string.Empty;
        public string Mahalle { get; set; } = string.Empty;
        public string Ada { get; set; } = string.Empty;
        public string Parsel { get; set; } = string.Empty;

        [Column("geom")]
        public Polygon Geom { get; set; } = null!;  //multipolygon da kullanabiliriz fakat ihtiyaç yok

        public DateTime CreatAt { get; set; } = DateTime.UtcNow;
    }
}
