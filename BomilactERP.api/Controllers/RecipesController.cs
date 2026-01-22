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
    public async Task<ActionResult<IEnumerable<RecipeDto>>> GetAll()
    {
        try
        {
            _logger.LogInformation("Fetching all recipes");
            var recipes = await _context.Recipes
                .ToListAsync();

            var dtos = recipes.Select(r => new RecipeDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                OutputProductId = r.OutputProductId,
                OutputQuantity = r.OutputQuantity,
                IsActive = r.IsActive
            });

            _logger.LogInformation("Successfully fetched {Count} recipes", dtos.Count());
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching recipes");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RecipeDto>> GetById(int id)
    {
        try
        {
            _logger.LogInformation("Fetching recipe with ID {RecipeId}", id);
            var recipe = await _context.Recipes.FindAsync(id);
            if (recipe == null)
            {
                _logger.LogWarning("Recipe with ID {RecipeId} not found", id);
                return NotFound();
            }

            var dto = new RecipeDto
            {
                Id = recipe.Id,
                Name = recipe.Name,
                Description = recipe.Description,
                OutputProductId = recipe.OutputProductId,
                OutputQuantity = recipe.OutputQuantity,
                IsActive = recipe.IsActive
            };

            _logger.LogInformation("Successfully fetched recipe with ID {RecipeId}", id);
            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching recipe with ID {RecipeId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<RecipeDto>> Create(CreateRecipeDto dto)
    {
        try
        {
            _logger.LogInformation("Creating new recipe with name {RecipeName}", dto.Name);
            var recipe = new Recipe
            {
                Name = dto.Name,
                Description = dto.Description,
                OutputProductId = dto.OutputProductId,
                OutputQuantity = dto.OutputQuantity
            };

            _context.Recipes.Add(recipe);
            await _context.SaveChangesAsync();

            var resultDto = new RecipeDto
            {
                Id = recipe.Id,
                Name = recipe.Name,
                Description = recipe.Description,
                OutputProductId = recipe.OutputProductId,
                OutputQuantity = recipe.OutputQuantity,
                IsActive = recipe.IsActive
            };

            _logger.LogInformation("Successfully created recipe with ID {RecipeId}", recipe.Id);
            return CreatedAtAction(nameof(GetById), new { id = recipe.Id }, resultDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating recipe");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateRecipeDto dto)
    {
        try
        {
            _logger.LogInformation("Updating recipe with ID {RecipeId}", id);
            var recipe = await _context.Recipes.FindAsync(id);
            if (recipe == null)
            {
                _logger.LogWarning("Recipe with ID {RecipeId} not found for update", id);
                return NotFound();
            }

            recipe.Name = dto.Name;
            recipe.Description = dto.Description;
            recipe.OutputProductId = dto.OutputProductId;
            recipe.OutputQuantity = dto.OutputQuantity;
            recipe.IsActive = dto.IsActive;
            recipe.UpdatedAt = DateTime.UtcNow;

            _context.Recipes.Update(recipe);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully updated recipe with ID {RecipeId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating recipe with ID {RecipeId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            _logger.LogInformation("Deleting recipe with ID {RecipeId}", id);
            var recipe = await _context.Recipes.FindAsync(id);
            if (recipe == null)
            {
                _logger.LogWarning("Recipe with ID {RecipeId} not found for deletion", id);
                return NotFound();
            }

            _context.Recipes.Remove(recipe);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully deleted recipe with ID {RecipeId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting recipe with ID {RecipeId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }
}
