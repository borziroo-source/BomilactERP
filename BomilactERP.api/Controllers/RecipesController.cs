using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;
using BomilactERP.api.Data;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecipesController : ControllerBase
{
    private readonly BomilactDbContext _context;
    private readonly ILogger<RecipesController> _logger;

    public RecipesController(BomilactDbContext context, ILogger<RecipesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RecipeDto>>> GetAll([FromQuery] string? searchTerm = null)
    {
        try
        {
            var query = _context.Recipes
                .Include(r => r.RecipeItems)
                    .ThenInclude(ri => ri.Product)
                .Include(r => r.OutputProduct)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var lower = searchTerm.ToLower();
                query = query.Where(r => r.Name.ToLower().Contains(lower));
            }

            var recipes = await query.OrderBy(r => r.Name).ToListAsync();
            return Ok(recipes.Select(MapToDto));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching recipes");
            return StatusCode(500, new { message = "Hiba a receptúrák lekérésekor." });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RecipeDto>> GetById(int id)
    {
        try
        {
            var recipe = await _context.Recipes
                .Include(r => r.RecipeItems)
                    .ThenInclude(ri => ri.Product)
                .Include(r => r.OutputProduct)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (recipe == null) return NotFound();
            return Ok(MapToDto(recipe));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching recipe {Id}", id);
            return StatusCode(500, new { message = "Hiba a receptúra lekérésekor." });
        }
    }

    [HttpPost]
    public async Task<ActionResult<RecipeDto>> Create(CreateRecipeDto dto)
    {
        try
        {
            var recipe = new Recipe
            {
                Name = dto.Name,
                Description = dto.Description,
                OutputProductId = dto.OutputProductId,
                OutputQuantity = dto.OutputQuantity,
                OutputUom = dto.OutputUom,
                Version = dto.Version,
                Instructions = dto.Instructions,
                Status = RecipeStatus.Draft,
                IsActive = true
            };

            foreach (var item in dto.Items)
            {
                recipe.RecipeItems.Add(new RecipeItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Unit = item.Unit,
                    UnitCost = item.UnitCost,
                    Category = item.Category
                });
            }

            _context.Recipes.Add(recipe);
            await _context.SaveChangesAsync();

            // Reload with navigations
            await _context.Entry(recipe).Reference(r => r.OutputProduct).LoadAsync();
            await _context.Entry(recipe).Collection(r => r.RecipeItems).Query()
                .Include(ri => ri.Product).LoadAsync();

            _logger.LogInformation("Created recipe {Name}", recipe.Name);
            return CreatedAtAction(nameof(GetById), new { id = recipe.Id }, MapToDto(recipe));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating recipe");
            return StatusCode(500, new { message = "Hiba a receptúra létrehozásakor." });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateRecipeDto dto)
    {
        try
        {
            var recipe = await _context.Recipes
                .Include(r => r.RecipeItems)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (recipe == null) return NotFound();

            recipe.Name = dto.Name;
            recipe.Description = dto.Description;
            recipe.OutputProductId = dto.OutputProductId;
            recipe.OutputQuantity = dto.OutputQuantity;
            recipe.OutputUom = dto.OutputUom;
            recipe.Version = dto.Version;
            recipe.Instructions = dto.Instructions;
            recipe.IsActive = dto.IsActive;
            recipe.UpdatedAt = DateTime.UtcNow;

            if (Enum.TryParse<RecipeStatus>(dto.Status, true, out var statusEnum))
                recipe.Status = statusEnum;

            // Replace items
            foreach (var existing in recipe.RecipeItems.ToList())
                _context.RecipeItems.Remove(existing);

            foreach (var item in dto.Items)
            {
                recipe.RecipeItems.Add(new RecipeItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Unit = item.Unit,
                    UnitCost = item.UnitCost,
                    Category = item.Category
                });
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Updated recipe {Id}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating recipe {Id}", id);
            return StatusCode(500, new { message = "Hiba a receptúra frissítésekor." });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var recipe = await _context.Recipes.FindAsync(id);
            if (recipe == null) return NotFound();

            _context.Recipes.Remove(recipe);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Deleted recipe {Id}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting recipe {Id}", id);
            return StatusCode(500, new { message = "Hiba a receptúra törlésekor." });
        }
    }

    private static RecipeDto MapToDto(Recipe r) => new()
    {
        Id = r.Id,
        Name = r.Name,
        Description = r.Description,
        OutputProductId = r.OutputProductId,
        OutputProductName = r.OutputProduct?.Name,
        OutputProductSku = r.OutputProduct?.Sku,
        OutputQuantity = r.OutputQuantity,
        OutputUom = r.OutputUom,
        Version = r.Version,
        Status = r.Status.ToString().ToUpper(),
        Instructions = r.Instructions,
        IsActive = r.IsActive,
        UpdatedAt = r.UpdatedAt,
        Items = r.RecipeItems.Select(ri => new RecipeItemDto
        {
            Id = ri.Id,
            ProductId = ri.ProductId,
            ComponentName = ri.Product?.Name ?? string.Empty,
            ComponentSku = ri.Product?.Sku,
            Quantity = ri.Quantity,
            Unit = ri.Unit,
            UnitCost = ri.UnitCost,
            Category = ri.Category
        }).ToList()
    };
}
