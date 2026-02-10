namespace BomilactERP.api.DTOs;

public class PartnerDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? TaxNumber { get; set; }
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
