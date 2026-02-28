using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;
using BomilactERP.api.Data;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PermissionsController : ControllerBase
{
    private readonly BomilactDbContext _context;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<PermissionsController> _logger;

    public PermissionsController(
        BomilactDbContext context,
        RoleManager<IdentityRole> roleManager,
        UserManager<ApplicationUser> userManager,
        ILogger<PermissionsController> logger)
    {
        _context = context;
        _roleManager = roleManager;
        _userManager = userManager;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<PermissionDto>>> GetAll()
    {
        var permissions = await _context.AppPermissions
            .OrderBy(p => p.Category)
            .ThenBy(p => p.ModuleId)
            .ThenBy(p => p.SubModuleId)
            .ThenBy(p => p.Action)
            .Select(p => new PermissionDto
            {
                Id = p.Id,
                ModuleId = p.ModuleId,
                SubModuleId = p.SubModuleId,
                Action = p.Action,
                DisplayName = p.DisplayName,
                Category = p.Category
            })
            .ToListAsync();

        return Ok(permissions);
    }

    [HttpGet("role/{roleId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<RolePermissionsDto>> GetRolePermissions(string roleId)
    {
        var role = await _roleManager.FindByIdAsync(roleId);
        if (role == null) return NotFound();

        var permissionIds = await _context.RolePermissions
            .Where(rp => rp.RoleId == roleId)
            .Select(rp => rp.PermissionId)
            .ToListAsync();

        return Ok(new RolePermissionsDto
        {
            RoleId = role.Id,
            RoleName = role.Name!,
            PermissionIds = permissionIds
        });
    }

    [HttpPut("role/{roleId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRolePermissions(string roleId, [FromBody] UpdateRolePermissionsDto dto)
    {
        try
        {
            var role = await _roleManager.FindByIdAsync(roleId);
            if (role == null) return NotFound();

            // Remove existing permissions for role
            var existing = await _context.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .ToListAsync();
            _context.RolePermissions.RemoveRange(existing);

            // Add new permissions
            foreach (var permId in dto.PermissionIds)
            {
                _context.RolePermissions.Add(new RolePermission
                {
                    RoleId = roleId,
                    PermissionId = permId
                });
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Updated permissions for role {RoleId}", roleId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating permissions for role {RoleId}", roleId);
            return StatusCode(500, new { message = "Belső hiba történt." });
        }
    }

    [HttpGet("user")]
    public async Task<ActionResult<IEnumerable<UserPermissionDto>>> GetCurrentUserPermissions()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();

            var roles = await _userManager.GetRolesAsync(user);
            var roleIds = await _context.Roles
                .Where(r => roles.Contains(r.Name!))
                .Select(r => r.Id)
                .ToListAsync();

            var permissions = await _context.RolePermissions
                .Where(rp => roleIds.Contains(rp.RoleId))
                .Include(rp => rp.Permission)
                .Select(rp => new UserPermissionDto
                {
                    ModuleId = rp.Permission.ModuleId,
                    SubModuleId = rp.Permission.SubModuleId,
                    Action = rp.Permission.Action
                })
                .Distinct()
                .ToListAsync();

            return Ok(permissions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user permissions");
            return StatusCode(500, new { message = "Belső hiba történt." });
        }
    }
}
