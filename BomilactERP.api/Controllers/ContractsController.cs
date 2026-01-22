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
    private readonly ILogger<ContractsController> _logger;

    public ContractsController(BomilactDbContext context, ILogger<ContractsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContractDto>>> GetAll()
    {
        try
        {
            _logger.LogInformation("Fetching all contracts");
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

            _logger.LogInformation("Successfully fetched {Count} contracts", dtos.Count());
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching contracts");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ContractDto>> GetById(int id)
    {
        try
        {
            _logger.LogInformation("Fetching contract with ID {ContractId}", id);
            var contract = await _context.Contracts
                .Include(c => c.Partner)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (contract == null)
            {
                _logger.LogWarning("Contract with ID {ContractId} not found", id);
                return NotFound();
            }

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

            _logger.LogInformation("Successfully fetched contract with ID {ContractId}", id);
            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching contract with ID {ContractId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<ContractDto>> Create(CreateContractDto dto)
    {
        try
        {
            _logger.LogInformation("Creating new contract with number {ContractNumber}", dto.ContractNumber);
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

            _logger.LogInformation("Successfully created contract with ID {ContractId}", contract.Id);
            return CreatedAtAction(nameof(GetById), new { id = contract.Id }, resultDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating contract");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateContractDto dto)
    {
        try
        {
            _logger.LogInformation("Updating contract with ID {ContractId}", id);
            var contract = await _context.Contracts.FindAsync(id);
            if (contract == null)
            {
                _logger.LogWarning("Contract with ID {ContractId} not found for update", id);
                return NotFound();
            }

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

            _logger.LogInformation("Successfully updated contract with ID {ContractId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating contract with ID {ContractId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            _logger.LogInformation("Deleting contract with ID {ContractId}", id);
            var contract = await _context.Contracts.FindAsync(id);
            if (contract == null)
            {
                _logger.LogWarning("Contract with ID {ContractId} not found for deletion", id);
                return NotFound();
            }

            _context.Contracts.Remove(contract);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully deleted contract with ID {ContractId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting contract with ID {ContractId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }
}
