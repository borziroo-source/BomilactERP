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

    public PartnersController(IRepository<Partner> repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PartnerDto>>> GetAll()
    {
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
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PartnerDto>> GetById(int id)
    {
        var partner = await _repository.GetByIdAsync(id);
        if (partner == null)
            return NotFound();

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
        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<PartnerDto>> Create(CreatePartnerDto dto)
    {
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

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, resultDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdatePartnerDto dto)
    {
        var partner = await _repository.GetByIdAsync(id);
        if (partner == null)
            return NotFound();

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
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _repository.DeleteAsync(id);
        if (!success)
            return NotFound();

        return NoContent();
    }
}
