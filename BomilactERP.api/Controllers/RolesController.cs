using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class RolesController : ControllerBase
{
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<RolesController> _logger;

    public RolesController(
        RoleManager<IdentityRole> roleManager,
        UserManager<ApplicationUser> userManager,
        ILogger<RolesController> logger)
    {
        _roleManager = roleManager;
        _userManager = userManager;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoleDto>>> GetAll()
    {
        try
        {
            var roles = await _roleManager.Roles.ToListAsync();
            var result = new List<RoleDto>();
            foreach (var role in roles)
            {
                var usersInRole = await _userManager.GetUsersInRoleAsync(role.Name!);
                result.Add(new RoleDto
                {
                    Id = role.Id,
                    Name = role.Name!,
                    UserCount = usersInRole.Count
                });
            }
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching roles");
            return StatusCode(500, new { message = "Belső hiba történt." });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RoleDto>> GetById(string id)
    {
        var role = await _roleManager.FindByIdAsync(id);
        if (role == null) return NotFound();
        var usersInRole = await _userManager.GetUsersInRoleAsync(role.Name!);
        return Ok(new RoleDto { Id = role.Id, Name = role.Name!, UserCount = usersInRole.Count });
    }

    [HttpPost]
    public async Task<ActionResult<RoleDto>> Create([FromBody] CreateRoleDto dto)
    {
        try
        {
            if (await _roleManager.RoleExistsAsync(dto.Name))
                return Conflict(new { message = "Ez a szerepkör már létezik." });

            var role = new IdentityRole(dto.Name);
            var result = await _roleManager.CreateAsync(role);
            if (!result.Succeeded)
                return BadRequest(new { message = string.Join(", ", result.Errors.Select(e => e.Description)) });

            _logger.LogInformation("Role {RoleName} created", dto.Name);
            return CreatedAtAction(nameof(GetById), new { id = role.Id }, new RoleDto { Id = role.Id, Name = role.Name!, UserCount = 0 });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating role");
            return StatusCode(500, new { message = "Belső hiba történt." });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateRoleDto dto)
    {
        try
        {
            var role = await _roleManager.FindByIdAsync(id);
            if (role == null) return NotFound();

            role.Name = dto.Name;
            var result = await _roleManager.UpdateAsync(role);
            if (!result.Succeeded)
                return BadRequest(new { message = string.Join(", ", result.Errors.Select(e => e.Description)) });

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating role {RoleId}", id);
            return StatusCode(500, new { message = "Belső hiba történt." });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        try
        {
            var role = await _roleManager.FindByIdAsync(id);
            if (role == null) return NotFound();

            // Prevent deletion of built-in roles
            var builtInRoles = new[] { "Admin", "Manager", "Internal", "Driver", "Agent", "Partner" };
            if (builtInRoles.Contains(role.Name))
                return BadRequest(new { message = "Az alapértelmezett szerepkörök nem törölhetők." });

            var result = await _roleManager.DeleteAsync(role);
            if (!result.Succeeded)
                return BadRequest(new { message = string.Join(", ", result.Errors.Select(e => e.Description)) });

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting role {RoleId}", id);
            return StatusCode(500, new { message = "Belső hiba történt." });
        }
    }
}
