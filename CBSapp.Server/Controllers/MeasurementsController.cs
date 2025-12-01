using Microsoft.AspNetCore.Mvc;
using CBSapp.Server.Data;
using CBSapp.Server.DTOs;
using CBSapp.Server.Models;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO; // BURAYA DİKKAT!
using Microsoft.EntityFrameworkCore;


namespace CBSapp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MeasurementsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MeasurementsController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var measurements = await _context.Measurements
                .Select(m => new
                {
                    id = m.Id,
                    type = m.Type,
                    geom = new GeoJsonWriter().Write(m.Geom), 
                    properties = m.Properties
                })
                .ToListAsync();

            return Ok(measurements);
        }


        [HttpPost]
        public async Task<IActionResult> Post([FromBody] MeasurementDto dto)
        {
            var reader = new GeoJsonReader();
            var geom = reader.Read<Geometry>(dto.Geometry);

            var measurement = new MeasurementEntity
            {
                Type = dto.Type,
                Geom = geom,
                Properties = dto.Properties,
                CreatedAt = DateTime.UtcNow
            };

            _context.Measurements.Add(measurement);
            await _context.SaveChangesAsync();

            return Ok(new { id = measurement.Id });
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Measurements.FindAsync(id);
            if (entity == null)
                return NotFound();

            _context.Measurements.Remove(entity);
            await _context.SaveChangesAsync();

            return Ok(new { id }); 
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] MeasurementDto dto)
        {
            var reader = new GeoJsonReader();
            var geom = reader.Read<Geometry>(dto.Geometry);
            var entity = await _context.Measurements.FindAsync(id);
       
            if (entity == null) return NotFound();

            entity.Type = dto.Type;
            entity.Geom = geom;
            entity.Properties = dto.Properties;

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
