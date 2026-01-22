using Microsoft.AspNetCore.Mvc;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;
using BomilactERP.api.Repositories;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PartnersController : ControllerBase
{
    private readonly IRepository<Partner> _repository;
    private readonly ILogger<PartnersController> _logger;

    public PartnersController(IRepository<Partner> repository, ILogger<PartnersController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PartnerDto>>> GetAll()
    {
        try
        {
            _logger.LogInformation("Fetching all partners");
            var partners = await _repository.GetAllAsync();
            var dtos = partners.Select(p => new PartnerDto
            {
                Id = p.Id,
                Name = p.Name,
                TaxNumber = p.TaxNumber,
                Address = p.Address,
                City = p.City,
                PostalCode = p.PostalCode,
                Country = p.Country,
                ContactPerson = p.ContactPerson,
                Email = p.Email,
                Phone = p.Phone,
                Type = (int)p.Type,
                IsActive = p.IsActive
            });
            _logger.LogInformation("Successfully fetched {Count} partners", dtos.Count());
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching partners");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PartnerDto>> GetById(int id)
    {
        try
        {
            _logger.LogInformation("Fetching partner with ID {PartnerId}", id);
            var partner = await _repository.GetByIdAsync(id);
            if (partner == null)
            {
                _logger.LogWarning("Partner with ID {PartnerId} not found", id);
                return NotFound();
            }

            var dto = new PartnerDto
            {
                Id = partner.Id,
                Name = partner.Name,
                TaxNumber = partner.TaxNumber,
                Address = partner.Address,
                City = partner.City,
                PostalCode = partner.PostalCode,
                Country = partner.Country,
                ContactPerson = partner.ContactPerson,
                Email = partner.Email,
                Phone = partner.Phone,
                Type = (int)partner.Type,
                IsActive = partner.IsActive
            };
            _logger.LogInformation("Successfully fetched partner with ID {PartnerId}", id);
            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching partner with ID {PartnerId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<PartnerDto>> Create(CreatePartnerDto dto)
    {
        try
        {
            _logger.LogInformation("Creating new partner: {PartnerName}", dto.Name);
            var partner = new Partner
            {
                Name = dto.Name,
                TaxNumber = dto.TaxNumber,
                Address = dto.Address,
                City = dto.City,
                PostalCode = dto.PostalCode,
                Country = dto.Country,
                ContactPerson = dto.ContactPerson,
                Email = dto.Email,
                Phone = dto.Phone,
                Type = (PartnerType)dto.Type
            };

            var created = await _repository.CreateAsync(partner);
            var resultDto = new PartnerDto
            {
                Id = created.Id,
                Name = created.Name,
                TaxNumber = created.TaxNumber,
                Address = created.Address,
                City = created.City,
                PostalCode = created.PostalCode,
                Country = created.Country,
                ContactPerson = created.ContactPerson,
                Email = created.Email,
                Phone = created.Phone,
                Type = (int)created.Type,
                IsActive = created.IsActive
            };

            _logger.LogInformation("Successfully created partner with ID {PartnerId}", created.Id);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, resultDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating partner");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdatePartnerDto dto)
    {
        try
        {
            _logger.LogInformation("Updating partner with ID {PartnerId}", id);
            var partner = await _repository.GetByIdAsync(id);
            if (partner == null)
            {
                _logger.LogWarning("Partner with ID {PartnerId} not found for update", id);
                return NotFound();
            }

            partner.Name = dto.Name;
            partner.TaxNumber = dto.TaxNumber;
            partner.Address = dto.Address;
            partner.City = dto.City;
            partner.PostalCode = dto.PostalCode;
            partner.Country = dto.Country;
            partner.ContactPerson = dto.ContactPerson;
            partner.Email = dto.Email;
            partner.Phone = dto.Phone;
            partner.Type = (PartnerType)dto.Type;
            partner.IsActive = dto.IsActive;
            partner.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(partner);
            _logger.LogInformation("Successfully updated partner with ID {PartnerId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating partner with ID {PartnerId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            _logger.LogInformation("Deleting partner with ID {PartnerId}", id);
            var success = await _repository.DeleteAsync(id);
            if (!success)
            {
                _logger.LogWarning("Partner with ID {PartnerId} not found for deletion", id);
                return NotFound();
            }

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
