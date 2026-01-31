using NetTopologySuite.Geometries;


namespace CBSapp.DOMAIN.Entities
{
    public class MeasurementEntity
    {
        public int Id { get; set; }
        public string Type { get; set; } = "";
        public Geometry Geom { get; set; } = null!;
        public string Properties { get; set; } = "";
        public DateTime CreatedAt { get; set; }
    }
}
