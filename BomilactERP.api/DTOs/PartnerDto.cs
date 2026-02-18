namespace BomilactERP.api.DTOs;

public class PartnerDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? TaxNumber { get; set; }
    public string? ExploitationCode { get; set; }
    public string? ApiaCode { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string? ContactPerson { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int Type { get; set; }
    public bool IsActive { get; set; }
    public int? SupplierGroupId { get; set; }
}

public class CreatePartnerDto
{
    public string Name { get; set; } = string.Empty;
    public string? TaxNumber { get; set; }
    public string? ExploitationCode { get; set; }
    public string? ApiaCode { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string? ContactPerson { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int Type { get; set; }
    public int? SupplierGroupId { get; set; }
}

public class UpdatePartnerDto
{
    public string Name { get; set; } = string.Empty;
    public string? TaxNumber { get; set; }
    public string? ExploitationCode { get; set; }
    public string? ApiaCode { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public string? ContactPerson { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int Type { get; set; }
    public bool IsActive { get; set; }
    public int? SupplierGroupId { get; set; }
}

public class ImportSuppliersResultDto
{
    public int CreatedPartners { get; set; }
    public int SkippedPartners { get; set; }
    public int CreatedContracts { get; set; }
    public int SkippedContracts { get; set; }
    public List<ImportSuppliersErrorDto> Errors { get; set; } = new();
}

public class ImportSuppliersErrorDto
{
    public int RowNumber { get; set; }
    public string Message { get; set; } = string.Empty;
}
