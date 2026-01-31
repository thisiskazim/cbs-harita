namespace CBSapp.DOMAIN.Entities
{
    public class Address
    {
        public int Id { get; set; }
        public string Sehir { get; set; } = string.Empty;
        public string Ilce { get; set; } = string.Empty;
        public string Mahalle { get; set; } = string.Empty;

        public ICollection<AdaParsel> AdaParsels { get; set; } = new List<AdaParsel>();

    }
}
