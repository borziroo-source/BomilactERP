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
    private readonly ILogger<OrderItemsController> _logger;

    public OrderItemsController(BomilactDbContext context, ILogger<OrderItemsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderItemDto>>> GetAll()
    {
        try
        {
            _logger.LogInformation("Fetching all order items");
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

            _logger.LogInformation("Successfully fetched {Count} order items", dtos.Count());
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching order items");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderItemDto>> GetById(int id)
    {
        try
        {
            _logger.LogInformation("Fetching order item with ID {OrderItemId}", id);
            var item = await _context.OrderItems
                .Include(oi => oi.Product)
                .FirstOrDefaultAsync(oi => oi.Id == id);

            if (item == null)
            {
                _logger.LogWarning("Order item with ID {OrderItemId} not found", id);
                return NotFound();
            }

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

            _logger.LogInformation("Successfully fetched order item with ID {OrderItemId}", id);
            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching order item with ID {OrderItemId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<OrderItemDto>> Create(CreateOrderItemDto dto)
    {
        try
        {
            _logger.LogInformation("Creating new order item for order {OrderId}", dto.OrderId);
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

            _logger.LogInformation("Successfully created order item with ID {OrderItemId}", item.Id);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, resultDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating order item");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateOrderItemDto dto)
    {
        try
        {
            _logger.LogInformation("Updating order item with ID {OrderItemId}", id);
            var item = await _context.OrderItems.FindAsync(id);
            if (item == null)
            {
                _logger.LogWarning("Order item with ID {OrderItemId} not found for update", id);
                return NotFound();
            }

            item.Quantity = dto.Quantity;
            item.UnitPrice = dto.UnitPrice;
            item.TotalPrice = dto.Quantity * dto.UnitPrice;
            item.Notes = dto.Notes;

            _context.OrderItems.Update(item);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully updated order item with ID {OrderItemId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating order item with ID {OrderItemId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            _logger.LogInformation("Deleting order item with ID {OrderItemId}", id);
            var item = await _context.OrderItems.FindAsync(id);
            if (item == null)
            {
                _logger.LogWarning("Order item with ID {OrderItemId} not found for deletion", id);
                return NotFound();
            }

            _context.OrderItems.Remove(item);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully deleted order item with ID {OrderItemId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting order item with ID {OrderItemId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }
}
