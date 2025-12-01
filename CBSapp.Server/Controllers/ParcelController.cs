using CBSapp.Server.Data;
using CBSapp.Server.DTOs;
using CBSapp.Server.Models;
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


            var mevcutParselVarmi = await _context.Parcels
                .FirstOrDefaultAsync(p =>
                    p.Ada == dto.Ada &&
                    p.Parsel == dto.Parsel &&
                    p.Mahalle == dto.Mahalle &&
                    p.Ilce == dto.Ilce &&
                    p.Sehir == dto.Sehir
                );

            if (mevcutParselVarmi != null)
            {
                return Conflict("Bu ada/parsel zaten kayıtlı");
            }

            var parcel = new AdaParsel
            {
                Sehir = dto.Sehir,
                Ilce = dto.Ilce,
                Mahalle = dto.Mahalle,
                Ada = dto.Ada,
                Parsel = dto.Parsel,
                Geom = geom
            };

            _context.Parcels.Add(parcel);
            await _context.SaveChangesAsync();

            return Ok(new { parcel.Id });
        

        }


        [HttpGet("search")]
        public async Task<IActionResult> Search(
            [FromQuery] string sehir,
            [FromQuery] string ilce,
            [FromQuery] string? mahalle,
            [FromQuery] string ada,
            [FromQuery] string parsel)
        {
            var query = _context.Parcels.AsQueryable();

            if (!string.IsNullOrEmpty(sehir)) query = query.Where(p => p.Sehir == sehir);
            if (!string.IsNullOrEmpty(ilce)) query = query.Where(p => p.Ilce == ilce);
            if (!string.IsNullOrEmpty(mahalle)) query = query.Where(p => p.Mahalle == mahalle);
            if (!string.IsNullOrEmpty(ada)) query = query.Where(p => p.Ada == ada);
            if (!string.IsNullOrEmpty(parsel)) query = query.Where(p => p.Parsel == parsel);

            var parcel = await query.FirstOrDefaultAsync();
            if (parcel == null) 
                return NotFound();

            
            var wktWriter = new WKTWriter();

            var result = new
            {
                id = parcel.Id,
                wkt = wktWriter.Write(parcel.Geom) ?? ""
            };

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Parcels.FindAsync(id);
            if (entity == null)
                return NotFound();

            _context.Parcels.Remove(entity);
            await _context.SaveChangesAsync();

            return Ok(new { id });
        }

    }

}
