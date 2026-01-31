namespace CBSapp.Server.DTOs
{
    public class AdaParselEkleDto
    {
        public int Id { get; set; }
        
        public string Ada { get; set; }
        public string Parsel { get; set; }
        public string Wkt { get; set; } = ""; 

        public AddressDto AddressDto { get; set; } = null!;
    }
}
