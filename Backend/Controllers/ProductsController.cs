using Microsoft.AspNetCore.Mvc;

namespace BomilactERP.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ILogger<ProductsController> _logger;
    private static readonly List<Product> _products = new()
    {
        new Product { Id = 1, Name = "Product 1", Price = 100 },
        new Product { Id = 2, Name = "Product 2", Price = 200 },
        new Product { Id = 3, Name = "Product 3", Price = 300 }
    };

    public ProductsController(ILogger<ProductsController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        try
        {
            _logger.LogInformation("Fetching all products");
            var products = _products.ToList();
            _logger.LogInformation("Successfully fetched {Count} products", products.Count);
            return Ok(products);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching products");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        try
        {
            _logger.LogInformation("Fetching product with ID {ProductId}", id);
            var product = _products.FirstOrDefault(p => p.Id == id);
            
            if (product == null)
            {
                _logger.LogWarning("Product with ID {ProductId} not found", id);
                return NotFound(new { message = $"Product with ID {id} not found" });
            }

            _logger.LogInformation("Successfully fetched product with ID {ProductId}", id);
            return Ok(product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching product with ID {ProductId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPost]
    public IActionResult Create([FromBody] Product product)
    {
        try
        {
            _logger.LogInformation("Creating new product: {ProductName}", product.Name);
            
            if (string.IsNullOrWhiteSpace(product.Name))
            {
                _logger.LogWarning("Product creation failed: Name is required");
                return BadRequest(new { message = "Product name is required" });
            }

            product.Id = _products.Any() ? _products.Max(p => p.Id) + 1 : 1;
            _products.Add(product);
            
            _logger.LogInformation("Successfully created product with ID {ProductId}", product.Id);
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating product");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPut("{id}")]
    public IActionResult Update(int id, [FromBody] Product product)
    {
        try
        {
            _logger.LogInformation("Updating product with ID {ProductId}", id);
            
            if (string.IsNullOrWhiteSpace(product.Name))
            {
                _logger.LogWarning("Product update failed: Name is required");
                return BadRequest(new { message = "Product name is required" });
            }
            
            var existingProduct = _products.FirstOrDefault(p => p.Id == id);
            if (existingProduct == null)
            {
                _logger.LogWarning("Product with ID {ProductId} not found for update", id);
                return NotFound(new { message = $"Product with ID {id} not found" });
            }

            existingProduct.Name = product.Name;
            existingProduct.Price = product.Price;
            
            _logger.LogInformation("Successfully updated product with ID {ProductId}", id);
            return Ok(existingProduct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating product with ID {ProductId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        try
        {
            _logger.LogInformation("Deleting product with ID {ProductId}", id);
            
            var product = _products.FirstOrDefault(p => p.Id == id);
            if (product == null)
            {
                _logger.LogWarning("Product with ID {ProductId} not found for deletion", id);
                return NotFound(new { message = $"Product with ID {id} not found" });
            }

            _products.Remove(product);
            
            _logger.LogInformation("Successfully deleted product with ID {ProductId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting product with ID {ProductId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }
}

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
}
