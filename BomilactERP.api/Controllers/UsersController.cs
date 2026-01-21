using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;
using BomilactERP.api.Data;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly BomilactDbContext _context;

    public UsersController(BomilactDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        var users = await _context.Users.ToListAsync();

        var dtos = users.Select(u => new UserDto
        {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email,
            FirstName = u.FirstName,
            LastName = u.LastName,
            Role = (int)u.Role,
            IsActive = u.IsActive
        });

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetById(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound();

        var dto = new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = (int)user.Role,
            IsActive = user.IsActive
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> Create(CreateUserDto dto)
    {
        // Hash password (you should use a proper hashing library like BCrypt)
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = passwordHash,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Role = (UserRole)dto.Role
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var resultDto = new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = (int)user.Role,
            IsActive = user.IsActive
        };

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, resultDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound();

        user.Email = dto.Email;
        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Role = (UserRole)dto.Role;
        user.IsActive = dto.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound();

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
