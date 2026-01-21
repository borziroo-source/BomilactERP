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

    public ProductionPlansController(BomilactDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductionPlanDto>>> GetAll()
    {
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

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductionPlanDto>> GetById(int id)
    {
        var plan = await _context.ProductionPlans.FindAsync(id);
        if (plan == null)
            return NotFound();

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

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<ProductionPlanDto>> Create(CreateProductionPlanDto dto)
    {
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

        return CreatedAtAction(nameof(GetById), new { id = plan.Id }, resultDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateProductionPlanDto dto)
    {
        var plan = await _context.ProductionPlans.FindAsync(id);
        if (plan == null)
            return NotFound();

        plan.PlanNumber = dto.PlanNumber;
        plan.PlannedDate = dto.PlannedDate;
        plan.ActualStartDate = dto.ActualStartDate;
        plan.ActualEndDate = dto.ActualEndDate;
        plan.Status = (ProductionStatus)dto.Status;
        plan.Notes = dto.Notes;
        plan.UpdatedAt = DateTime.UtcNow;

        _context.ProductionPlans.Update(plan);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var plan = await _context.ProductionPlans.FindAsync(id);
        if (plan == null)
            return NotFound();

        _context.ProductionPlans.Remove(plan);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
