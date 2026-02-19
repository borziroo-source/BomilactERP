using ClosedXML.Excel;
using BomilactERP.api.Data;
using BomilactERP.api.Models;
using Microsoft.EntityFrameworkCore;

namespace BomilactERP.api.Services;

public class SupplierGroupImportService
{
    private readonly BomilactDbContext _context;
    private readonly ILogger<SupplierGroupImportService> _logger;

    public SupplierGroupImportService(BomilactDbContext context, ILogger<SupplierGroupImportService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ImportResult> ImportSupplierGroupsFromExcelAsync(Stream excelStream)
    {
        var result = new ImportResult();

        try
        {
            using (var workbook = new XLWorkbook(excelStream))
            {
                var sheets = workbook.Worksheets;
                _logger.LogInformation("Starting import from Excel with {SheetCount} sheets", sheets.Count);

                foreach (var worksheet in sheets)
                {
                    // Skip the "total" sheet
                    if (worksheet.Name.Equals("total", StringComparison.OrdinalIgnoreCase))
                    {
                        _logger.LogInformation("Skipping 'total' sheet");
                        continue;
                    }

                    _logger.LogInformation("Processing sheet: {SheetName}", worksheet.Name);
                    await ProcessSheetAsync(worksheet, result);
                }

                // Save all changes to database
                await _context.SaveChangesAsync();
                result.Success = true;
                result.Message = "Import completed successfully";
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during Excel import");
            result.Success = false;
            result.Message = $"Import failed: {ex.Message}";
            result.Errors.Add(ex.Message);
        }

        return result;
    }

    private async Task ProcessSheetAsync(IXLWorksheet worksheet, ImportResult result)
    {
        var groupName = worksheet.Name;
        
        try
        {
            // Get or create supplier group
            var supplierGroup = await _context.SupplierGroups
                .FirstOrDefaultAsync(sg => sg.Name == groupName);

            if (supplierGroup == null)
            {
                supplierGroup = new SupplierGroup
                {
                    Name = groupName,
                    Color = "#808080" // Default gray color
                };
                _context.SupplierGroups.Add(supplierGroup);
                await _context.SaveChangesAsync();
                result.GroupsCreated++;
                _logger.LogInformation("Created new supplier group: {GroupName} (ID: {GroupId})", groupName, supplierGroup.Id);
            }
            else
            {
                result.GroupsUpdated++;
                _logger.LogInformation("Using existing supplier group: {GroupName} (ID: {GroupId})", groupName, supplierGroup.Id);
            }

            // Process suppliers starting from row 6
            const int startRow = 6;
            int currentRow = startRow;
            int rowsProcessed = 0;

            var lastRowUsed = worksheet.LastRowUsed();
            if (lastRowUsed == null)
            {
                _logger.LogInformation("Sheet '{SheetName}' has no data rows", groupName);
                return;
            }

            int maxRow = lastRowUsed.RowNumber();

            while (currentRow <= maxRow)
            {
                var row = worksheet.Row(currentRow);
                
                // Check if the row is empty (all relevant cells are empty)
                var nameCell = row.Cell(2); // Column B
                var taxNumberCell = row.Cell(3); // Column C
                var exploitationCodeCell = row.Cell(4); // Column D

                var nameValue = nameCell.IsEmpty() ? "" : nameCell.Value.ToString().Trim();
                if (string.IsNullOrWhiteSpace(nameValue))
                {
                    currentRow++;
                    continue;
                }

                try
                {
                    string? taxNumber = taxNumberCell.IsEmpty() ? null : taxNumberCell.Value.ToString().Trim();
                    string? exploitationCode = exploitationCodeCell.IsEmpty() ? null : exploitationCodeCell.Value.ToString().Trim();

                    // Skip rows with empty names
                    if (string.IsNullOrWhiteSpace(nameValue))
                    {
                        currentRow++;
                        continue;
                    }

                    // Try to find existing partner by tax number
                    Partner? partner = null;
                    
                    if (!string.IsNullOrWhiteSpace(taxNumber))
                    {
                        partner = await _context.Partners
                            .FirstOrDefaultAsync(p => p.TaxNumber == taxNumber);
                    }

                    if (partner == null)
                    {
                        // Create new partner
                        partner = new Partner
                        {
                            Name = nameValue,
                            TaxNumber = string.IsNullOrWhiteSpace(taxNumber) ? null : taxNumber,
                            ExploitationCode = string.IsNullOrWhiteSpace(exploitationCode) ? null : exploitationCode,
                            Type = PartnerType.Supplier,
                            IsActive = true
                        };
                        _context.Partners.Add(partner);
                        await _context.SaveChangesAsync();
                        result.SuppliersCreated++;
                        _logger.LogInformation("Created new supplier: {Name} (CNP/UI: {TaxNumber})", nameValue, taxNumber);
                    }
                    else
                    {
                        // Update existing partner if needed
                        var updated = false;
                        if (partner.Type != PartnerType.Supplier && partner.Type != PartnerType.Both)
                        {
                            partner.Type = PartnerType.Both;
                            updated = true;
                        }
                        
                        if (!string.IsNullOrWhiteSpace(exploitationCode) && partner.ExploitationCode != exploitationCode)
                        {
                            partner.ExploitationCode = exploitationCode;
                            updated = true;
                        }

                        if (updated)
                        {
                            partner.UpdatedAt = DateTime.UtcNow;
                            await _context.SaveChangesAsync();
                        }

                        result.SuppliersUpdated++;
                        _logger.LogInformation("Using existing supplier: {Name} (CNP/UI: {TaxNumber})", nameValue, taxNumber);
                    }

                    // Associate with supplier group if not already
                    if (partner.SupplierGroupId != supplierGroup.Id)
                    {
                        partner.SupplierGroupId = supplierGroup.Id;
                        partner.UpdatedAt = DateTime.UtcNow;
                        await _context.SaveChangesAsync();
                        result.AssociationsCreated++;
                        _logger.LogInformation("Associated supplier {Name} with group {GroupName}", nameValue, groupName);
                    }

                    rowsProcessed++;
                }
                catch (Exception ex)
                {
                    var errorMsg = $"Error processing row {currentRow} in sheet '{groupName}': {ex.Message}";
                    _logger.LogError(ex, errorMsg);
                    result.Errors.Add(errorMsg);
                }

                currentRow++;
            }

            _logger.LogInformation("Processed {RowCount} supplier rows from sheet {SheetName}", rowsProcessed, groupName);
        }
        catch (Exception ex)
        {
            var errorMsg = $"Error processing sheet '{groupName}': {ex.Message}";
            _logger.LogError(ex, errorMsg);
            result.Errors.Add(errorMsg);
        }
    }
}

public class ImportResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int GroupsCreated { get; set; }
    public int GroupsUpdated { get; set; }
    public int SuppliersCreated { get; set; }
    public int SuppliersUpdated { get; set; }
    public int AssociationsCreated { get; set; }
    public List<string> Errors { get; set; } = new List<string>();
}
