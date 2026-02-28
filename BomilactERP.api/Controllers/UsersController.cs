using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Manager")]
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<UsersController> _logger;

    public UsersController(UserManager<ApplicationUser> userManager, ILogger<UsersController> logger)
    {
        _userManager = userManager;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        try
        {
            var users = await _userManager.Users
                .Where(u => !u.IsDeleted)
                .OrderBy(u => u.LastName)
                .ThenBy(u => u.FirstName)
                .ToListAsync();

            var result = new List<UserDto>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                result.Add(MapToDto(user, roles));
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching users");
            return StatusCode(500, new { message = "Belső hiba történt." });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetById(string id)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null || user.IsDeleted) return NotFound();
            var roles = await _userManager.GetRolesAsync(user);
            return Ok(MapToDto(user, roles));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching user {UserId}", id);
            return StatusCode(500, new { message = "Belső hiba történt." });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserDto dto)
    {
        try
        {
            var user = new ApplicationUser
            {
                UserName = dto.UserName,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Department = dto.Department,
                IsActive = true,
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(new { message = string.Join(", ", result.Errors.Select(e => e.Description)) });

            foreach (var role in dto.Roles)
            {
                await _userManager.AddToRoleAsync(user, role);
            }

            var roles = await _userManager.GetRolesAsync(user);
            _logger.LogInformation("User {Email} created", user.Email);
            return CreatedAtAction(nameof(GetById), new { id = user.Id }, MapToDto(user, roles));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return StatusCode(500, new { message = "Belső hiba történt." });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateUserDto dto)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null || user.IsDeleted) return NotFound();

            user.Email = dto.Email;
            user.UserName = dto.Email;
            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Department = dto.Department;
            user.IsActive = dto.IsActive;
            user.UpdatedAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(new { message = string.Join(", ", result.Errors.Select(e => e.Description)) });

            // Update roles
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            foreach (var role in dto.Roles)
            {
                await _userManager.AddToRoleAsync(user, role);
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            return StatusCode(500, new { message = "Belső hiba történt." });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null || user.IsDeleted) return NotFound();

            user.IsDeleted = true;
            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            _logger.LogInformation("User {UserId} soft deleted", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", id);
            return StatusCode(500, new { message = "Belső hiba történt." });
        }
    }

    private static UserDto MapToDto(ApplicationUser user, IList<string> roles) => new()
    {
        Id = user.Id,
        UserName = user.UserName ?? string.Empty,
        Email = user.Email ?? string.Empty,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Department = user.Department,
        IsActive = user.IsActive,
        CreatedAt = user.CreatedAt,
        LastLoginAt = user.LastLoginAt,
        Roles = roles.ToList()
    };
}
