using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;
using BomilactERP.api.Repositories;
using BomilactERP.api.Data;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SupplierGroupsController : ControllerBase
{
    private readonly IRepository<SupplierGroup> _repository;
    private readonly BomilactDbContext _context;
    private readonly ILogger<SupplierGroupsController> _logger;

    public SupplierGroupsController(
        IRepository<SupplierGroup> repository,
        BomilactDbContext context,
        ILogger<SupplierGroupsController> logger)
    {
        _repository = repository;
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SupplierGroupDto>>> GetAll()
    {
        try
        {
            _logger.LogInformation("Fetching all supplier groups");
            var groups = await _repository.GetAllAsync();
            var dtos = groups.Select(g => new SupplierGroupDto
            {
                Id = g.Id,
                Name = g.Name,
                Color = g.Color
            });
            _logger.LogInformation("Successfully fetched {Count} supplier groups", dtos.Count());
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching supplier groups");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SupplierGroupDto>> GetById(int id)
    {
        try
        {
            _logger.LogInformation("Fetching supplier group with ID {GroupId}", id);
            var group = await _repository.GetByIdAsync(id);
            if (group == null)
            {
                _logger.LogWarning("Supplier group with ID {GroupId} not found", id);
                return NotFound();
            }

            var dto = new SupplierGroupDto
            {
                Id = group.Id,
                Name = group.Name,
                Color = group.Color
            };
            _logger.LogInformation("Successfully fetched supplier group with ID {GroupId}", id);
            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching supplier group with ID {GroupId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<SupplierGroupDto>> Create(CreateSupplierGroupDto dto)
    {
        try
        {
            _logger.LogInformation("Creating new supplier group: {GroupName}", dto.Name);
            var group = new SupplierGroup
            {
                Name = dto.Name,
                Color = dto.Color
            };

            var created = await _repository.CreateAsync(group);
            var resultDto = new SupplierGroupDto
            {
                Id = created.Id,
                Name = created.Name,
                Color = created.Color
            };

            _logger.LogInformation("Successfully created supplier group with ID {GroupId}", created.Id);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, resultDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating supplier group");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateSupplierGroupDto dto)
    {
        try
        {
            _logger.LogInformation("Updating supplier group with ID {GroupId}", id);
            var group = await _repository.GetByIdAsync(id);
            if (group == null)
            {
                _logger.LogWarning("Supplier group with ID {GroupId} not found for update", id);
                return NotFound();
            }

            group.Name = dto.Name;
            group.Color = dto.Color;
            group.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(group);
            _logger.LogInformation("Successfully updated supplier group with ID {GroupId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating supplier group with ID {GroupId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            _logger.LogInformation("Attempting to delete supplier group with ID {GroupId}", id);
            
            // Check if the group is in use by any partners
            var partnersUsingGroup = await _context.Partners
                .Where(p => p.SupplierGroupId == id)
                .CountAsync();

            if (partnersUsingGroup > 0)
            {
                _logger.LogWarning("Cannot delete supplier group with ID {GroupId} - it is used by {Count} partners", id, partnersUsingGroup);
                return BadRequest(new { 
                    message = "A csoport nem törölhető, mert használatban van.",
                    partnersCount = partnersUsingGroup
                });
            }

            var success = await _repository.DeleteAsync(id);
            if (!success)
            {
                _logger.LogWarning("Supplier group with ID {GroupId} not found for deletion", id);
                return NotFound();
            }

            _logger.LogInformation("Successfully deleted supplier group with ID {GroupId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting supplier group with ID {GroupId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }
}
