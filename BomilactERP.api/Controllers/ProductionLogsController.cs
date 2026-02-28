using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;
using BomilactERP.api.Data;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductionLogsController : ControllerBase
{
    private readonly BomilactDbContext _context;
    private readonly ILogger<ProductionLogsController> _logger;

    public ProductionLogsController(BomilactDbContext context, ILogger<ProductionLogsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductionLogDto>>> GetAll(
        [FromQuery] string? date = null,
        [FromQuery] string? batchNumber = null,
        [FromQuery] string? searchTerm = null)
    {
        try
        {
            var query = _context.ProductionLogs.AsQueryable();

            if (!string.IsNullOrWhiteSpace(date) && DateTime.TryParse(date, out var parsedDate))
            {
                var dayStart = parsedDate.Date;
                var dayEnd = dayStart.AddDays(1);
                query = query.Where(l => l.Timestamp >= dayStart && l.Timestamp < dayEnd);
            }
            if (!string.IsNullOrWhiteSpace(batchNumber))
                query = query.Where(l => l.BatchNumber.Contains(batchNumber));
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var lower = searchTerm.ToLower();
                query = query.Where(l =>
                    l.BatchNumber.ToLower().Contains(lower) ||
                    l.ProductName.ToLower().Contains(lower) ||
                    l.Operator.ToLower().Contains(lower));
            }

            var logs = await query.OrderByDescending(l => l.Timestamp).ToListAsync();
            return Ok(logs.Select(MapToDto));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching production logs");
            return StatusCode(500, new { message = "Hiba a technológiai napló lekérésekor." });
        }
    }

    [HttpPost]
    public async Task<ActionResult<ProductionLogDto>> Create(CreateProductionLogDto dto)
    {
        try
        {
            // Auto-status kalkuláció
            var status = CalculateStatus(dto.Step, dto.Temperature, dto.Ph);

            var log = new ProductionLog
            {
                Timestamp = dto.Timestamp,
                BatchNumber = dto.BatchNumber,
                ProductName = dto.ProductName,
                Step = dto.Step,
                Temperature = dto.Temperature,
                Ph = dto.Ph,
                Operator = dto.Operator,
                Status = status,
                Notes = dto.Notes
            };

            _context.ProductionLogs.Add(log);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created production log for batch {BatchNumber}", log.BatchNumber);
            return Ok(MapToDto(log));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating production log");
            return StatusCode(500, new { message = "Hiba a napló bejegyzés mentésekor." });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var log = await _context.ProductionLogs.FindAsync(id);
            if (log == null) return NotFound();

            _context.ProductionLogs.Remove(log);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting production log {Id}", id);
            return StatusCode(500, new { message = "Hiba a napló bejegyzés törlésekor." });
        }
    }

    // Pasztőrözésnél: <71.5°C = CRITICAL, 71.5-72°C = WARNING, egyébként OK
    private static string CalculateStatus(string step, decimal temperature, decimal ph)
    {
        if (step.ToLower().Contains("pasztőr") || step.ToLower().Contains("ccp1"))
        {
            if (temperature < 71.5m) return "CRITICAL";
            if (temperature < 72.0m) return "WARNING";
        }
        // pH ellenőrzés fermentálásnál
        if (step.ToLower().Contains("ferment"))
        {
            if (temperature > 44.0m) return "CRITICAL";
            if (temperature > 43.0m) return "WARNING";
        }
        return "OK";
    }

    private static ProductionLogDto MapToDto(ProductionLog l) => new()
    {
        Id = l.Id,
        Timestamp = l.Timestamp,
        BatchNumber = l.BatchNumber,
        ProductName = l.ProductName,
        Step = l.Step,
        Temperature = l.Temperature,
        Ph = l.Ph,
        Operator = l.Operator,
        Status = l.Status,
        Notes = l.Notes,
        CreatedAt = l.CreatedAt
    };
}
