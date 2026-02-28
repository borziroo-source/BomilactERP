namespace BomilactERP.api.DTOs;

public class ProductionPlanDto
{
    public int Id { get; set; }
    public string PlanNumber { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public decimal Quantity { get; set; }
    public string Uom { get; set; } = "db";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Line { get; set; } = string.Empty;
    public string? Supervisor { get; set; }
    public int Progress { get; set; }
    public string Priority { get; set; } = "NORMAL";
    public string Status { get; set; } = "DRAFT";
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateProductionPlanDto
{
    public string PlanNumber { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public decimal Quantity { get; set; }
    public string Uom { get; set; } = "db";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Line { get; set; } = string.Empty;
    public string? Supervisor { get; set; }
    public string Priority { get; set; } = "NORMAL";
    public string? Notes { get; set; }
}

public class UpdateProductionPlanDto
{
    public string PlanNumber { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public decimal Quantity { get; set; }
    public string Uom { get; set; } = "db";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Line { get; set; } = string.Empty;
    public string? Supervisor { get; set; }
    public int Progress { get; set; }
    public string Priority { get; set; } = "NORMAL";
    public string Status { get; set; } = "DRAFT";
    public string? Notes { get; set; }
}
