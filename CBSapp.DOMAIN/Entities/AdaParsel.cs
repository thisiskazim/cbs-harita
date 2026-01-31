using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace CBSapp.DOMAIN.Entities
{
    public class AdaParsel
    {
        [Key]
        public int Id { get; set; }

        public Address Address { get; set; }
        public int AddressId { get; set; }

        public string Ada { get; set; } //0 ile başlayabilecği için string
        public string Parsel { get; set; } 

        [Column("geom")]
        public Polygon Geom { get; set; } = null!;  //multipolygon da kullanabiliriz fakat ihtiyaç yok

        public DateTime CreatAt { get; set; } = DateTime.UtcNow;
    }
}
