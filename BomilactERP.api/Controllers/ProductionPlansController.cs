using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;
using BomilactERP.api.Data;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductionPlansController : ControllerBase
{
    private readonly BomilactDbContext _context;
    private readonly ILogger<ProductionPlansController> _logger;

    public ProductionPlansController(BomilactDbContext context, ILogger<ProductionPlansController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductionPlanDto>>> GetAll(
        [FromQuery] string? status = null,
        [FromQuery] string? dateFrom = null,
        [FromQuery] string? dateTo = null,
        [FromQuery] string? searchTerm = null)
    {
        try
        {
            var query = _context.ProductionPlans.AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) && status != "ALL")
            {
                if (Enum.TryParse<ProductionStatus>(status, true, out var statusEnum))
                    query = query.Where(p => p.Status == statusEnum);
            }
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var lower = searchTerm.ToLower();
                query = query.Where(p => p.ProductName.ToLower().Contains(lower) || p.PlanNumber.ToLower().Contains(lower));
            }
            if (!string.IsNullOrWhiteSpace(dateFrom) && DateTime.TryParse(dateFrom, out var from))
                query = query.Where(p => p.StartDate >= from);
            if (!string.IsNullOrWhiteSpace(dateTo) && DateTime.TryParse(dateTo, out var to))
                query = query.Where(p => p.StartDate <= to);

            var plans = await query.OrderBy(p => p.StartDate).ToListAsync();
            return Ok(plans.Select(MapToDto));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching production plans");
            return StatusCode(500, new { message = "Hiba a gyártási tervek lekérésekor." });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductionPlanDto>> GetById(int id)
    {
        try
        {
            var plan = await _context.ProductionPlans.FindAsync(id);
            if (plan == null) return NotFound();
            return Ok(MapToDto(plan));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching production plan {Id}", id);
            return StatusCode(500, new { message = "Hiba a gyártási terv lekérésekor." });
        }
    }

    [HttpPost]
    public async Task<ActionResult<ProductionPlanDto>> Create(CreateProductionPlanDto dto)
    {
        try
        {
            var plan = new ProductionPlan
            {
                PlanNumber = dto.PlanNumber,
                ProductName = dto.ProductName,
                Sku = dto.Sku,
                Quantity = dto.Quantity,
                Uom = dto.Uom,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Line = dto.Line,
                Supervisor = dto.Supervisor,
                Priority = dto.Priority,
                Notes = dto.Notes,
                Status = ProductionStatus.Draft
            };

            _context.ProductionPlans.Add(plan);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created production plan {PlanNumber}", plan.PlanNumber);
            return CreatedAtAction(nameof(GetById), new { id = plan.Id }, MapToDto(plan));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating production plan");
            return StatusCode(500, new { message = "Hiba a gyártási terv létrehozásakor." });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateProductionPlanDto dto)
    {
        try
        {
            var plan = await _context.ProductionPlans.FindAsync(id);
            if (plan == null) return NotFound();

            plan.PlanNumber = dto.PlanNumber;
            plan.ProductName = dto.ProductName;
            plan.Sku = dto.Sku;
            plan.Quantity = dto.Quantity;
            plan.Uom = dto.Uom;
            plan.StartDate = dto.StartDate;
            plan.EndDate = dto.EndDate;
            plan.Line = dto.Line;
            plan.Supervisor = dto.Supervisor;
            plan.Progress = dto.Progress;
            plan.Priority = dto.Priority;
            plan.Notes = dto.Notes;
            plan.UpdatedAt = DateTime.UtcNow;

            if (Enum.TryParse<ProductionStatus>(dto.Status, true, out var statusEnum))
                plan.Status = statusEnum;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Updated production plan {Id}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating production plan {Id}", id);
            return StatusCode(500, new { message = "Hiba a gyártási terv frissítésekor." });
        }
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string newStatus)
    {
        try
        {
            var plan = await _context.ProductionPlans.FindAsync(id);
            if (plan == null) return NotFound();

            if (!Enum.TryParse<ProductionStatus>(newStatus, true, out var statusEnum))
                return BadRequest(new { message = "Érvénytelen státusz." });

            plan.Status = statusEnum;
            plan.Progress = statusEnum == ProductionStatus.Completed ? 100 :
                           (statusEnum == ProductionStatus.Draft || statusEnum == ProductionStatus.Planned ? 0 : plan.Progress);
            plan.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating status for plan {Id}", id);
            return StatusCode(500, new { message = "Hiba a státusz frissítésekor." });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var plan = await _context.ProductionPlans.FindAsync(id);
            if (plan == null) return NotFound();

            _context.ProductionPlans.Remove(plan);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Deleted production plan {Id}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting production plan {Id}", id);
            return StatusCode(500, new { message = "Hiba a gyártási terv törlésekor." });
        }
    }

    private static ProductionPlanDto MapToDto(ProductionPlan p) => new()
    {
        Id = p.Id,
        PlanNumber = p.PlanNumber,
        ProductName = p.ProductName,
        Sku = p.Sku,
        Quantity = p.Quantity,
        Uom = p.Uom,
        StartDate = p.StartDate,
        EndDate = p.EndDate,
        Line = p.Line,
        Supervisor = p.Supervisor,
        Progress = p.Progress,
        Priority = p.Priority,
        Status = p.Status switch
        {
            ProductionStatus.InProgress => "IN_PROGRESS",
            _ => p.Status.ToString().ToUpper()
        },
        Notes = p.Notes,
        CreatedAt = p.CreatedAt,
        UpdatedAt = p.UpdatedAt
    };
}
