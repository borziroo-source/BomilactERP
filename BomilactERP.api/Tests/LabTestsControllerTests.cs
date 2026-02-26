using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using BomilactERP.api.Controllers;
using BomilactERP.api.Data;
using BomilactERP.api.DTOs;
using BomilactERP.api.Models;
using Xunit;

namespace BomilactERP.Tests;

public class LabTestsControllerTests : IDisposable
{
    private readonly BomilactDbContext _context;
    private readonly LabTestsController _controller;

    public LabTestsControllerTests()
    {
        var options = new DbContextOptionsBuilder<BomilactDbContext>()
            .UseInMemoryDatabase($"LabTestsDb_{Guid.NewGuid()}")
            .Options;
        _context = new BomilactDbContext(options);
        _controller = new LabTestsController(_context, NullLogger<LabTestsController>.Instance);
    }

    public void Dispose() => _context.Dispose();

    // --- GetAll ---

    [Fact]
    public async Task GetAll_ReturnsPagedResult()
    {
        _context.LabTests.Add(new LabTest { SampleId = "SMP-001", SourceName = "Test Farmer", Type = LabSampleType.RawMilk, Inspector = "Tester", Date = DateTime.UtcNow });
        _context.LabTests.Add(new LabTest { SampleId = "SMP-002", SourceName = "Other Farm", Type = LabSampleType.Wip, Inspector = "Tester2", Date = DateTime.UtcNow });
        await _context.SaveChangesAsync();

        var result = await _controller.GetAll();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var paged = Assert.IsType<PagedResult<LabTestDto>>(okResult.Value);
        Assert.Equal(2, paged.TotalCount);
        Assert.Equal(2, paged.Items.Count());
    }

    [Fact]
    public async Task GetAll_FilterByType_ReturnsMatchingItems()
    {
        _context.LabTests.Add(new LabTest { SampleId = "SMP-003", SourceName = "Farm A", Type = LabSampleType.RawMilk, Inspector = "T", Date = DateTime.UtcNow });
        _context.LabTests.Add(new LabTest { SampleId = "SMP-004", SourceName = "Batch B", Type = LabSampleType.Wip, Inspector = "T", Date = DateTime.UtcNow });
        await _context.SaveChangesAsync();

        var result = await _controller.GetAll(type: "RAW_MILK");

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var paged = Assert.IsType<PagedResult<LabTestDto>>(okResult.Value);
        Assert.Equal(1, paged.TotalCount);
        Assert.All(paged.Items, item => Assert.Equal("RAW_MILK", item.Type));
    }

    [Fact]
    public async Task GetAll_FilterBySearchTerm_ReturnsMatchingItems()
    {
        _context.LabTests.Add(new LabTest { SampleId = "SMP-005", SourceName = "Agro Lacto", Type = LabSampleType.RawMilk, Inspector = "T", Date = DateTime.UtcNow });
        _context.LabTests.Add(new LabTest { SampleId = "SMP-006", SourceName = "Other Farm", Type = LabSampleType.RawMilk, Inspector = "T", Date = DateTime.UtcNow });
        await _context.SaveChangesAsync();

        var result = await _controller.GetAll(searchTerm: "Agro");

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var paged = Assert.IsType<PagedResult<LabTestDto>>(okResult.Value);
        Assert.Equal(1, paged.TotalCount);
    }

    [Fact]
    public async Task GetAll_FilterByDateRange_ReturnsMatchingItems()
    {
        var yesterday = DateTime.UtcNow.AddDays(-1);
        var today = DateTime.UtcNow.Date;

        _context.LabTests.Add(new LabTest { SampleId = "SMP-007", SourceName = "Farm X", Type = LabSampleType.RawMilk, Inspector = "T", Date = yesterday });
        _context.LabTests.Add(new LabTest { SampleId = "SMP-008", SourceName = "Farm Y", Type = LabSampleType.RawMilk, Inspector = "T", Date = today });
        await _context.SaveChangesAsync();

        var result = await _controller.GetAll(dateFrom: today.ToString("O"), dateTo: today.AddDays(1).ToString("O"));

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var paged = Assert.IsType<PagedResult<LabTestDto>>(okResult.Value);
        Assert.Equal(1, paged.TotalCount);
    }

    [Fact]
    public async Task GetAll_PaginationWorks()
    {
        for (int i = 1; i <= 25; i++)
        {
            _context.LabTests.Add(new LabTest
            {
                SampleId = $"SMP-P{i:D3}",
                SourceName = $"Farm {i}",
                Type = LabSampleType.RawMilk,
                Inspector = "T",
                Date = DateTime.UtcNow.AddMinutes(-i)
            });
        }
        await _context.SaveChangesAsync();

        var page1 = await _controller.GetAll(page: 1, pageSize: 10);
        var ok1 = Assert.IsType<OkObjectResult>(page1.Result);
        var paged1 = Assert.IsType<PagedResult<LabTestDto>>(ok1.Value);
        Assert.Equal(25, paged1.TotalCount);
        Assert.Equal(10, paged1.Items.Count());
        Assert.Equal(3, paged1.TotalPages);
    }

    // --- GetById ---

    [Fact]
    public async Task GetById_ExistingId_ReturnsTest()
    {
        var test = new LabTest { SampleId = "SMP-010", SourceName = "Farm A", Type = LabSampleType.RawMilk, Inspector = "T", Date = DateTime.UtcNow };
        _context.LabTests.Add(test);
        await _context.SaveChangesAsync();

        var result = await _controller.GetById(test.Id);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<LabTestDto>(okResult.Value);
        Assert.Equal("SMP-010", dto.SampleId);
    }

    [Fact]
    public async Task GetById_NonExistingId_ReturnsNotFound()
    {
        var result = await _controller.GetById(9999);
        Assert.IsType<NotFoundResult>(result.Result);
    }

    // --- Create with auto-result logic ---

    [Fact]
    public async Task Create_AntibioticPositive_ResultIsFail()
    {
        var dto = new CreateLabTestDto
        {
            SampleId = "SMP-020",
            Date = DateTime.UtcNow.ToString("O"),
            SourceName = "Farm A",
            Type = "RAW_MILK",
            Antibiotic = "POSITIVE",
            Inspector = "T"
        };

        var result = await _controller.Create(dto);

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var labDto = Assert.IsType<LabTestDto>(created.Value);
        Assert.Equal("FAIL", labDto.Result);
    }

    [Fact]
    public async Task Create_WaterAdded_ResultIsFail()
    {
        var dto = new CreateLabTestDto
        {
            SampleId = "SMP-021",
            Date = DateTime.UtcNow.ToString("O"),
            SourceName = "Farm B",
            Type = "RAW_MILK",
            Water = 5.0m,
            Antibiotic = "NEGATIVE",
            Inspector = "T"
        };

        var result = await _controller.Create(dto);

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var labDto = Assert.IsType<LabTestDto>(created.Value);
        Assert.Equal("FAIL", labDto.Result);
    }

    [Fact]
    public async Task Create_LowDensityRawMilk_ResultIsWarning()
    {
        var dto = new CreateLabTestDto
        {
            SampleId = "SMP-022",
            Date = DateTime.UtcNow.ToString("O"),
            SourceName = "Farm C",
            Type = "RAW_MILK",
            Density = 1.020m,
            Water = 0,
            Antibiotic = "NEGATIVE",
            Inspector = "T"
        };

        var result = await _controller.Create(dto);

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var labDto = Assert.IsType<LabTestDto>(created.Value);
        Assert.Equal("WARNING", labDto.Result);
    }

    [Fact]
    public async Task Create_LowPhRawMilk_ResultIsFail()
    {
        var dto = new CreateLabTestDto
        {
            SampleId = "SMP-023",
            Date = DateTime.UtcNow.ToString("O"),
            SourceName = "Farm D",
            Type = "RAW_MILK",
            Ph = 5.5m,
            Water = 0,
            Antibiotic = "NEGATIVE",
            Inspector = "T"
        };

        var result = await _controller.Create(dto);

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var labDto = Assert.IsType<LabTestDto>(created.Value);
        Assert.Equal("FAIL", labDto.Result);
    }

    [Fact]
    public async Task Create_GoodParameters_ResultIsPass()
    {
        var dto = new CreateLabTestDto
        {
            SampleId = "SMP-024",
            Date = DateTime.UtcNow.ToString("O"),
            SourceName = "Good Farm",
            Type = "RAW_MILK",
            Fat = 3.8m,
            Protein = 3.2m,
            Ph = 6.7m,
            Density = 1.030m,
            Water = 0,
            Antibiotic = "NEGATIVE",
            Inspector = "T"
        };

        var result = await _controller.Create(dto);

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var labDto = Assert.IsType<LabTestDto>(created.Value);
        Assert.Equal("PASS", labDto.Result);
    }

    // --- Update ---

    [Fact]
    public async Task Update_ExistingTest_ReturnsNoContent()
    {
        var test = new LabTest { SampleId = "SMP-030", SourceName = "Farm X", Type = LabSampleType.RawMilk, Inspector = "T", Date = DateTime.UtcNow };
        _context.LabTests.Add(test);
        await _context.SaveChangesAsync();

        var dto = new UpdateLabTestDto
        {
            SampleId = "SMP-030",
            Date = DateTime.UtcNow.ToString("O"),
            SourceName = "Farm X Updated",
            Type = "RAW_MILK",
            Antibiotic = "NEGATIVE",
            Water = 0,
            Inspector = "T Updated"
        };

        var result = await _controller.Update(test.Id, dto);

        Assert.IsType<NoContentResult>(result);
        var updated = await _context.LabTests.FindAsync(test.Id);
        Assert.Equal("Farm X Updated", updated!.SourceName);
    }

    [Fact]
    public async Task Update_NonExistingTest_ReturnsNotFound()
    {
        var dto = new UpdateLabTestDto { SampleId = "X", Date = DateTime.UtcNow.ToString("O"), SourceName = "Y", Type = "RAW_MILK", Inspector = "T" };
        var result = await _controller.Update(9999, dto);
        Assert.IsType<NotFoundResult>(result);
    }

    // --- Delete (soft delete) ---

    [Fact]
    public async Task Delete_ExistingTest_SoftDeletes()
    {
        var test = new LabTest { SampleId = "SMP-040", SourceName = "Farm Z", Type = LabSampleType.RawMilk, Inspector = "T", Date = DateTime.UtcNow };
        _context.LabTests.Add(test);
        await _context.SaveChangesAsync();

        var result = await _controller.Delete(test.Id);

        Assert.IsType<NoContentResult>(result);
        // Bypass global query filter to verify soft delete
        var deleted = await _context.LabTests.IgnoreQueryFilters().FirstOrDefaultAsync(e => e.Id == test.Id);
        Assert.NotNull(deleted);
        Assert.True(deleted!.IsDeleted);
    }

    [Fact]
    public async Task Delete_NonExistingTest_ReturnsNotFound()
    {
        var result = await _controller.Delete(9999);
        Assert.IsType<NotFoundResult>(result);
    }
}
