namespace BomilactERP.api.Models;

public class ProductionBatch : ISoftDeletable
{
    public int Id { get; set; }
    public string LineId { get; set; } = string.Empty;
    public string LineName { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string BatchNumber { get; set; } = string.Empty; // LOT szám
    public decimal Quantity { get; set; }
    public string Uom { get; set; } = "l";
    public DateTime StartTime { get; set; } = DateTime.UtcNow;

    // Workflow
    public int CurrentStepIndex { get; set; } = 0;
    public string Status { get; set; } = "RUNNING"; // RUNNING | PAUSED | ISSUE | COMPLETED

    // Valós idejű paraméterek
    public decimal CurrentTemp { get; set; }
    public decimal TargetTemp { get; set; }
    public decimal CurrentPh { get; set; }
    public int AgitatorRpm { get; set; }

    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<ProductionStep> Steps { get; set; } = new List<ProductionStep>();
    public ICollection<ProductionBatchAlert> Alerts { get; set; } = new List<ProductionBatchAlert>();
}

public class ProductionStep : ISoftDeletable
{
    public int Id { get; set; }
    public int ProductionBatchId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public int ElapsedMinutes { get; set; } = 0;
    public string StepType { get; set; } = string.Empty; // HEATING | MIXING | RESTING | COOLING | CUTTING | DRAINING
    public int SortOrder { get; set; }
    public bool IsDeleted { get; set; } = false;

    // Navigation
    public ProductionBatch ProductionBatch { get; set; } = null!;
}

public class ProductionBatchAlert : ISoftDeletable
{
    public int Id { get; set; }
    public int ProductionBatchId { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ProductionBatch ProductionBatch { get; set; } = null!;
}
