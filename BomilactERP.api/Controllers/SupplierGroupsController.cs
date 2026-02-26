using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;
using BomilactERP.api.Repositories;
using BomilactERP.api.Data;
using BomilactERP.api.Services;

namespace BomilactERP.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SupplierGroupsController : ControllerBase
{
    private readonly IRepository<SupplierGroup> _repository;
    private readonly BomilactDbContext _context;
    private readonly ILogger<SupplierGroupsController> _logger;
    private readonly SupplierGroupImportService _importService;

    public SupplierGroupsController(
        IRepository<SupplierGroup> repository,
        BomilactDbContext context,
        ILogger<SupplierGroupsController> logger,
        SupplierGroupImportService importService)
    {
        _repository = repository;
        _context = context;
        _logger = logger;
        _importService = importService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SupplierGroupDto>>> GetAll()
    {
        try
        {
            _logger.LogInformation("Fetching all supplier groups");
            var groups = await _repository.GetAllAsync();
            var dtos = groups.Select(g => new SupplierGroupDto
            {
                Id = g.Id,
                Name = g.Name,
                Color = g.Color,
                MemberCount = _context.Partners.Count(p => p.SupplierGroupId == g.Id)
            });
            _logger.LogInformation("Successfully fetched {Count} supplier groups", dtos.Count());
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching supplier groups");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpGet("paginated/list")]
    public async Task<ActionResult<PaginatedResponseDto<SupplierGroupDto>>> GetPaginated([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, [FromQuery] string? searchTerm = null, [FromQuery] string? sortBy = "Name", [FromQuery] bool sortDescending = false)
    {
        try
        {
            _logger.LogInformation("Fetching paginated supplier groups - Page: {PageNumber}, Size: {PageSize}, Search: {SearchTerm}", pageNumber, pageSize, searchTerm);
            
            // Validate pagination parameters
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            // Get all groups with member counts
            var groups = await _repository.GetAllAsync();
            
            var groupsWithCounts = groups.Select(g => new
            {
                Group = g,
                MemberCount = _context.Partners.Count(p => p.SupplierGroupId == g.Id)
            }).AsEnumerable();

            // Apply search filter
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var search = searchTerm.ToLower();
                groupsWithCounts = groupsWithCounts.Where(x =>
                    x.Group.Name.ToLower().Contains(search) ||
                    x.Group.Color.ToLower().Contains(search)
                );
            }

            // Apply sorting
            groupsWithCounts = sortBy switch
            {
                "Color" => sortDescending 
                    ? groupsWithCounts.OrderByDescending(x => x.Group.Color) 
                    : groupsWithCounts.OrderBy(x => x.Group.Color),
                "MemberCount" => sortDescending 
                    ? groupsWithCounts.OrderByDescending(x => x.MemberCount) 
                    : groupsWithCounts.OrderBy(x => x.MemberCount),
                _ => sortDescending 
                    ? groupsWithCounts.OrderByDescending(x => x.Group.Name) 
                    : groupsWithCounts.OrderBy(x => x.Group.Name)
            };

            var totalCount = groupsWithCounts.Count();

            // Apply pagination
            var items = groupsWithCounts
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new SupplierGroupDto
                {
                    Id = x.Group.Id,
                    Name = x.Group.Name,
                    Color = x.Group.Color,
                    MemberCount = x.MemberCount
                })
                .ToList();

            var response = new PaginatedResponseDto<SupplierGroupDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            _logger.LogInformation("Successfully fetched paginated supplier groups - Total: {TotalCount}, Returned: {ItemCount}", totalCount, items.Count);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching paginated supplier groups");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SupplierGroupDto>> GetById(int id)
    {
        try
        {
            _logger.LogInformation("Fetching supplier group with ID {GroupId}", id);
            var group = await _repository.GetByIdAsync(id);
            if (group == null)
            {
                _logger.LogWarning("Supplier group with ID {GroupId} not found", id);
                return NotFound();
            }

            var memberCount = await _context.Partners.CountAsync(p => p.SupplierGroupId == id);
            var dto = new SupplierGroupDto
            {
                Id = group.Id,
                Name = group.Name,
                Color = group.Color,
                MemberCount = memberCount
            };
            _logger.LogInformation("Successfully fetched supplier group with ID {GroupId}", id);
            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching supplier group with ID {GroupId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<SupplierGroupDto>> Create(CreateSupplierGroupDto dto)
    {
        try
        {
            _logger.LogInformation("Creating new supplier group: {GroupName}", dto.Name);
            var group = new SupplierGroup
            {
                Name = dto.Name,
                Color = dto.Color
            };

            var created = await _repository.CreateAsync(group);
            var resultDto = new SupplierGroupDto
            {
                Id = created.Id,
                Name = created.Name,
                Color = created.Color,
                MemberCount = 0
            };

            _logger.LogInformation("Successfully created supplier group with ID {GroupId}", created.Id);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, resultDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating supplier group");
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateSupplierGroupDto dto)
    {
        try
        {
            _logger.LogInformation("Updating supplier group with ID {GroupId}", id);
            var group = await _repository.GetByIdAsync(id);
            if (group == null)
            {
                _logger.LogWarning("Supplier group with ID {GroupId} not found for update", id);
                return NotFound();
            }

            group.Name = dto.Name;
            group.Color = dto.Color;
            group.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(group);
            _logger.LogInformation("Successfully updated supplier group with ID {GroupId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating supplier group with ID {GroupId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            _logger.LogInformation("Attempting to delete supplier group with ID {GroupId}", id);
            
            // Check if the group is in use by any partners
            var partnersUsingGroup = await _context.Partners
                .Where(p => p.SupplierGroupId == id)
                .CountAsync();

            if (partnersUsingGroup > 0)
            {
                _logger.LogWarning("Cannot delete supplier group with ID {GroupId} - it is used by {Count} partners", id, partnersUsingGroup);
                return BadRequest(new { 
                    message = "A csoport nem törölhető, mert használatban van.",
                    partnersCount = partnersUsingGroup
                });
            }

            var success = await _repository.DeleteAsync(id);
            if (!success)
            {
                _logger.LogWarning("Supplier group with ID {GroupId} not found for deletion", id);
                return NotFound();
            }

            _logger.LogInformation("Successfully deleted supplier group with ID {GroupId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting supplier group with ID {GroupId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpGet("{id}/members")]
    public async Task<ActionResult<IEnumerable<PartnerDto>>> GetMembers(int id)
    {
        try
        {
            _logger.LogInformation("Fetching members for supplier group ID {GroupId}", id);

            var groupExists = await _repository.GetByIdAsync(id);
            if (groupExists == null)
            {
                _logger.LogWarning("Supplier group with ID {GroupId} not found for members", id);
                return NotFound();
            }

            var members = await _context.Partners
                .Where(p => p.SupplierGroupId == id)
                .ToListAsync();

            var dtos = members.Select(p => new PartnerDto
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
                IsActive = p.IsActive,
                SupplierGroupId = p.SupplierGroupId
            });

            _logger.LogInformation("Successfully fetched {Count} members for supplier group ID {GroupId}", dtos.Count(), id);
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching members for supplier group ID {GroupId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPost("{id}/members")]
    public async Task<IActionResult> AddMember(int id, UpdateSupplierGroupMemberDto dto)
    {
        try
        {
            _logger.LogInformation("Adding partner ID {PartnerId} to supplier group ID {GroupId}", dto.PartnerId, id);

            var groupExists = await _repository.GetByIdAsync(id);
            if (groupExists == null)
            {
                _logger.LogWarning("Supplier group with ID {GroupId} not found for adding member", id);
                return NotFound();
            }

            var partner = await _context.Partners.FirstOrDefaultAsync(p => p.Id == dto.PartnerId);
            if (partner == null)
            {
                _logger.LogWarning("Partner with ID {PartnerId} not found for adding to group", dto.PartnerId);
                return NotFound();
            }

            partner.SupplierGroupId = id;
            partner.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while adding partner to supplier group ID {GroupId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpDelete("{id}/members/{partnerId}")]
    public async Task<IActionResult> RemoveMember(int id, int partnerId)
    {
        try
        {
            _logger.LogInformation("Removing partner ID {PartnerId} from supplier group ID {GroupId}", partnerId, id);

            var partner = await _context.Partners.FirstOrDefaultAsync(p => p.Id == partnerId);
            if (partner == null)
            {
                _logger.LogWarning("Partner with ID {PartnerId} not found for removal", partnerId);
                return NotFound();
            }

            if (partner.SupplierGroupId != id)
            {
                _logger.LogWarning("Partner ID {PartnerId} is not in supplier group ID {GroupId}", partnerId, id);
                return BadRequest(new { message = "A beszallito nem ehhez a csoporthoz tartozik." });
            }

            partner.SupplierGroupId = null;
            partner.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while removing partner from supplier group ID {GroupId}", id);
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }

    [HttpPost("import")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ImportResult>> ImportFromExcel(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                _logger.LogWarning("Import attempted with no file");
                return BadRequest(new { message = "Kérjük, töltse fel az Excel fájlt." });
            }

            if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase) &&
                !file.FileName.EndsWith(".xls", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Import attempted with invalid file type: {FileName}", file.FileName);
                return BadRequest(new { message = "Csak Excel fájlok (.xlsx, .xls) engedélyezék." });
            }

            _logger.LogInformation("Starting import from file: {FileName}", file.FileName);
            
            using (var stream = file.OpenReadStream())
            {
                var result = await _importService.ImportSupplierGroupsFromExcelAsync(stream);
                
                _logger.LogInformation("Import completed. Success: {Success}, Groups Created: {GroupsCreated}, Suppliers Created: {SuppliersCreated}",
                    result.Success, result.GroupsCreated, result.SuppliersCreated);

                return Ok(result);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during import");
            return StatusCode(500, new
            {
                success = false,
                message = "Az importálás során hiba lépett fel",
                errors = new[] { ex.Message }
            });
        }
    }
}
