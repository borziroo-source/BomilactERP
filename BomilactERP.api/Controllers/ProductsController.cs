using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BomilactERP.api.Data;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly BomilactDbContext _context;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(BomilactDbContext context, ILogger<ProductsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetAll(
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? category = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var query = _context.Products.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var s = searchTerm.Trim().ToLower();
                query = query.Where(p =>
                    p.Name.ToLower().Contains(s) ||
                    p.Sku.ToLower().Contains(s) ||
                    (p.SagaRefId != null && p.SagaRefId.ToLower().Contains(s)));
            }

            if (!string.IsNullOrWhiteSpace(category) && Enum.TryParse<ProductCategory>(category, true, out var cat))
            {
                query = query.Where(p => p.Category == cat);
            }

            query = query.OrderBy(p => p.Category).ThenBy(p => p.Name);

            var totalCount = await query.CountAsync();

            var products = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            _logger.LogInformation("Sikeresen lekérdezve {Count}/{Total} termék (oldal: {Page}).", products.Count, totalCount, page);

            return Ok(new PagedResult<ProductDto>
            {
                Items = products.Select(MapToDto),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Hiba a termékek lekérésekor.");
            return StatusCode(500, new { message = "Hiba a termékek lekérésekor." });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetById(int id)
    {
        try
        {
            var product = await _context.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
            if (product == null) return NotFound();
            return Ok(MapToDto(product));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Hiba a termék lekérésekor (ID: {Id}).", id);
            return StatusCode(500, new { message = "Hiba a termék lekérésekor." });
        }
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create(CreateProductDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Sku) || string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "A Cikkszám (SKU) és a Megnevezés megadása kötelező." });

            var skuExists = await _context.Products.AnyAsync(p => p.Sku == dto.Sku);
            if (skuExists)
                return Conflict(new { message = $"A megadott Cikkszám ({dto.Sku}) már létezik." });

            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Sku = dto.Sku,
                Price = dto.Price,
                Unit = dto.Uom,
                Uom = dto.Uom,
                Category = ParseCategory(dto.Category),
                WeightNetKg = dto.WeightNetKg,
                MinStockThreshold = dto.MinStockThreshold,
                SagaRefId = dto.SagaRefId,
                ShelfLifeDays = dto.ShelfLifeDays,
                StorageTempMin = dto.StorageTempMin,
                StorageTempMax = dto.StorageTempMax,
                CreatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Termék létrehozva (ID: {Id}, SKU: {Sku}).", product.Id, product.Sku);
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, MapToDto(product));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Hiba a termék létrehozásakor.");
            return StatusCode(500, new { message = "Hiba a termék létrehozásakor." });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateProductDto dto)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            if (string.IsNullOrWhiteSpace(dto.Sku) || string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "A Cikkszám (SKU) és a Megnevezés megadása kötelező." });

            var skuExists = await _context.Products.AnyAsync(p => p.Sku == dto.Sku && p.Id != id);
            if (skuExists)
                return Conflict(new { message = $"A megadott Cikkszám ({dto.Sku}) már létezik." });

            product.Name = dto.Name;
            product.Description = dto.Description;
            product.Sku = dto.Sku;
            product.Price = dto.Price;
            product.Unit = dto.Uom;
            product.Uom = dto.Uom;
            product.Category = ParseCategory(dto.Category);
            product.WeightNetKg = dto.WeightNetKg;
            product.MinStockThreshold = dto.MinStockThreshold;
            product.SagaRefId = dto.SagaRefId;
            product.ShelfLifeDays = dto.ShelfLifeDays;
            product.StorageTempMin = dto.StorageTempMin;
            product.StorageTempMax = dto.StorageTempMax;
            product.IsActive = dto.IsActive;
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Termék frissítve (ID: {Id}).", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Hiba a termék frissítésekor (ID: {Id}).", id);
            return StatusCode(500, new { message = "Hiba a termék frissítésekor." });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Termék törölve (ID: {Id}).", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Hiba a termék törlésekor (ID: {Id}).", id);
            return StatusCode(500, new { message = "Hiba a termék törlésekor." });
        }
    }

    private static ProductDto MapToDto(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Description = p.Description,
        Sku = p.Sku,
        Price = p.Price,
        Uom = p.Uom,
        Category = p.Category.ToString(),
        WeightNetKg = p.WeightNetKg,
        MinStockThreshold = p.MinStockThreshold,
        SagaRefId = p.SagaRefId,
        ShelfLifeDays = p.ShelfLifeDays,
        StorageTempMin = p.StorageTempMin,
        StorageTempMax = p.StorageTempMax,
        IsActive = p.IsActive
    };

    private static ProductCategory ParseCategory(string value) =>
        Enum.TryParse<ProductCategory>(value, true, out var result) ? result : ProductCategory.FINISHED;
}
