using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;
using BomilactERP.api.Data;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly BomilactDbContext _context;
    private readonly ILogger<InvoicesController> _logger;

    public InvoicesController(BomilactDbContext context, ILogger<InvoicesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetAll()
    {
        try
        {
            _logger.LogInformation("Fetching all invoices");
            var invoices = await _context.Invoices
                .Include(i => i.Partner)
                .ToListAsync();

            var dtos = invoices.Select(i => new InvoiceDto
            {
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                PartnerId = i.PartnerId,
                PartnerName = i.Partner?.Name,
                InvoiceDate = i.InvoiceDate,
                DueDate = i.DueDate,
                TotalAmount = i.TotalAmount,
                PaidAmount = i.PaidAmount,
                Status = (int)i.Status,
                Notes = i.Notes
            });

            _logger.LogInformation("Successfully fetched {Count} invoices", dtos.Count());
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching invoices");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceDto>> GetById(int id)
    {
        try
        {
            _logger.LogInformation("Fetching invoice with ID {InvoiceId}", id);
            var invoice = await _context.Invoices
                .Include(i => i.Partner)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invoice == null)
            {
                _logger.LogWarning("Invoice with ID {InvoiceId} not found", id);
                return NotFound();
            }

            var dto = new InvoiceDto
            {
                Id = invoice.Id,
                InvoiceNumber = invoice.InvoiceNumber,
                PartnerId = invoice.PartnerId,
                PartnerName = invoice.Partner?.Name,
                InvoiceDate = invoice.InvoiceDate,
                DueDate = invoice.DueDate,
                TotalAmount = invoice.TotalAmount,
                PaidAmount = invoice.PaidAmount,
                Status = (int)invoice.Status,
                Notes = invoice.Notes
            };

            _logger.LogInformation("Successfully fetched invoice with ID {InvoiceId}", id);
            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching invoice with ID {InvoiceId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<InvoiceDto>> Create(CreateInvoiceDto dto)
    {
        try
        {
            _logger.LogInformation("Creating new invoice with number {InvoiceNumber}", dto.InvoiceNumber);
            var invoice = new Invoice
            {
                InvoiceNumber = dto.InvoiceNumber,
                PartnerId = dto.PartnerId,
                InvoiceDate = dto.InvoiceDate,
                DueDate = dto.DueDate,
                TotalAmount = dto.TotalAmount,
                Notes = dto.Notes
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            var resultDto = new InvoiceDto
            {
                Id = invoice.Id,
                InvoiceNumber = invoice.InvoiceNumber,
                PartnerId = invoice.PartnerId,
                InvoiceDate = invoice.InvoiceDate,
                DueDate = invoice.DueDate,
                TotalAmount = invoice.TotalAmount,
                PaidAmount = invoice.PaidAmount,
                Status = (int)invoice.Status,
                Notes = invoice.Notes
            };

            _logger.LogInformation("Successfully created invoice with ID {InvoiceId}", invoice.Id);
            return CreatedAtAction(nameof(GetById), new { id = invoice.Id }, resultDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating invoice");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateInvoiceDto dto)
    {
        try
        {
            _logger.LogInformation("Updating invoice with ID {InvoiceId}", id);
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null)
            {
                _logger.LogWarning("Invoice with ID {InvoiceId} not found for update", id);
                return NotFound();
            }

            invoice.InvoiceNumber = dto.InvoiceNumber;
            invoice.PartnerId = dto.PartnerId;
            invoice.InvoiceDate = dto.InvoiceDate;
            invoice.DueDate = dto.DueDate;
            invoice.TotalAmount = dto.TotalAmount;
            invoice.PaidAmount = dto.PaidAmount;
            invoice.Status = (InvoiceStatus)dto.Status;
            invoice.Notes = dto.Notes;
            invoice.UpdatedAt = DateTime.UtcNow;

            _context.Invoices.Update(invoice);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully updated invoice with ID {InvoiceId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating invoice with ID {InvoiceId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            _logger.LogInformation("Deleting invoice with ID {InvoiceId}", id);
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null)
            {
                _logger.LogWarning("Invoice with ID {InvoiceId} not found for deletion", id);
                return NotFound();
            }

            _context.Invoices.Remove(invoice);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully deleted invoice with ID {InvoiceId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting invoice with ID {InvoiceId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }
}
