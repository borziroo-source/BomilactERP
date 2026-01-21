using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;
using BomilactERP.api.Data;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrderItemsController : ControllerBase
{
    private readonly BomilactDbContext _context;

    public OrderItemsController(BomilactDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderItemDto>>> GetAll()
    {
        var items = await _context.OrderItems
            .Include(oi => oi.Product)
            .ToListAsync();

        var dtos = items.Select(oi => new OrderItemDto
        {
            Id = oi.Id,
            OrderId = oi.OrderId,
            ProductId = oi.ProductId,
            ProductName = oi.Product?.Name,
            Quantity = oi.Quantity,
            UnitPrice = oi.UnitPrice,
            TotalPrice = oi.TotalPrice,
            Notes = oi.Notes
        });

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderItemDto>> GetById(int id)
    {
        var item = await _context.OrderItems
            .Include(oi => oi.Product)
            .FirstOrDefaultAsync(oi => oi.Id == id);

        if (item == null)
            return NotFound();

        var dto = new OrderItemDto
        {
            Id = item.Id,
            OrderId = item.OrderId,
            ProductId = item.ProductId,
            ProductName = item.Product?.Name,
            Quantity = item.Quantity,
            UnitPrice = item.UnitPrice,
            TotalPrice = item.TotalPrice,
            Notes = item.Notes
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<OrderItemDto>> Create(CreateOrderItemDto dto)
    {
        var item = new OrderItem
        {
            OrderId = dto.OrderId,
            ProductId = dto.ProductId,
            Quantity = dto.Quantity,
            UnitPrice = dto.UnitPrice,
            TotalPrice = dto.Quantity * dto.UnitPrice
        };

        _context.OrderItems.Add(item);
        await _context.SaveChangesAsync();

        var resultDto = new OrderItemDto
        {
            Id = item.Id,
            OrderId = item.OrderId,
            ProductId = item.ProductId,
            Quantity = item.Quantity,
            UnitPrice = item.UnitPrice,
            TotalPrice = item.TotalPrice
        };

        return CreatedAtAction(nameof(GetById), new { id = item.Id }, resultDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateOrderItemDto dto)
    {
        var item = await _context.OrderItems.FindAsync(id);
        if (item == null)
            return NotFound();

        item.Quantity = dto.Quantity;
        item.UnitPrice = dto.UnitPrice;
        item.TotalPrice = dto.Quantity * dto.UnitPrice;
        item.Notes = dto.Notes;

        _context.OrderItems.Update(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.OrderItems.FindAsync(id);
        if (item == null)
            return NotFound();

        _context.OrderItems.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
