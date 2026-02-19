using System.Globalization;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;
using BomilactERP.api.Repositories;
using BomilactERP.api.Data;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PartnersController : ControllerBase
{
    private readonly IRepository<Partner> _repository;
    private readonly BomilactDbContext _context;
    private readonly ILogger<PartnersController> _logger;

    public PartnersController(IRepository<Partner> repository, BomilactDbContext context, ILogger<PartnersController> logger)
    {
        _repository = repository;
        _context = context;
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
                ExploitationCode = p.ExploitationCode,
                ApiaCode = p.ApiaCode,
                Address = p.Address,
                City = p.City,
                PostalCode = p.PostalCode,
                Country = p.Country,
                ContactPerson = p.ContactPerson,
                Email = p.Email,
                Phone = p.Phone,
                Type = (int)p.Type,
                IsActive = p.IsActive,
                SupplierGroupId = p.SupplierGroupId
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

    [HttpGet("paginated")]
    public async Task<ActionResult<PaginatedResponseDto<PartnerDto>>> GetPaginated([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, [FromQuery] string? searchTerm = null, [FromQuery] string? sortBy = "Name", [FromQuery] bool sortDescending = false)
    {
        try
        {
            _logger.LogInformation("Fetching paginated partners - Page: {PageNumber}, Size: {PageSize}, Search: {SearchTerm}", pageNumber, pageSize, searchTerm);
            
            // Validate pagination parameters
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            // Get all partners and filter by search term
            var partners = await _repository.GetAllAsync();
            
            var filteredPartners = partners.AsEnumerable();

            // Apply search filter
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var search = searchTerm.ToLower();
                filteredPartners = filteredPartners.Where(p =>
                    p.Name.ToLower().Contains(search) ||
                    (p.TaxNumber != null && p.TaxNumber.ToLower().Contains(search)) ||
                    (p.City != null && p.City.ToLower().Contains(search)) ||
                    (p.ContactPerson != null && p.ContactPerson.ToLower().Contains(search)) ||
                    (p.Email != null && p.Email.ToLower().Contains(search)) ||
                    (p.Phone != null && p.Phone.ToLower().Contains(search))
                );
            }

            // Apply sorting
            filteredPartners = sortBy switch
            {
                "TaxNumber" => sortDescending 
                    ? filteredPartners.OrderByDescending(p => p.TaxNumber) 
                    : filteredPartners.OrderBy(p => p.TaxNumber),
                "City" => sortDescending 
                    ? filteredPartners.OrderByDescending(p => p.City) 
                    : filteredPartners.OrderBy(p => p.City),
                "Type" => sortDescending 
                    ? filteredPartners.OrderByDescending(p => p.Type) 
                    : filteredPartners.OrderBy(p => p.Type),
                "IsActive" => sortDescending 
                    ? filteredPartners.OrderByDescending(p => p.IsActive) 
                    : filteredPartners.OrderBy(p => p.IsActive),
                _ => sortDescending 
                    ? filteredPartners.OrderByDescending(p => p.Name) 
                    : filteredPartners.OrderBy(p => p.Name)
            };

            var totalCount = filteredPartners.Count();

            // Apply pagination
            var items = filteredPartners
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PartnerDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    TaxNumber = p.TaxNumber,
                    ExploitationCode = p.ExploitationCode,
                    ApiaCode = p.ApiaCode,
                    Address = p.Address,
                    City = p.City,
                    PostalCode = p.PostalCode,
                    Country = p.Country,
                    ContactPerson = p.ContactPerson,
                    Email = p.Email,
                    Phone = p.Phone,
                    Type = (int)p.Type,
                    IsActive = p.IsActive,
                    SupplierGroupId = p.SupplierGroupId
                })
                .ToList();

            var response = new PaginatedResponseDto<PartnerDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            _logger.LogInformation("Successfully fetched paginated partners - Total: {TotalCount}, Returned: {ItemCount}", totalCount, items.Count);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching paginated partners");
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
                ExploitationCode = partner.ExploitationCode,
                ApiaCode = partner.ApiaCode,
                Address = partner.Address,
                City = partner.City,
                PostalCode = partner.PostalCode,
                Country = partner.Country,
                ContactPerson = partner.ContactPerson,
                Email = partner.Email,
                Phone = partner.Phone,
                Type = (int)partner.Type,
                IsActive = partner.IsActive,
                SupplierGroupId = partner.SupplierGroupId
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
                ExploitationCode = dto.ExploitationCode,
                ApiaCode = dto.ApiaCode,
                Address = dto.Address,
                City = dto.City,
                PostalCode = dto.PostalCode,
                Country = dto.Country,
                ContactPerson = dto.ContactPerson,
                Email = dto.Email,
                Phone = dto.Phone,
                Type = (PartnerType)dto.Type,
                SupplierGroupId = dto.SupplierGroupId
            };

            var created = await _repository.CreateAsync(partner);
            var resultDto = new PartnerDto
            {
                Id = created.Id,
                Name = created.Name,
                TaxNumber = created.TaxNumber,
                ExploitationCode = created.ExploitationCode,
                ApiaCode = created.ApiaCode,
                Address = created.Address,
                City = created.City,
                PostalCode = created.PostalCode,
                Country = created.Country,
                ContactPerson = created.ContactPerson,
                Email = created.Email,
                Phone = created.Phone,
                Type = (int)created.Type,
                IsActive = created.IsActive,
                SupplierGroupId = created.SupplierGroupId
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
            partner.ExploitationCode = dto.ExploitationCode;
            partner.ApiaCode = dto.ApiaCode;
            partner.Address = dto.Address;
            partner.City = dto.City;
            partner.PostalCode = dto.PostalCode;
            partner.Country = dto.Country;
            partner.ContactPerson = dto.ContactPerson;
            partner.Email = dto.Email;
            partner.Phone = dto.Phone;
            partner.Type = (PartnerType)dto.Type;
            partner.IsActive = dto.IsActive;
            partner.SupplierGroupId = dto.SupplierGroupId;
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

    [HttpPost("import-suppliers")]
    public async Task<ActionResult<ImportSuppliersResultDto>> ImportSuppliers([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "A feltoltott fajl ures vagy hianyzik." });
        }

        var result = new ImportSuppliersResultDto();

        try
        {
            using var stream = file.OpenReadStream();
            using var workbook = new XLWorkbook(stream);
            var worksheet = workbook.Worksheets.FirstOrDefault();

            if (worksheet == null)
            {
                return BadRequest(new { message = "Nem talalhato munkalap az Excel fajlban." });
            }

            var usedRange = worksheet.RangeUsed();
            if (usedRange == null)
            {
                return BadRequest(new { message = "Nem talalhato adat az Excel fajlban." });
            }

            var existingPartners = await _context.Partners.AsNoTracking().ToListAsync();
            var partnersByTax = new Dictionary<string, Partner>(StringComparer.OrdinalIgnoreCase);
            var partnersByName = new Dictionary<string, Partner>(StringComparer.OrdinalIgnoreCase);

            foreach (var partner in existingPartners)
            {
                if (!string.IsNullOrWhiteSpace(partner.TaxNumber))
                {
                    var taxKey = NormalizeKey(partner.TaxNumber);
                    if (!partnersByTax.ContainsKey(taxKey))
                    {
                        partnersByTax[taxKey] = partner;
                    }
                }

                if (!string.IsNullOrWhiteSpace(partner.Name))
                {
                    var nameKey = NormalizeKey(partner.Name);
                    if (!partnersByName.ContainsKey(nameKey))
                    {
                        partnersByName[nameKey] = partner;
                    }
                }
            }

            var existingContractNumbers = new HashSet<string>(
                await _context.Contracts.AsNoTracking().Select(c => c.ContractNumber).ToListAsync(),
                StringComparer.OrdinalIgnoreCase);

            var newPartners = new List<Partner>();
            var newContracts = new List<Contract>();

            var firstRow = usedRange.FirstRow().RowNumber();
            var lastRow = usedRange.LastRow().RowNumber();

            for (var rowNumber = firstRow + 1; rowNumber <= lastRow; rowNumber++)
            {
                var row = worksheet.Row(rowNumber);

                var name = GetCellString(row, 1);
                var country = GetCellString(row, 2);
                var county = GetCellString(row, 3);
                var taxNumber = GetCellString(row, 4);
                var exploitationCode = GetCellString(row, 5);
                var contractNumber = GetCellString(row, 6);
                var startDateCell = row.Cell(7);
                var endDateCell = row.Cell(8);
                var milkQuotaCell = row.Cell(9);
                var apiaCode = GetCellString(row, 11);

                if (string.IsNullOrWhiteSpace(name) && string.IsNullOrWhiteSpace(contractNumber) && string.IsNullOrWhiteSpace(taxNumber))
                {
                    continue;
                }

                Partner? partner = null;
                if (!string.IsNullOrWhiteSpace(taxNumber))
                {
                    partnersByTax.TryGetValue(NormalizeKey(taxNumber), out partner);
                }

                if (partner == null && !string.IsNullOrWhiteSpace(name))
                {
                    partnersByName.TryGetValue(NormalizeKey(name), out partner);
                }

                if (partner == null)
                {
                    if (string.IsNullOrWhiteSpace(name))
                    {
                        result.Errors.Add(new ImportSuppliersErrorDto
                        {
                            RowNumber = rowNumber,
                            Message = "Hianyzik a partner neve."
                        });
                        continue;
                    }

                    partner = new Partner
                    {
                        Name = name,
                        TaxNumber = string.IsNullOrWhiteSpace(taxNumber) ? null : taxNumber,
                        ExploitationCode = string.IsNullOrWhiteSpace(exploitationCode) ? null : exploitationCode,
                        ApiaCode = string.IsNullOrWhiteSpace(apiaCode) ? null : apiaCode,
                        Country = string.IsNullOrWhiteSpace(country) ? null : country,
                        City = string.IsNullOrWhiteSpace(county) ? null : county,
                        Type = PartnerType.Supplier,
                        IsActive = true
                    };

                    newPartners.Add(partner);
                    result.CreatedPartners++;

                    if (!string.IsNullOrWhiteSpace(taxNumber))
                    {
                        partnersByTax[NormalizeKey(taxNumber)] = partner;
                    }

                    partnersByName[NormalizeKey(name)] = partner;
                }
                else
                {
                    result.SkippedPartners++;
                }

                if (string.IsNullOrWhiteSpace(contractNumber))
                {
                    result.Errors.Add(new ImportSuppliersErrorDto
                    {
                        RowNumber = rowNumber,
                        Message = "Hianyzik a szerzodes szama."
                    });
                    continue;
                }

                if (existingContractNumbers.Contains(contractNumber))
                {
                    result.SkippedContracts++;
                    continue;
                }

                if (!TryParseDate(startDateCell, out var startDate) || !TryParseDate(endDateCell, out var endDate))
                {
                    result.Errors.Add(new ImportSuppliersErrorDto
                    {
                        RowNumber = rowNumber,
                        Message = "Hibas szerzodes datum."
                    });
                    continue;
                }

                if (!TryParseDecimal(milkQuotaCell, out var milkQuota))
                {
                    result.Errors.Add(new ImportSuppliersErrorDto
                    {
                        RowNumber = rowNumber,
                        Message = "Hibas tejmennyiseg a szerzodesben."
                    });
                    continue;
                }

                var status = ResolveStatus(startDate, endDate);
                var contract = new Contract
                {
                    ContractNumber = contractNumber,
                    PartnerId = partner.Id,
                    Partner = newPartners.Contains(partner) ? partner : null!,
                    StartDate = startDate.Date,
                    EndDate = endDate.Date,
                    MilkQuotaLiters = milkQuota,
                    BasePricePerLiter = 0,
                    Status = status
                };

                newContracts.Add(contract);
                existingContractNumbers.Add(contractNumber);
                result.CreatedContracts++;
            }

            if (newPartners.Count > 0)
            {
                _context.Partners.AddRange(newPartners);
            }

            if (newContracts.Count > 0)
            {
                _context.Contracts.AddRange(newContracts);
            }

            if (newPartners.Count > 0 || newContracts.Count > 0)
            {
                await _context.SaveChangesAsync();
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while importing suppliers");
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

    private static string GetCellString(IXLRow row, int column)
    {
        return row.Cell(column).GetString().Trim();
    }

    private static bool TryParseDate(IXLCell cell, out DateTime date)
    {
        if (cell.DataType == XLDataType.DateTime)
        {
            date = cell.GetDateTime().Date;
            return true;
        }

        if (cell.DataType == XLDataType.Number)
        {
            date = DateTime.FromOADate(cell.GetDouble()).Date;
            return true;
        }

        var text = cell.GetString().Trim();
        if (string.IsNullOrWhiteSpace(text))
        {
            date = default;
            return false;
        }

        return DateTime.TryParseExact(text, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out date)
            || DateTime.TryParse(text, new CultureInfo("ro-RO"), DateTimeStyles.None, out date)
            || DateTime.TryParse(text, new CultureInfo("hu-HU"), DateTimeStyles.None, out date);
    }

    private static bool TryParseDecimal(IXLCell cell, out decimal value)
    {
        if (cell.DataType == XLDataType.Number)
        {
            value = (decimal)cell.GetDouble();
            return true;
        }

        var text = cell.GetString().Trim();
        if (string.IsNullOrWhiteSpace(text))
        {
            value = 0;
            return true;
        }

        return decimal.TryParse(text, NumberStyles.Any, CultureInfo.InvariantCulture, out value)
            || decimal.TryParse(text, NumberStyles.Any, new CultureInfo("ro-RO"), out value)
            || decimal.TryParse(text, NumberStyles.Any, new CultureInfo("hu-HU"), out value);
    }

    private static string NormalizeKey(string value)
    {
        return value.Trim().ToUpperInvariant();
    }

    private static ContractStatus ResolveStatus(DateTime startDate, DateTime endDate)
    {
        var today = DateTime.UtcNow.Date;
        if (endDate < today)
        {
            return ContractStatus.Expired;
        }

        if (startDate > today)
        {
            return ContractStatus.Pending;
        }

        return ContractStatus.Active;
    }
}
