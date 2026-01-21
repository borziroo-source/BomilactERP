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

    public InvoicesController(BomilactDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetAll()
    {
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

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceDto>> GetById(int id)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Partner)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null)
            return NotFound();

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

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<InvoiceDto>> Create(CreateInvoiceDto dto)
    {
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

        return CreatedAtAction(nameof(GetById), new { id = invoice.Id }, resultDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateInvoiceDto dto)
    {
        var invoice = await _context.Invoices.FindAsync(id);
        if (invoice == null)
            return NotFound();

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

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var invoice = await _context.Invoices.FindAsync(id);
        if (invoice == null)
            return NotFound();

        _context.Invoices.Remove(invoice);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
