namespace BomilactERP.api.Models;

public class ProductionPlan : ISoftDeletable
{
    public int Id { get; set; }
    public string PlanNumber { get; set; } = string.Empty;

    // Gyártási megrendelés adatok (frontend: ProductionOrder)
    public string ProductName { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public decimal Quantity { get; set; }
    public string Uom { get; set; } = "db";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Line { get; set; } = string.Empty;
    public string? Supervisor { get; set; }
    public int Progress { get; set; } = 0; // 0-100
    public string Priority { get; set; } = "NORMAL"; // NORMAL | HIGH

    public ProductionStatus Status { get; set; } = ProductionStatus.Draft;
    public string? Notes { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
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
    Draft,
    Planned,
    InProgress,
    Completed,
    Cancelled,
    Delayed
}
