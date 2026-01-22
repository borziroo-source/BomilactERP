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

    public InventoryItemsController(BomilactDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryItemDto>>> GetAll()
    {
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

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InventoryItemDto>> GetById(int id)
    {
        var item = await _context.InventoryItems
            .Include(ii => ii.Product)
            .FirstOrDefaultAsync(ii => ii.Id == id);

        if (item == null)
            return NotFound();

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

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<InventoryItemDto>> Create(CreateInventoryItemDto dto)
    {
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

        return CreatedAtAction(nameof(GetById), new { id = item.Id }, resultDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateInventoryItemDto dto)
    {
        var item = await _context.InventoryItems.FindAsync(id);
        if (item == null)
            return NotFound();

        item.Quantity = dto.Quantity;
        item.Location = dto.Location;
        item.LotNumber = dto.LotNumber;
        item.ExpiryDate = dto.ExpiryDate;
        item.UpdatedAt = DateTime.UtcNow;

        _context.InventoryItems.Update(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.InventoryItems.FindAsync(id);
        if (item == null)
            return NotFound();

        _context.InventoryItems.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
