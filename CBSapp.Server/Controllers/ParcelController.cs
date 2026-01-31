
using CBSapp.Server.DTOs;
using CBSapp.DOMAIN.Entities;
using CBSapp.INFRASTRUCTURE.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;

namespace CBSapp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ParcelController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ParcelController(AppDbContext db) => _context = db;


        [HttpPost]
        public async Task<IActionResult> Post([FromBody] AdaParselEkleDto dto)
        {
            var reader = new WKTReader(); //neden bu alanda wkt kullandıkta geoJsonReader kullanmadık çünkü burda sadece çizilen alanın kordinatları yeterli. Harita ölçümde uzunluk alan hesapları vs birden fazla veri olduğu için geoJsonReader
            var geom = reader.Read(dto.Wkt) as Polygon;
            try
            {
                var adresVarMi = await _context.Addresses
                    .FirstOrDefaultAsync(a =>
                        a.Sehir == dto.AddressDto.Sehir &&
                        a.Ilce == dto.AddressDto.Ilce &&
                        a.Mahalle == dto.AddressDto.Mahalle
                    );

                var mevcutParselVarmi = await _context.AdaParsels.Include(p => p.Address)
                    .FirstOrDefaultAsync(p =>
                        p.Address == adresVarMi &&
                        p.Ada == dto.Ada &&
                        p.Parsel == dto.Parsel
                    );


                if (mevcutParselVarmi != null)
                {
                    return Conflict("Bu ada/parsel zaten kayıtlı");
                }
                //adres var mı kontrolü

                if (adresVarMi == null)
                {
                    adresVarMi = new Address()
                    {
                        Sehir = dto.AddressDto.Sehir,
                        Ilce = dto.AddressDto.Ilce,
                        Mahalle = dto.AddressDto.Mahalle
                    };
                    _context.Addresses.Add(adresVarMi);
                    await _context.SaveChangesAsync();
                }

                //ekle
                var parcel = new AdaParsel
                {
                    AddressId = adresVarMi.Id,

                    Ada = dto.Ada,
                    Parsel = dto.Parsel,
                    Geom = geom,

                };

                _context.AdaParsels.Add(parcel);
                await _context.SaveChangesAsync();

                return Ok(new { parcel.Id });
            }
            catch (Exception err)
            {
                return Conflict(err);
            }


        }


        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string sehir, [FromQuery] string ilce, [FromQuery] string? mahalle, [FromQuery] string ada, [FromQuery] string parsel)
        {
            var sorgu = _context.AdaParsels
                .Include(p => p.Address)
                .AsQueryable();

            if (!string.IsNullOrEmpty(sehir)) sorgu = sorgu.Where(p => p.Address.Sehir == sehir);
            if (!string.IsNullOrEmpty(ilce)) sorgu = sorgu.Where(p => p.Address.Ilce == ilce);
            if (!string.IsNullOrEmpty(mahalle)) sorgu = sorgu.Where(p => p.Address.Mahalle == mahalle);
            if (!string.IsNullOrEmpty(ada)) sorgu = sorgu.Where(p => p.Ada == ada);
            if (!string.IsNullOrEmpty(parsel)) sorgu = sorgu.Where(p => p.Parsel == parsel);

            var parcel = await sorgu.FirstOrDefaultAsync();
            if (parcel == null)
                return NotFound();


            var wktWriter = new WKTWriter();

            var result = new
            {
                id = parcel.Id,
                wkt = wktWriter.Write(parcel.Geom) ?? "",
                ada = parcel.Ada,
                parsel = parcel.Parsel,
                sehir = parcel.Address.Sehir,
                ilce = parcel.Address.Ilce,
                mahalle = parcel.Address.Mahalle

            };

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.AdaParsels.FindAsync(id);
            if (entity == null)
                return NotFound();

            _context.AdaParsels.Remove(entity);
            await _context.SaveChangesAsync();

            return Ok(new { id });
        }

    }

}
