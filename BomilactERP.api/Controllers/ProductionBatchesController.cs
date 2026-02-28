using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;
using BomilactERP.api.Data;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductionBatchesController : ControllerBase
{
    private readonly BomilactDbContext _context;
    private readonly ILogger<ProductionBatchesController> _logger;

    public ProductionBatchesController(BomilactDbContext context, ILogger<ProductionBatchesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductionBatchDto>>> GetAll([FromQuery] bool activeOnly = false)
    {
        try
        {
            var query = _context.ProductionBatches
                .Include(b => b.Steps.OrderBy(s => s.SortOrder))
                .Include(b => b.Alerts)
                .AsQueryable();

            if (activeOnly)
                query = query.Where(b => b.Status != "COMPLETED");

            var batches = await query.OrderByDescending(b => b.StartTime).ToListAsync();
            return Ok(batches.Select(MapToDto));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching production batches");
            return StatusCode(500, new { message = "Hiba az aktív gyártások lekérésekor." });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductionBatchDto>> GetById(int id)
    {
        try
        {
            var batch = await _context.ProductionBatches
                .Include(b => b.Steps.OrderBy(s => s.SortOrder))
                .Include(b => b.Alerts)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (batch == null) return NotFound();
            return Ok(MapToDto(batch));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching production batch {Id}", id);
            return StatusCode(500, new { message = "Hiba a gyártás lekérésekor." });
        }
    }

    [HttpPost]
    public async Task<ActionResult<ProductionBatchDto>> Create(CreateProductionBatchDto dto)
    {
        try
        {
            var batch = new ProductionBatch
            {
                LineId = dto.LineId,
                LineName = dto.LineName,
                ProductName = dto.ProductName,
                BatchNumber = dto.BatchNumber,
                Quantity = dto.Quantity,
                Uom = dto.Uom,
                TargetTemp = dto.TargetTemp,
                StartTime = DateTime.UtcNow,
                Status = "RUNNING"
            };

            int order = 0;
            foreach (var step in dto.Steps)
            {
                batch.Steps.Add(new ProductionStep
                {
                    Name = step.Name,
                    DurationMinutes = step.DurationMinutes,
                    StepType = step.StepType,
                    SortOrder = step.SortOrder > 0 ? step.SortOrder : order++
                });
            }

            _context.ProductionBatches.Add(batch);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created production batch {BatchNumber}", batch.BatchNumber);
            return CreatedAtAction(nameof(GetById), new { id = batch.Id }, MapToDto(batch));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating production batch");
            return StatusCode(500, new { message = "Hiba a gyártás indításakor." });
        }
    }

    [HttpPatch("{id}/step")]
    public async Task<IActionResult> UpdateStep(int id, UpdateBatchStepDto dto)
    {
        try
        {
            var batch = await _context.ProductionBatches
                .Include(b => b.Steps.OrderBy(s => s.SortOrder))
                .FirstOrDefaultAsync(b => b.Id == id);

            if (batch == null) return NotFound();

            switch (dto.Action.ToUpper())
            {
                case "NEXT":
                    if (dto.ElapsedMinutes.HasValue)
                    {
                        var current = batch.Steps.FirstOrDefault(s => s.SortOrder == batch.CurrentStepIndex);
                        if (current != null) current.ElapsedMinutes = dto.ElapsedMinutes.Value;
                    }
                    if (batch.CurrentStepIndex < batch.Steps.Count - 1)
                    {
                        batch.CurrentStepIndex++;
                        batch.Status = "RUNNING";
                    }
                    else
                    {
                        batch.Status = "COMPLETED";
                    }
                    break;
                case "PREV":
                    if (batch.CurrentStepIndex > 0)
                        batch.CurrentStepIndex--;
                    break;
                case "PAUSE":
                    batch.Status = batch.Status == "PAUSED" ? "RUNNING" : "PAUSED";
                    break;
                case "COMPLETE":
                    batch.Status = "COMPLETED";
                    break;
            }

            batch.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating step for batch {Id}", id);
            return StatusCode(500, new { message = "Hiba a lépés frissítésekor." });
        }
    }

    [HttpPut("{id}/params")]
    public async Task<IActionResult> LogParams(int id, LogBatchParamsDto dto)
    {
        try
        {
            var batch = await _context.ProductionBatches
                .Include(b => b.Alerts)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (batch == null) return NotFound();

            batch.CurrentTemp = dto.Temperature;
            batch.CurrentPh = dto.Ph;
            batch.AgitatorRpm = dto.AgitatorRpm;
            batch.UpdatedAt = DateTime.UtcNow;

            // Auto alert: hőmérséklet eltérés > 1.5°C
            if (Math.Abs(dto.Temperature - batch.TargetTemp) > 1.5m)
            {
                var alertMsg = $"Manuális mérés: Hőmérséklet eltérés ({dto.Temperature}°C, cél: {batch.TargetTemp}°C)";
                if (!batch.Alerts.Any(a => a.Message.Contains("Hőmérséklet eltérés")))
                {
                    batch.Alerts.Add(new ProductionBatchAlert { Message = alertMsg });
                    batch.Status = "ISSUE";
                }
            }

            if (!string.IsNullOrWhiteSpace(dto.Note))
                batch.Alerts.Add(new ProductionBatchAlert { Message = $"Megjegyzés: {dto.Note}" });

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging params for batch {Id}", id);
            return StatusCode(500, new { message = "Hiba a paraméterek mentésekor." });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var batch = await _context.ProductionBatches.FindAsync(id);
            if (batch == null) return NotFound();

            _context.ProductionBatches.Remove(batch);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting production batch {Id}", id);
            return StatusCode(500, new { message = "Hiba a gyártás törlésekor." });
        }
    }

    private static ProductionBatchDto MapToDto(ProductionBatch b) => new()
    {
        Id = b.Id,
        LineId = b.LineId,
        LineName = b.LineName,
        ProductName = b.ProductName,
        BatchNumber = b.BatchNumber,
        Quantity = b.Quantity,
        Uom = b.Uom,
        StartTime = b.StartTime,
        CurrentStepIndex = b.CurrentStepIndex,
        Status = b.Status,
        CurrentTemp = b.CurrentTemp,
        TargetTemp = b.TargetTemp,
        CurrentPh = b.CurrentPh,
        AgitatorRpm = b.AgitatorRpm,
        Steps = b.Steps.OrderBy(s => s.SortOrder).Select(s => new ProductionStepDto
        {
            Id = s.Id,
            Name = s.Name,
            DurationMinutes = s.DurationMinutes,
            ElapsedMinutes = s.ElapsedMinutes,
            StepType = s.StepType,
            SortOrder = s.SortOrder
        }).ToList(),
        Alerts = b.Alerts.Where(a => !a.IsDeleted).Select(a => a.Message).ToList()
    };
}
