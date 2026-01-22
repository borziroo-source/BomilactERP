using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;
using BomilactERP.api.Data;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryItemsController : ControllerBase
{
    private readonly BomilactDbContext _context;
    private readonly ILogger<InventoryItemsController> _logger;

    public InventoryItemsController(BomilactDbContext context, ILogger<InventoryItemsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryItemDto>>> GetAll()
    {
        try
        {
            _logger.LogInformation("Fetching all inventory items");
            var items = await _context.InventoryItems
                .Include(ii => ii.Product)
                .ToListAsync();

            var dtos = items.Select(ii => new InventoryItemDto
            {
                Id = ii.Id,
                ProductId = ii.ProductId,
                ProductName = ii.Product?.Name,
                Type = (int)ii.Type,
                Quantity = ii.Quantity,
                Location = ii.Location,
                LotNumber = ii.LotNumber,
                ExpiryDate = ii.ExpiryDate
            });

            _logger.LogInformation("Successfully fetched {Count} inventory items", dtos.Count());
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching inventory items");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InventoryItemDto>> GetById(int id)
    {
        try
        {
            _logger.LogInformation("Fetching inventory item with ID {InventoryItemId}", id);
            var item = await _context.InventoryItems
                .Include(ii => ii.Product)
                .FirstOrDefaultAsync(ii => ii.Id == id);

            if (item == null)
            {
                _logger.LogWarning("Inventory item with ID {InventoryItemId} not found", id);
                return NotFound();
            }

            var dto = new InventoryItemDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductName = item.Product?.Name,
                Type = (int)item.Type,
                Quantity = item.Quantity,
                Location = item.Location,
                LotNumber = item.LotNumber,
                ExpiryDate = item.ExpiryDate
            };

            _logger.LogInformation("Successfully fetched inventory item with ID {InventoryItemId}", id);
            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching inventory item with ID {InventoryItemId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<InventoryItemDto>> Create(CreateInventoryItemDto dto)
    {
        try
        {
            _logger.LogInformation("Creating new inventory item for product {ProductId}", dto.ProductId);
            var item = new InventoryItem
            {
                ProductId = dto.ProductId,
                Type = (InventoryType)dto.Type,
                Quantity = dto.Quantity,
                Location = dto.Location,
                LotNumber = dto.LotNumber,
                ExpiryDate = dto.ExpiryDate
            };

            _context.InventoryItems.Add(item);
            await _context.SaveChangesAsync();

            var resultDto = new InventoryItemDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                Type = (int)item.Type,
                Quantity = item.Quantity,
                Location = item.Location,
                LotNumber = item.LotNumber,
                ExpiryDate = item.ExpiryDate
            };

            _logger.LogInformation("Successfully created inventory item with ID {InventoryItemId}", item.Id);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, resultDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating inventory item");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateInventoryItemDto dto)
    {
        try
        {
            _logger.LogInformation("Updating inventory item with ID {InventoryItemId}", id);
            var item = await _context.InventoryItems.FindAsync(id);
            if (item == null)
            {
                _logger.LogWarning("Inventory item with ID {InventoryItemId} not found for update", id);
                return NotFound();
            }

            item.Quantity = dto.Quantity;
            item.Location = dto.Location;
            item.LotNumber = dto.LotNumber;
            item.ExpiryDate = dto.ExpiryDate;
            item.UpdatedAt = DateTime.UtcNow;

            _context.InventoryItems.Update(item);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully updated inventory item with ID {InventoryItemId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating inventory item with ID {InventoryItemId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            _logger.LogInformation("Deleting inventory item with ID {InventoryItemId}", id);
            var item = await _context.InventoryItems.FindAsync(id);
            if (item == null)
            {
                _logger.LogWarning("Inventory item with ID {InventoryItemId} not found for deletion", id);
                return NotFound();
            }

            _context.InventoryItems.Remove(item);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully deleted inventory item with ID {InventoryItemId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting inventory item with ID {InventoryItemId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }
}
