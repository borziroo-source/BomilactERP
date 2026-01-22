using Microsoft.AspNetCore.Mvc;

namespace BomilactERP.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly ILogger<OrdersController> _logger;
    private static readonly List<Order> _orders = new()
    {
        new Order { Id = 1, ProductName = "Product 1", Quantity = 10, TotalAmount = 1000 },
        new Order { Id = 2, ProductName = "Product 2", Quantity = 5, TotalAmount = 1000 }
    };

    public OrdersController(ILogger<OrdersController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        try
        {
            _logger.LogInformation("Fetching all orders");
            var orders = _orders.ToList();
            _logger.LogInformation("Successfully fetched {Count} orders", orders.Count);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching orders");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        try
        {
            _logger.LogInformation("Fetching order with ID {OrderId}", id);
            var order = _orders.FirstOrDefault(o => o.Id == id);
            
            if (order == null)
            {
                _logger.LogWarning("Order with ID {OrderId} not found", id);
                return NotFound(new { message = $"Order with ID {id} not found" });
            }

            _logger.LogInformation("Successfully fetched order with ID {OrderId}", id);
            return Ok(order);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching order with ID {OrderId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPost]
    public IActionResult Create([FromBody] Order order)
    {
        try
        {
            _logger.LogInformation("Creating new order for product: {ProductName}", order.ProductName);
            
            if (string.IsNullOrWhiteSpace(order.ProductName))
            {
                _logger.LogWarning("Order creation failed: Product name is required");
                return BadRequest(new { message = "Product name is required" });
            }

            if (order.Quantity <= 0)
            {
                _logger.LogWarning("Order creation failed: Quantity must be greater than zero");
                return BadRequest(new { message = "Quantity must be greater than zero" });
            }

            order.Id = _orders.Any() ? _orders.Max(o => o.Id) + 1 : 1;
            _orders.Add(order);
            
            _logger.LogInformation("Successfully created order with ID {OrderId}", order.Id);
            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating order");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPut("{id}")]
    public IActionResult Update(int id, [FromBody] Order order)
    {
        try
        {
            _logger.LogInformation("Updating order with ID {OrderId}", id);
            
            if (string.IsNullOrWhiteSpace(order.ProductName))
            {
                _logger.LogWarning("Order update failed: Product name is required");
                return BadRequest(new { message = "Product name is required" });
            }

            if (order.Quantity <= 0)
            {
                _logger.LogWarning("Order update failed: Quantity must be greater than zero");
                return BadRequest(new { message = "Quantity must be greater than zero" });
            }
            
            var existingOrder = _orders.FirstOrDefault(o => o.Id == id);
            if (existingOrder == null)
            {
                _logger.LogWarning("Order with ID {OrderId} not found for update", id);
                return NotFound(new { message = $"Order with ID {id} not found" });
            }

            existingOrder.ProductName = order.ProductName;
            existingOrder.Quantity = order.Quantity;
            existingOrder.TotalAmount = order.TotalAmount;
            
            _logger.LogInformation("Successfully updated order with ID {OrderId}", id);
            return Ok(existingOrder);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating order with ID {OrderId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        try
        {
            _logger.LogInformation("Deleting order with ID {OrderId}", id);
            
            var order = _orders.FirstOrDefault(o => o.Id == id);
            if (order == null)
            {
                _logger.LogWarning("Order with ID {OrderId} not found for deletion", id);
                return NotFound(new { message = $"Order with ID {id} not found" });
            }

            _orders.Remove(order);
            
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

public class Order
{
    public int Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal TotalAmount { get; set; }
}
