namespace BomilactERP.api.DTOs;

public class ProductionPlanDto
{
    public int Id { get; set; }
    public string PlanNumber { get; set; } = string.Empty;
    public DateTime PlannedDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public int Status { get; set; }
    public string? Notes { get; set; }
}

public class CreateProductionPlanDto
{
    public string PlanNumber { get; set; } = string.Empty;
    public DateTime PlannedDate { get; set; }
    public string? Notes { get; set; }
}

public class UpdateProductionPlanDto
{
    public string PlanNumber { get; set; } = string.Empty;
    public DateTime PlannedDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public int Status { get; set; }
    public string? Notes { get; set; }
}
