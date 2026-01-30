using Microsoft.AspNetCore.Mvc;

namespace BomilactERP.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PartnersController : ControllerBase
{
    private readonly ILogger<PartnersController> _logger;
    private static readonly List<Partner> _partners = new()
    {
        new Partner 
        { 
            Id = 1, 
            Name = "Kovács István E.V.",
            TaxNumber = "19870512-112233",
            Address = "Fő út 12.",
            City = "Csíkszereda",
            PostalCode = "530122",
            Country = "RO",
            ContactPerson = "Kovács István",
            Email = "kovacs.istvan@example.com",
            Phone = "+40 740 123 456",
            Type = 1, // Supplier
            IsActive = true
        },
        new Partner 
        { 
            Id = 2, 
            Name = "Agro Lacto Coop",
            TaxNumber = "RO12345678",
            Address = "Mező u. 5.",
            City = "Gyergyószentmiklós",
            PostalCode = "537100",
            Country = "RO",
            ContactPerson = "Nagy János",
            Email = "contact@agrolacto.ro",
            Phone = "+40 266 987 654",
            Type = 1, // Supplier
            IsActive = true
        },
        new Partner 
        { 
            Id = 3, 
            Name = "Csarnok - Csíkszentdomokos",
            TaxNumber = "RO445566",
            Address = "Alvég 44.",
            City = "Csíkszentdomokos",
            PostalCode = "537075",
            Country = "RO",
            ContactPerson = "Szabó Péter",
            Email = "csarnok.dom@example.com",
            Phone = "+40 740 999 000",
            Type = 1, // Supplier
            IsActive = true
        }
    };

    public PartnersController(ILogger<PartnersController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        try
        {
            _logger.LogInformation("Fetching all partners");
            var partners = _partners.ToList();
            _logger.LogInformation("Successfully fetched {Count} partners", partners.Count);
            return Ok(partners);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching partners");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        try
        {
            _logger.LogInformation("Fetching partner with ID {PartnerId}", id);
            var partner = _partners.FirstOrDefault(p => p.Id == id);
            
            if (partner == null)
            {
                _logger.LogWarning("Partner with ID {PartnerId} not found", id);
                return NotFound(new { message = $"Partner with ID {id} not found" });
            }

            _logger.LogInformation("Successfully fetched partner with ID {PartnerId}", id);
            return Ok(partner);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching partner with ID {PartnerId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPost]
    public IActionResult Create([FromBody] CreateUpdatePartnerDto partnerDto)
    {
        try
        {
            _logger.LogInformation("Creating new partner: {PartnerName}", partnerDto.Name);
            
            if (string.IsNullOrWhiteSpace(partnerDto.Name))
            {
                _logger.LogWarning("Partner creation failed: Name is required");
                return BadRequest(new { message = "Partner name is required" });
            }

            var partner = new Partner
            {
                Id = _partners.Any() ? _partners.Max(p => p.Id) + 1 : 1,
                Name = partnerDto.Name,
                TaxNumber = partnerDto.TaxNumber,
                Address = partnerDto.Address,
                City = partnerDto.City,
                PostalCode = partnerDto.PostalCode,
                Country = partnerDto.Country,
                ContactPerson = partnerDto.ContactPerson,
                Email = partnerDto.Email,
                Phone = partnerDto.Phone,
                Type = partnerDto.Type,
                IsActive = partnerDto.IsActive ?? true
            };
            
            _partners.Add(partner);
            
            _logger.LogInformation("Successfully created partner with ID {PartnerId}", partner.Id);
            return CreatedAtAction(nameof(GetById), new { id = partner.Id }, partner);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating partner");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPut("{id}")]
    public IActionResult Update(int id, [FromBody] CreateUpdatePartnerDto partnerDto)
    {
        try
        {
            _logger.LogInformation("Updating partner with ID {PartnerId}", id);
            
            if (string.IsNullOrWhiteSpace(partnerDto.Name))
            {
                _logger.LogWarning("Partner update failed: Name is required");
                return BadRequest(new { message = "Partner name is required" });
            }
            
            var existingPartner = _partners.FirstOrDefault(p => p.Id == id);
            if (existingPartner == null)
            {
                _logger.LogWarning("Partner with ID {PartnerId} not found for update", id);
                return NotFound(new { message = $"Partner with ID {id} not found" });
            }

            existingPartner.Name = partnerDto.Name;
            existingPartner.TaxNumber = partnerDto.TaxNumber;
            existingPartner.Address = partnerDto.Address;
            existingPartner.City = partnerDto.City;
            existingPartner.PostalCode = partnerDto.PostalCode;
            existingPartner.Country = partnerDto.Country;
            existingPartner.ContactPerson = partnerDto.ContactPerson;
            existingPartner.Email = partnerDto.Email;
            existingPartner.Phone = partnerDto.Phone;
            existingPartner.Type = partnerDto.Type;
            existingPartner.IsActive = partnerDto.IsActive ?? existingPartner.IsActive;
            
            _logger.LogInformation("Successfully updated partner with ID {PartnerId}", id);
            return Ok(existingPartner);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating partner with ID {PartnerId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        try
        {
            _logger.LogInformation("Deleting partner with ID {PartnerId}", id);
            
            var partner = _partners.FirstOrDefault(p => p.Id == id);
            if (partner == null)
            {
                _logger.LogWarning("Partner with ID {PartnerId} not found for deletion", id);
                return NotFound(new { message = $"Partner with ID {id} not found" });
            }

            _partners.Remove(partner);
            
            _logger.LogInformation("Successfully deleted partner with ID {PartnerId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting partner with ID {PartnerId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }
}

public class Partner
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? TaxNumber { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string? ContactPerson { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int Type { get; set; } // 0 = Customer, 1 = Supplier, 2 = Both
    public bool IsActive { get; set; }
}

public class CreateUpdatePartnerDto
{
    public string Name { get; set; } = string.Empty;
    public string? TaxNumber { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string? ContactPerson { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int Type { get; set; }
    public bool? IsActive { get; set; }
}
