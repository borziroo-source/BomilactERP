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

    public ProductsController(IRepository<Product> repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetAll()
    {
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
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetById(int id)
    {
        var product = await _repository.GetByIdAsync(id);
        if (product == null)
            return NotFound();

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
        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create(CreateProductDto dto)
    {
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

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, resultDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateProductDto dto)
    {
        var product = await _repository.GetByIdAsync(id);
        if (product == null)
            return NotFound();

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Sku = dto.Sku;
        product.Price = dto.Price;
        product.Unit = dto.Unit;
        product.IsActive = dto.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(product);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _repository.DeleteAsync(id);
        if (!success)
            return NotFound();

        return NoContent();
    }
}
