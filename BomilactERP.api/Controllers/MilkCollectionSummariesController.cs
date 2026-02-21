using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BomilactERP.api.Data;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MilkCollectionSummariesController : ControllerBase
{
    private readonly BomilactDbContext _context;
    private readonly ILogger<MilkCollectionSummariesController> _logger;

    public MilkCollectionSummariesController(BomilactDbContext context, ILogger<MilkCollectionSummariesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MilkCollectionSummaryDto>>> GetAll([FromQuery] string month, [FromQuery] int collectionPointId)
    {
        try
        {
            if (!TryParseMonth(month, out var monthStart))
            {
                return BadRequest(new { message = "Invalid month format." });
            }

            var summaries = await _context.MilkCollectionSummaries
                .Include(s => s.Supplier)
                .Include(s => s.CollectionPoint)
                .AsNoTracking()
                .Where(s => s.Month == monthStart && s.CollectionPointId == collectionPointId)
                .OrderBy(s => s.Supplier.Name)
                .ToListAsync();

            return Ok(summaries.Select(MapSummary));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching milk collection summaries");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPost("batch")]
    public async Task<ActionResult<IEnumerable<MilkCollectionSummaryDto>>> SaveBatch(SaveMonthlySummariesDto dto)
    {
        try
        {
            if (!TryParseMonth(dto.Month, out var monthStart))
            {
                return BadRequest(new { message = "Invalid month format." });
            }

            var collectionPoint = await _context.SupplierGroups.FirstOrDefaultAsync(g => g.Id == dto.CollectionPointId);
            if (collectionPoint == null)
            {
                return BadRequest(new { message = "Collection point not found." });
            }

            var supplierIds = dto.Items.Select(i => i.SupplierId).Distinct().ToList();
            var suppliers = await _context.Partners.Where(p => supplierIds.Contains(p.Id)).ToListAsync();
            var suppliersById = suppliers.ToDictionary(p => p.Id, p => p);

            foreach (var item in dto.Items)
            {
                if (!suppliersById.ContainsKey(item.SupplierId))
                {
                    return BadRequest(new { message = $"Supplier not found: {item.SupplierId}." });
                }

                var existing = await _context.MilkCollectionSummaries
                    .FirstOrDefaultAsync(s => s.Month == monthStart && s.SupplierId == item.SupplierId && s.CollectionPointId == dto.CollectionPointId);

                if (existing == null)
                {
                    var summary = new MilkCollectionSummary
                    {
                        Month = monthStart,
                        SupplierId = item.SupplierId,
                        CollectionPointId = dto.CollectionPointId,
                        TotalLiters = item.TotalLiters,
                        AvgFat = item.AvgFat,
                        AvgProtein = item.AvgProtein,
                        Status = ParseSummaryStatus(item.Status)
                    };

                    _context.MilkCollectionSummaries.Add(summary);
                }
                else
                {
                    existing.TotalLiters = item.TotalLiters;
                    existing.AvgFat = item.AvgFat;
                    existing.AvgProtein = item.AvgProtein;
                    existing.Status = ParseSummaryStatus(item.Status);
                    existing.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            var updated = await _context.MilkCollectionSummaries
                .Include(s => s.Supplier)
                .Include(s => s.CollectionPoint)
                .AsNoTracking()
                .Where(s => s.Month == monthStart && s.CollectionPointId == dto.CollectionPointId)
                .OrderBy(s => s.Supplier.Name)
                .ToListAsync();

            return Ok(updated.Select(MapSummary));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while saving milk collection summaries");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPost("finalize")]
    public async Task<IActionResult> Finalize(FinalizeMonthlySummariesDto dto)
    {
        try
        {
            if (!TryParseMonth(dto.Month, out var monthStart))
            {
                return BadRequest(new { message = "Invalid month format." });
            }

            var summaries = await _context.MilkCollectionSummaries
                .Where(s => s.Month == monthStart && s.CollectionPointId == dto.CollectionPointId)
                .ToListAsync();

            foreach (var summary in summaries)
            {
                summary.Status = MilkCollectionSummaryStatus.Finalized;
                summary.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while finalizing milk collection summaries");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    private static bool TryParseMonth(string value, out DateTime monthStart)
    {
        if (DateTime.TryParseExact(value, "yyyy-MM", null, System.Globalization.DateTimeStyles.None, out var parsed))
        {
            monthStart = new DateTime(parsed.Year, parsed.Month, 1);
            return true;
        }

        monthStart = default;
        return false;
    }

    private static MilkCollectionSummaryDto MapSummary(MilkCollectionSummary summary)
    {
        return new MilkCollectionSummaryDto
        {
            Id = summary.Id,
            Month = summary.Month.ToString("yyyy-MM"),
            SupplierId = summary.SupplierId,
            SupplierName = summary.Supplier?.Name ?? string.Empty,
            CollectionPointId = summary.CollectionPointId,
            CollectionPointName = summary.CollectionPoint?.Name ?? string.Empty,
            TotalLiters = summary.TotalLiters,
            AvgFat = summary.AvgFat,
            AvgProtein = summary.AvgProtein,
            Status = ToSummaryStatusKey(summary.Status)
        };
    }

    private static MilkCollectionSummaryStatus ParseSummaryStatus(string value)
    {
        return value.Trim().ToUpperInvariant() switch
        {
            "FINALIZED" => MilkCollectionSummaryStatus.Finalized,
            _ => MilkCollectionSummaryStatus.Draft
        };
    }

    private static string ToSummaryStatusKey(MilkCollectionSummaryStatus value)
    {
        return value == MilkCollectionSummaryStatus.Finalized ? "FINALIZED" : "DRAFT";
    }
}
