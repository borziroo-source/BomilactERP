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
    public async Task<ActionResult<IEnumerable<ProductionPlanDto>>> GetAll()
    {
        try
        {
            _logger.LogInformation("Fetching all production plans");
            var plans = await _context.ProductionPlans.ToListAsync();

            var dtos = plans.Select(p => new ProductionPlanDto
            {
                Id = p.Id,
                PlanNumber = p.PlanNumber,
                PlannedDate = p.PlannedDate,
                ActualStartDate = p.ActualStartDate,
                ActualEndDate = p.ActualEndDate,
                Status = (int)p.Status,
                Notes = p.Notes
            });

            _logger.LogInformation("Successfully fetched {Count} production plans", dtos.Count());
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching production plans");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductionPlanDto>> GetById(int id)
    {
        try
        {
            _logger.LogInformation("Fetching production plan with ID {ProductionPlanId}", id);
            var plan = await _context.ProductionPlans.FindAsync(id);
            if (plan == null)
            {
                _logger.LogWarning("Production plan with ID {ProductionPlanId} not found", id);
                return NotFound();
            }

            var dto = new ProductionPlanDto
            {
                Id = plan.Id,
                PlanNumber = plan.PlanNumber,
                PlannedDate = plan.PlannedDate,
                ActualStartDate = plan.ActualStartDate,
                ActualEndDate = plan.ActualEndDate,
                Status = (int)plan.Status,
                Notes = plan.Notes
            };

            _logger.LogInformation("Successfully fetched production plan with ID {ProductionPlanId}", id);
            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching production plan with ID {ProductionPlanId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<ProductionPlanDto>> Create(CreateProductionPlanDto dto)
    {
        try
        {
            _logger.LogInformation("Creating new production plan with number {PlanNumber}", dto.PlanNumber);
            var plan = new ProductionPlan
            {
                PlanNumber = dto.PlanNumber,
                PlannedDate = dto.PlannedDate,
                Notes = dto.Notes
            };

            _context.ProductionPlans.Add(plan);
            await _context.SaveChangesAsync();

            var resultDto = new ProductionPlanDto
            {
                Id = plan.Id,
                PlanNumber = plan.PlanNumber,
                PlannedDate = plan.PlannedDate,
                ActualStartDate = plan.ActualStartDate,
                ActualEndDate = plan.ActualEndDate,
                Status = (int)plan.Status,
                Notes = plan.Notes
            };

            _logger.LogInformation("Successfully created production plan with ID {ProductionPlanId}", plan.Id);
            return CreatedAtAction(nameof(GetById), new { id = plan.Id }, resultDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating production plan");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateProductionPlanDto dto)
    {
        try
        {
            _logger.LogInformation("Updating production plan with ID {ProductionPlanId}", id);
            var plan = await _context.ProductionPlans.FindAsync(id);
            if (plan == null)
            {
                _logger.LogWarning("Production plan with ID {ProductionPlanId} not found for update", id);
                return NotFound();
            }

            plan.PlanNumber = dto.PlanNumber;
            plan.PlannedDate = dto.PlannedDate;
            plan.ActualStartDate = dto.ActualStartDate;
            plan.ActualEndDate = dto.ActualEndDate;
            plan.Status = (ProductionStatus)dto.Status;
            plan.Notes = dto.Notes;
            plan.UpdatedAt = DateTime.UtcNow;

            _context.ProductionPlans.Update(plan);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully updated production plan with ID {ProductionPlanId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating production plan with ID {ProductionPlanId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            _logger.LogInformation("Deleting production plan with ID {ProductionPlanId}", id);
            var plan = await _context.ProductionPlans.FindAsync(id);
            if (plan == null)
            {
                _logger.LogWarning("Production plan with ID {ProductionPlanId} not found for deletion", id);
                return NotFound();
            }

            _context.ProductionPlans.Remove(plan);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully deleted production plan with ID {ProductionPlanId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting production plan with ID {ProductionPlanId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }
}
