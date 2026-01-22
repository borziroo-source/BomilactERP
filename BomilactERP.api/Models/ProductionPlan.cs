namespace BomilactERP.api.Models;

public class ProductionPlan : ISoftDeletable
{
    public int Id { get; set; }
    public string PlanNumber { get; set; } = string.Empty;
    public DateTime PlannedDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public ProductionStatus Status { get; set; } = ProductionStatus.Planned;
    public string? Notes { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<ProductionItem> ProductionItems { get; set; } = new List<ProductionItem>();
}

public class ProductionItem : ISoftDeletable
{
    public int Id { get; set; }
    public int ProductionPlanId { get; set; }
    public int ProductId { get; set; }
    public decimal PlannedQuantity { get; set; }
    public decimal? ActualQuantity { get; set; }
    public string? LotNumber { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Navigation properties
    public ProductionPlan ProductionPlan { get; set; } = null!;
    public Product Product { get; set; } = null!;
}

public enum ProductionStatus
{
    Planned,
    InProgress,
    Completed,
    Cancelled
}
