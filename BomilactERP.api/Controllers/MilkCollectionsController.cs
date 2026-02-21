using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BomilactERP.api.Data;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MilkCollectionsController : ControllerBase
{
    private readonly BomilactDbContext _context;
    private readonly ILogger<MilkCollectionsController> _logger;

    public MilkCollectionsController(BomilactDbContext context, ILogger<MilkCollectionsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MilkCollectionEntryDto>>> GetAll([FromQuery] string? date = null, [FromQuery] string? searchTerm = null)
    {
        try
        {
            DateTime? filterDate = null;
            if (!string.IsNullOrWhiteSpace(date))
            {
                if (!DateTime.TryParse(date, out var parsedDate))
                {
                    return BadRequest(new { message = "Invalid date format." });
                }
                filterDate = parsedDate.Date;
            }

            var query = _context.MilkCollectionEntries
                .Include(e => e.Partner)
                .Include(e => e.Vehicle)
                .AsNoTracking()
                .AsQueryable();

            if (filterDate.HasValue)
            {
                var start = filterDate.Value;
                var end = start.AddDays(1);
                query = query.Where(e => e.Timestamp >= start && e.Timestamp < end);
            }

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var search = searchTerm.Trim().ToLower();
                query = query.Where(e =>
                    e.Partner.Name.ToLower().Contains(search) ||
                    e.VehiclePlate.ToLower().Contains(search) ||
                    e.SampleId.ToLower().Contains(search));
            }

            var entries = await query
                .OrderByDescending(e => e.Timestamp)
                .ToListAsync();

            return Ok(entries.Select(MapEntry));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching milk collections");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MilkCollectionEntryDto>> GetById(int id)
    {
        try
        {
            var entry = await _context.MilkCollectionEntries
                .Include(e => e.Partner)
                .Include(e => e.Vehicle)
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id);

            if (entry == null)
            {
                return NotFound();
            }

            return Ok(MapEntry(entry));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching milk collection {EntryId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<MilkCollectionEntryDto>> Create(CreateMilkCollectionEntryDto dto)
    {
        try
        {
            var partner = await _context.Partners.FirstOrDefaultAsync(p => p.Id == dto.SupplierId);
            if (partner == null)
            {
                return BadRequest(new { message = "Supplier not found." });
            }

            Vehicle? vehicle = null;
            if (dto.VehicleId.HasValue)
            {
                vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == dto.VehicleId.Value);
                if (vehicle == null)
                {
                    return BadRequest(new { message = "Vehicle not found." });
                }
            }

            var timestamp = ParseTimestamp(dto.Timestamp) ?? DateTime.UtcNow;
            var vehiclePlate = ResolveVehiclePlate(dto.VehiclePlate, vehicle);

            var entry = new MilkCollectionEntry
            {
                Timestamp = timestamp,
                PartnerId = partner.Id,
                VehicleId = vehicle?.Id,
                VehiclePlate = vehiclePlate,
                QuantityLiters = dto.QuantityLiters,
                FatPercentage = dto.FatPercentage,
                ProteinPercentage = dto.ProteinPercentage,
                TemperatureC = dto.Temperature,
                Ph = dto.Ph,
                AntibioticTest = ParseAntibioticTest(dto.AntibioticTest),
                SampleId = dto.SampleId.Trim(),
                Status = ParseStatus(dto.Status),
                InspectorName = dto.Inspector.Trim(),
                Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim()
            };

            _context.MilkCollectionEntries.Add(entry);
            await _context.SaveChangesAsync();

            await _context.Entry(entry).Reference(e => e.Partner).LoadAsync();
            await _context.Entry(entry).Reference(e => e.Vehicle).LoadAsync();

            return CreatedAtAction(nameof(GetById), new { id = entry.Id }, MapEntry(entry));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating milk collection entry");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateMilkCollectionEntryDto dto)
    {
        try
        {
            var entry = await _context.MilkCollectionEntries.FirstOrDefaultAsync(e => e.Id == id);
            if (entry == null)
            {
                return NotFound();
            }

            var partner = await _context.Partners.FirstOrDefaultAsync(p => p.Id == dto.SupplierId);
            if (partner == null)
            {
                return BadRequest(new { message = "Supplier not found." });
            }

            Vehicle? vehicle = null;
            if (dto.VehicleId.HasValue)
            {
                vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == dto.VehicleId.Value);
                if (vehicle == null)
                {
                    return BadRequest(new { message = "Vehicle not found." });
                }
            }

            entry.Timestamp = ParseTimestamp(dto.Timestamp) ?? entry.Timestamp;
            entry.PartnerId = partner.Id;
            entry.VehicleId = vehicle?.Id;
            entry.VehiclePlate = ResolveVehiclePlate(dto.VehiclePlate, vehicle);
            entry.QuantityLiters = dto.QuantityLiters;
            entry.FatPercentage = dto.FatPercentage;
            entry.ProteinPercentage = dto.ProteinPercentage;
            entry.TemperatureC = dto.Temperature;
            entry.Ph = dto.Ph;
            entry.AntibioticTest = ParseAntibioticTest(dto.AntibioticTest);
            entry.SampleId = dto.SampleId.Trim();
            entry.Status = ParseStatus(dto.Status);
            entry.InspectorName = dto.Inspector.Trim();
            entry.Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim();
            entry.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating milk collection entry {EntryId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var entry = await _context.MilkCollectionEntries.FirstOrDefaultAsync(e => e.Id == id);
            if (entry == null)
            {
                return NotFound();
            }

            _context.MilkCollectionEntries.Remove(entry);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting milk collection entry {EntryId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    private static MilkCollectionEntryDto MapEntry(MilkCollectionEntry entry)
    {
        return new MilkCollectionEntryDto
        {
            Id = entry.Id,
            Timestamp = entry.Timestamp.ToString("O"),
            SupplierId = entry.PartnerId,
            SupplierName = entry.Partner?.Name ?? string.Empty,
            VehicleId = entry.VehicleId,
            VehiclePlate = string.IsNullOrWhiteSpace(entry.VehiclePlate)
                ? entry.Vehicle?.PlateNumber ?? string.Empty
                : entry.VehiclePlate,
            QuantityLiters = entry.QuantityLiters,
            FatPercentage = entry.FatPercentage,
            ProteinPercentage = entry.ProteinPercentage,
            Temperature = entry.TemperatureC,
            Ph = entry.Ph,
            AntibioticTest = ToAntibioticKey(entry.AntibioticTest),
            SampleId = entry.SampleId,
            Status = ToStatusKey(entry.Status),
            Inspector = entry.InspectorName,
            Notes = entry.Notes
        };
    }

    private static DateTime? ParseTimestamp(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return DateTime.TryParse(value, out var parsed) ? parsed : null;
    }

    private static string ResolveVehiclePlate(string? vehiclePlate, Vehicle? vehicle)
    {
        if (!string.IsNullOrWhiteSpace(vehiclePlate))
        {
            return vehiclePlate.Trim().ToUpperInvariant();
        }

        return vehicle?.PlateNumber ?? string.Empty;
    }

    private static AntibioticTestResult ParseAntibioticTest(string value)
    {
        return value.Trim().ToUpperInvariant() switch
        {
            "POSITIVE" => AntibioticTestResult.Positive,
            _ => AntibioticTestResult.Negative
        };
    }

    private static MilkCollectionStatus ParseStatus(string value)
    {
        return value.Trim().ToUpperInvariant() switch
        {
            "APPROVED" => MilkCollectionStatus.Approved,
            "REJECTED" => MilkCollectionStatus.Rejected,
            _ => MilkCollectionStatus.Pending
        };
    }

    private static string ToAntibioticKey(AntibioticTestResult value)
    {
        return value == AntibioticTestResult.Positive ? "POSITIVE" : "NEGATIVE";
    }

    private static string ToStatusKey(MilkCollectionStatus value)
    {
        return value switch
        {
            MilkCollectionStatus.Approved => "APPROVED",
            MilkCollectionStatus.Rejected => "REJECTED",
            _ => "PENDING"
        };
    }
}
