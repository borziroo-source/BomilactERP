using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;
using BomilactERP.api.Data;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly BomilactDbContext _context;

    public OrdersController(BomilactDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderDto>>> GetAll()
    {
        var orders = await _context.Orders
            .Include(o => o.Partner)
            .ToListAsync();

        var dtos = orders.Select(o => new OrderDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            PartnerId = o.PartnerId,
            PartnerName = o.Partner?.Name,
            OrderDate = o.OrderDate,
            DeliveryDate = o.DeliveryDate,
            Status = (int)o.Status,
            TotalAmount = o.TotalAmount,
            Notes = o.Notes
        });

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetById(int id)
    {
        var order = await _context.Orders
            .Include(o => o.Partner)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return NotFound();

        var dto = new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            PartnerId = order.PartnerId,
            PartnerName = order.Partner?.Name,
            OrderDate = order.OrderDate,
            DeliveryDate = order.DeliveryDate,
            Status = (int)order.Status,
            TotalAmount = order.TotalAmount,
            Notes = order.Notes
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create(CreateOrderDto dto)
    {
        var order = new Order
        {
            OrderNumber = dto.OrderNumber,
            PartnerId = dto.PartnerId,
            OrderDate = dto.OrderDate,
            DeliveryDate = dto.DeliveryDate,
            TotalAmount = dto.TotalAmount,
            Notes = dto.Notes
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        var resultDto = new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            PartnerId = order.PartnerId,
            OrderDate = order.OrderDate,
            DeliveryDate = order.DeliveryDate,
            Status = (int)order.Status,
            TotalAmount = order.TotalAmount,
            Notes = order.Notes
        };

        return CreatedAtAction(nameof(GetById), new { id = order.Id }, resultDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateOrderDto dto)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null)
            return NotFound();

        order.OrderNumber = dto.OrderNumber;
        order.PartnerId = dto.PartnerId;
        order.OrderDate = dto.OrderDate;
        order.DeliveryDate = dto.DeliveryDate;
        order.Status = (OrderStatus)dto.Status;
        order.TotalAmount = dto.TotalAmount;
        order.Notes = dto.Notes;
        order.UpdatedAt = DateTime.UtcNow;

        _context.Orders.Update(order);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null)
            return NotFound();

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
