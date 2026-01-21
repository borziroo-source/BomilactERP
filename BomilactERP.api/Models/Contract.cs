namespace BomilactERP.api.Models;

public class Contract : ISoftDeletable
{
    public int Id { get; set; }
    public string ContractNumber { get; set; } = string.Empty;
    public int PartnerId { get; set; }
    public DateTime StartDate { get; set; } = DateTime.UtcNow.Date;
    public DateTime EndDate { get; set; } = DateTime.UtcNow.Date;
    public decimal MilkQuotaLiters { get; set; }
    public decimal BasePricePerLiter { get; set; }
    public ContractStatus Status { get; set; } = ContractStatus.Pending;
    public string? Notes { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public Partner Partner { get; set; } = null!;
}

public enum ContractStatus
{
    Pending,
    Active,
    Expired
}
