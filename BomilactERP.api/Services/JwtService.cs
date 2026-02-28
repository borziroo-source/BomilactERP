using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BomilactERP.api.Models;
using Microsoft.IdentityModel.Tokens;

namespace BomilactERP.api.Services;

public class JwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(ApplicationUser user, IList<string> roles)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(ClaimTypes.Name, user.UserName ?? string.Empty),
            new("firstName", user.FirstName ?? string.Empty),
            new("lastName", user.LastName ?? string.Empty),
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var expireHours = int.TryParse(_configuration["Jwt:ExpireHours"], out var h) ? h : 24;

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expireHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
