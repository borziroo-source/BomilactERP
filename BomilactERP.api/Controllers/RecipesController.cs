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

    public RecipesController(BomilactDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RecipeDto>>> GetAll()
    {
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

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RecipeDto>> GetById(int id)
    {
        var recipe = await _context.Recipes.FindAsync(id);
        if (recipe == null)
            return NotFound();

        var dto = new RecipeDto
        {
            Id = recipe.Id,
            Name = recipe.Name,
            Description = recipe.Description,
            OutputProductId = recipe.OutputProductId,
            OutputQuantity = recipe.OutputQuantity,
            IsActive = recipe.IsActive
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<RecipeDto>> Create(CreateRecipeDto dto)
    {
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

        return CreatedAtAction(nameof(GetById), new { id = recipe.Id }, resultDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateRecipeDto dto)
    {
        var recipe = await _context.Recipes.FindAsync(id);
        if (recipe == null)
            return NotFound();

        recipe.Name = dto.Name;
        recipe.Description = dto.Description;
        recipe.OutputProductId = dto.OutputProductId;
        recipe.OutputQuantity = dto.OutputQuantity;
        recipe.IsActive = dto.IsActive;
        recipe.UpdatedAt = DateTime.UtcNow;

        _context.Recipes.Update(recipe);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var recipe = await _context.Recipes.FindAsync(id);
        if (recipe == null)
            return NotFound();

        _context.Recipes.Remove(recipe);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
