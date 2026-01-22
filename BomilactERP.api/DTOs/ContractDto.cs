namespace BomilactERP.api.DTOs;

public class ContractDto
{
    public int Id { get; set; }
    public string ContractNumber { get; set; } = string.Empty;
    public int PartnerId { get; set; }
    public string? PartnerName { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MilkQuotaLiters { get; set; }
    public decimal BasePricePerLiter { get; set; }
    public int Status { get; set; }
    public string? Notes { get; set; }
}

public class CreateContractDto
{
    public string ContractNumber { get; set; } = string.Empty;
    public int PartnerId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MilkQuotaLiters { get; set; }
    public decimal BasePricePerLiter { get; set; }
    public int Status { get; set; }
    public string? Notes { get; set; }
}

public class UpdateContractDto
{
    public string ContractNumber { get; set; } = string.Empty;
    public int PartnerId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MilkQuotaLiters { get; set; }
    public decimal BasePricePerLiter { get; set; }
    public int Status { get; set; }
    public string? Notes { get; set; }
}
