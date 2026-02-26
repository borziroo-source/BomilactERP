using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BomilactERP.api.Data;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LabTestsController : ControllerBase
{
    private readonly BomilactDbContext _context;
    private readonly ILogger<LabTestsController> _logger;

    public LabTestsController(BomilactDbContext context, ILogger<LabTestsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<LabTestDto>>> GetAll(
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? type = null,
        [FromQuery] string? status = null,
        [FromQuery] string? dateFrom = null,
        [FromQuery] string? dateTo = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var query = _context.LabTests.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var s = searchTerm.Trim().ToLower();
                query = query.Where(e =>
                    e.SampleId.ToLower().Contains(s) ||
                    e.SourceName.ToLower().Contains(s));
            }

            if (!string.IsNullOrWhiteSpace(type))
            {
                var parsedType = ParseSampleType(type);
                query = query.Where(e => e.Type == parsedType);
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                var parsedStatus = ParseStatus(status);
                query = query.Where(e => e.Status == parsedStatus);
            }

            if (!string.IsNullOrWhiteSpace(dateFrom) && DateTime.TryParse(dateFrom, null,
                System.Globalization.DateTimeStyles.RoundtripKind, out var from))
            {
                var fromUtc = from.Kind == DateTimeKind.Unspecified
                    ? DateTime.SpecifyKind(from, DateTimeKind.Utc)
                    : from.ToUniversalTime();
                query = query.Where(e => e.Date >= fromUtc);
            }

            if (!string.IsNullOrWhiteSpace(dateTo) && DateTime.TryParse(dateTo, null,
                System.Globalization.DateTimeStyles.RoundtripKind, out var to))
            {
                var toUtc = to.Kind == DateTimeKind.Unspecified
                    ? DateTime.SpecifyKind(to, DateTimeKind.Utc)
                    : to.ToUniversalTime();
                query = query.Where(e => e.Date <= toUtc.Date.AddDays(1).AddTicks(-1));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(e => e.Date)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new PagedResult<LabTestDto>
            {
                Items = items.Select(MapToDto),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching lab tests");
            return StatusCode(500, new { message = "Hiba a laborvizsgálatok lekérésekor." });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<LabTestDto>> GetById(int id)
    {
        try
        {
            var test = await _context.LabTests.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
            if (test == null) return NotFound();
            return Ok(MapToDto(test));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching lab test {Id}", id);
            return StatusCode(500, new { message = "Hiba a laborvizsgálat lekérésekor." });
        }
    }

    [HttpPost]
    public async Task<ActionResult<LabTestDto>> Create(CreateLabTestDto dto)
    {
        try
        {
            var test = new LabTest
            {
                SampleId = dto.SampleId.Trim(),
                Date = ParseDate(dto.Date) ?? DateTime.UtcNow,
                SourceName = dto.SourceName.Trim(),
                Type = ParseSampleType(dto.Type),
                Fat = dto.Fat,
                Protein = dto.Protein,
                Ph = dto.Ph,
                Density = dto.Density,
                Water = dto.Water,
                Antibiotic = ParseAntibiotic(dto.Antibiotic),
                Scc = dto.Scc,
                Cfu = dto.Cfu,
                Status = ParseStatus(dto.Status),
                Inspector = dto.Inspector.Trim(),
                Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim()
            };
            test.Result = ComputeResult(test);

            _context.LabTests.Add(test);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = test.Id }, MapToDto(test));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating lab test");
            return StatusCode(500, new { message = "Hiba a laborvizsgálat létrehozásakor." });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateLabTestDto dto)
    {
        try
        {
            var test = await _context.LabTests.FirstOrDefaultAsync(e => e.Id == id);
            if (test == null) return NotFound();

            test.SampleId = dto.SampleId.Trim();
            test.Date = ParseDate(dto.Date) ?? test.Date;
            test.SourceName = dto.SourceName.Trim();
            test.Type = ParseSampleType(dto.Type);
            test.Fat = dto.Fat;
            test.Protein = dto.Protein;
            test.Ph = dto.Ph;
            test.Density = dto.Density;
            test.Water = dto.Water;
            test.Antibiotic = ParseAntibiotic(dto.Antibiotic);
            test.Scc = dto.Scc;
            test.Cfu = dto.Cfu;
            test.Status = ParseStatus(dto.Status);
            test.Inspector = dto.Inspector.Trim();
            test.Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim();
            test.Result = ComputeResult(test);
            test.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating lab test {Id}", id);
            return StatusCode(500, new { message = "Hiba a laborvizsgálat módosításakor." });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var test = await _context.LabTests.FirstOrDefaultAsync(e => e.Id == id);
            if (test == null) return NotFound();

            _context.LabTests.Remove(test);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting lab test {Id}", id);
            return StatusCode(500, new { message = "Hiba a laborvizsgálat törlésekor." });
        }
    }

    // --- Auto-result logic (mirrors frontend) ---
    private static LabTestResult ComputeResult(LabTest test)
    {
        if (test.Antibiotic == AntibioticResult.Positive) return LabTestResult.Fail;
        if ((test.Water ?? 0) > 0) return LabTestResult.Fail;
        if (test.Type == LabSampleType.RawMilk)
        {
            if (test.Density.HasValue && (test.Density < 1.028m || test.Density > 1.034m))
                return LabTestResult.Warning;
            if (test.Ph.HasValue && test.Ph < 6.0m)
                return LabTestResult.Fail;
        }
        return LabTestResult.Pass;
    }

    // --- Mapping ---
    private static LabTestDto MapToDto(LabTest t) => new()
    {
        Id = t.Id,
        SampleId = t.SampleId,
        Date = t.Date.ToString("O"),
        SourceName = t.SourceName,
        Type = ToSampleTypeKey(t.Type),
        Fat = t.Fat,
        Protein = t.Protein,
        Ph = t.Ph,
        Density = t.Density,
        Water = t.Water,
        Antibiotic = t.Antibiotic.HasValue ? ToAntibioticKey(t.Antibiotic.Value) : null,
        Scc = t.Scc,
        Cfu = t.Cfu,
        Status = ToStatusKey(t.Status),
        Result = ToResultKey(t.Result),
        Inspector = t.Inspector,
        Notes = t.Notes
    };

    // --- Parsers ---
    private static LabSampleType ParseSampleType(string value) =>
        value.Trim().ToUpperInvariant() switch
        {
            "WIP" => LabSampleType.Wip,
            "FINISHED_GOOD" => LabSampleType.FinishedGood,
            _ => LabSampleType.RawMilk
        };

    private static LabTestStatus ParseStatus(string value) =>
        value.Trim().ToUpperInvariant() switch
        {
            "COMPLETED" => LabTestStatus.Completed,
            _ => LabTestStatus.Pending
        };

    private static AntibioticResult? ParseAntibiotic(string? value) =>
        value?.Trim().ToUpperInvariant() switch
        {
            "POSITIVE" => AntibioticResult.Positive,
            "NEGATIVE" => AntibioticResult.Negative,
            _ => null
        };

    private static DateTime? ParseDate(string value)
    {
        if (!DateTime.TryParse(value, null, System.Globalization.DateTimeStyles.RoundtripKind, out var dt))
            return null;
        return dt.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(dt, DateTimeKind.Utc)
            : dt.ToUniversalTime();
    }

    // --- Serializers ---
    private static string ToSampleTypeKey(LabSampleType t) => t switch
    {
        LabSampleType.Wip => "WIP",
        LabSampleType.FinishedGood => "FINISHED_GOOD",
        _ => "RAW_MILK"
    };

    private static string ToStatusKey(LabTestStatus s) => s switch
    {
        LabTestStatus.Completed => "COMPLETED",
        _ => "PENDING"
    };

    private static string ToResultKey(LabTestResult r) => r switch
    {
        LabTestResult.Fail => "FAIL",
        LabTestResult.Warning => "WARNING",
        _ => "PASS"
    };

    private static string ToAntibioticKey(AntibioticResult a) =>
        a == AntibioticResult.Positive ? "POSITIVE" : "NEGATIVE";
}
