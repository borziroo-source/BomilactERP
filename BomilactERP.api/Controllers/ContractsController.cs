using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BomilactERP.api.Data;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContractsController : ControllerBase
{
    private readonly BomilactDbContext _context;

    public ContractsController(BomilactDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContractDto>>> GetAll()
    {
        var contracts = await _context.Contracts
            .Include(c => c.Partner)
            .ToListAsync();

        var dtos = contracts.Select(c => new ContractDto
        {
            Id = c.Id,
            ContractNumber = c.ContractNumber,
            PartnerId = c.PartnerId,
            PartnerName = c.Partner?.Name,
            StartDate = c.StartDate,
            EndDate = c.EndDate,
            MilkQuotaLiters = c.MilkQuotaLiters,
            BasePricePerLiter = c.BasePricePerLiter,
            Status = (int)c.Status,
            Notes = c.Notes
        });

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ContractDto>> GetById(int id)
    {
        var contract = await _context.Contracts
            .Include(c => c.Partner)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (contract == null)
            return NotFound();

        var dto = new ContractDto
        {
            Id = contract.Id,
            ContractNumber = contract.ContractNumber,
            PartnerId = contract.PartnerId,
            PartnerName = contract.Partner?.Name,
            StartDate = contract.StartDate,
            EndDate = contract.EndDate,
            MilkQuotaLiters = contract.MilkQuotaLiters,
            BasePricePerLiter = contract.BasePricePerLiter,
            Status = (int)contract.Status,
            Notes = contract.Notes
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<ContractDto>> Create(CreateContractDto dto)
    {
        var contract = new Contract
        {
            ContractNumber = dto.ContractNumber,
            PartnerId = dto.PartnerId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            MilkQuotaLiters = dto.MilkQuotaLiters,
            BasePricePerLiter = dto.BasePricePerLiter,
            Status = (ContractStatus)dto.Status,
            Notes = dto.Notes
        };

        _context.Contracts.Add(contract);
        await _context.SaveChangesAsync();

        // Ensure partner navigation is available for the response
        await _context.Entry(contract).Reference(c => c.Partner).LoadAsync();

        var resultDto = new ContractDto
        {
            Id = contract.Id,
            ContractNumber = contract.ContractNumber,
            PartnerId = contract.PartnerId,
            PartnerName = contract.Partner?.Name,
            StartDate = contract.StartDate,
            EndDate = contract.EndDate,
            MilkQuotaLiters = contract.MilkQuotaLiters,
            BasePricePerLiter = contract.BasePricePerLiter,
            Status = (int)contract.Status,
            Notes = contract.Notes
        };

        return CreatedAtAction(nameof(GetById), new { id = contract.Id }, resultDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateContractDto dto)
    {
        var contract = await _context.Contracts.FindAsync(id);
        if (contract == null)
            return NotFound();

        contract.ContractNumber = dto.ContractNumber;
        contract.PartnerId = dto.PartnerId;
        contract.StartDate = dto.StartDate;
        contract.EndDate = dto.EndDate;
        contract.MilkQuotaLiters = dto.MilkQuotaLiters;
        contract.BasePricePerLiter = dto.BasePricePerLiter;
        contract.Status = (ContractStatus)dto.Status;
        contract.Notes = dto.Notes;
        contract.UpdatedAt = DateTime.UtcNow;

        _context.Contracts.Update(contract);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var contract = await _context.Contracts.FindAsync(id);
        if (contract == null)
            return NotFound();

        _context.Contracts.Remove(contract);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
