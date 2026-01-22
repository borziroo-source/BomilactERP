using Microsoft.AspNetCore.Mvc;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;
using BomilactERP.api.Repositories;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IRepository<Product> _repository;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(IRepository<Product> repository, ILogger<ProductsController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetAll()
    {
        try
        {
            _logger.LogInformation("Fetching all products");
            var products = await _repository.GetAllAsync();
            var dtos = products.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Sku = p.Sku,
                Price = p.Price,
                Unit = p.Unit,
                IsActive = p.IsActive
            });
            _logger.LogInformation("Successfully fetched {Count} products", dtos.Count());
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching products");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetById(int id)
    {
        try
        {
            _logger.LogInformation("Fetching product with ID {ProductId}", id);
            var product = await _repository.GetByIdAsync(id);
            if (product == null)
            {
                _logger.LogWarning("Product with ID {ProductId} not found", id);
                return NotFound();
            }

            var dto = new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Sku = product.Sku,
                Price = product.Price,
                Unit = product.Unit,
                IsActive = product.IsActive
            };
            _logger.LogInformation("Successfully fetched product with ID {ProductId}", id);
            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching product with ID {ProductId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create(CreateProductDto dto)
    {
        try
        {
            _logger.LogInformation("Creating new product with SKU {Sku}", dto.Sku);
            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Sku = dto.Sku,
                Price = dto.Price,
                Unit = dto.Unit
            };

            var created = await _repository.CreateAsync(product);
            var resultDto = new ProductDto
            {
                Id = created.Id,
                Name = created.Name,
                Description = created.Description,
                Sku = created.Sku,
                Price = created.Price,
                Unit = created.Unit,
                IsActive = created.IsActive
            };

            _logger.LogInformation("Successfully created product with ID {ProductId}", created.Id);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, resultDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating product");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateProductDto dto)
    {
        try
        {
            _logger.LogInformation("Updating product with ID {ProductId}", id);
            var product = await _repository.GetByIdAsync(id);
            if (product == null)
            {
                _logger.LogWarning("Product with ID {ProductId} not found for update", id);
                return NotFound();
            }

            product.Name = dto.Name;
            product.Description = dto.Description;
            product.Sku = dto.Sku;
            product.Price = dto.Price;
            product.Unit = dto.Unit;
            product.IsActive = dto.IsActive;
            product.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(product);
            _logger.LogInformation("Successfully updated product with ID {ProductId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating product with ID {ProductId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            _logger.LogInformation("Deleting product with ID {ProductId}", id);
            var success = await _repository.DeleteAsync(id);
            if (!success)
            {
                _logger.LogWarning("Product with ID {ProductId} not found for deletion", id);
                return NotFound();
            }

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
