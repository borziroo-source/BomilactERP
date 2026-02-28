using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;
using BomilactERP.api.Data;
using BomilactERP.api.Services;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly JwtService _jwtService;
    private readonly BomilactDbContext _context;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        JwtService jwtService,
        BomilactDbContext context,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtService = jwtService;
        _context = context;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto dto)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null || !user.IsActive || user.IsDeleted)
            {
                return Unauthorized(new { message = "Érvénytelen email cím vagy jelszó." });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
            if (!result.Succeeded)
            {
                return Unauthorized(new { message = "Érvénytelen email cím vagy jelszó." });
            }

            var roles = await _userManager.GetRolesAsync(user);
            var token = _jwtService.GenerateToken(user, roles);

            user.LastLoginAt = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            _logger.LogInformation("User {Email} logged in successfully", user.Email);

            return Ok(new LoginResponseDto
            {
                Token = token,
                UserId = user.Id,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Roles = roles.ToList()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login error for {Email}", dto.Email);
            return StatusCode(500, new { message = "Belső hiba történt." });
        }
    }

    [HttpGet("me")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<ActionResult<CurrentUserDto>> GetCurrentUser()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null || user.IsDeleted) return NotFound();

            var roles = await _userManager.GetRolesAsync(user);

            // Get permissions for user's roles
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

            return Ok(new CurrentUserDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                UserName = user.UserName ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Department = user.Department,
                IsActive = user.IsActive,
                Roles = roles.ToList(),
                Permissions = permissions
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user");
            return StatusCode(500, new { message = "Belső hiba történt." });
        }
    }
}
