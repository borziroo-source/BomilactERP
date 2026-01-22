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
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(BomilactDbContext context, ILogger<OrdersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderDto>>> GetAll()
    {
        try
        {
            _logger.LogInformation("Fetching all orders");
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

            _logger.LogInformation("Successfully fetched {Count} orders", dtos.Count());
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching orders");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetById(int id)
    {
        try
        {
            _logger.LogInformation("Fetching order with ID {OrderId}", id);
            var order = await _context.Orders
                .Include(o => o.Partner)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                _logger.LogWarning("Order with ID {OrderId} not found", id);
                return NotFound();
            }

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

            _logger.LogInformation("Successfully fetched order with ID {OrderId}", id);
            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching order with ID {OrderId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create(CreateOrderDto dto)
    {
        try
        {
            _logger.LogInformation("Creating new order with number {OrderNumber}", dto.OrderNumber);
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

            _logger.LogInformation("Successfully created order with ID {OrderId}", order.Id);
            return CreatedAtAction(nameof(GetById), new { id = order.Id }, resultDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating order");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateOrderDto dto)
    {
        try
        {
            _logger.LogInformation("Updating order with ID {OrderId}", id);
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                _logger.LogWarning("Order with ID {OrderId} not found for update", id);
                return NotFound();
            }

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

            _logger.LogInformation("Successfully updated order with ID {OrderId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating order with ID {OrderId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            _logger.LogInformation("Deleting order with ID {OrderId}", id);
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                _logger.LogWarning("Order with ID {OrderId} not found for deletion", id);
                return NotFound();
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully deleted order with ID {OrderId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting order with ID {OrderId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }
}
