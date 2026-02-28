namespace BomilactERP.api.DTOs;

public class ProductionStepDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public int ElapsedMinutes { get; set; }
    public string StepType { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}

public class ProductionBatchDto
{
    public int Id { get; set; }
    public string LineId { get; set; } = string.Empty;
    public string LineName { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string BatchNumber { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Uom { get; set; } = "l";
    public DateTime StartTime { get; set; }
    public int CurrentStepIndex { get; set; }
    public string Status { get; set; } = "RUNNING";
    public decimal CurrentTemp { get; set; }
    public decimal TargetTemp { get; set; }
    public decimal CurrentPh { get; set; }
    public int AgitatorRpm { get; set; }
    public List<ProductionStepDto> Steps { get; set; } = new();
    public List<string> Alerts { get; set; } = new();
}

public class ProductionStepInputDto
{
    public string Name { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public string StepType { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}

public class CreateProductionBatchDto
{
    public string LineId { get; set; } = string.Empty;
    public string LineName { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string BatchNumber { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Uom { get; set; } = "l";
    public decimal TargetTemp { get; set; }
    public List<ProductionStepInputDto> Steps { get; set; } = new();
}

public class UpdateBatchStepDto
{
    // NEXT | PREV | PAUSE | COMPLETE
    public string Action { get; set; } = "NEXT";
    public int? ElapsedMinutes { get; set; }
}

public class LogBatchParamsDto
{
    public decimal Temperature { get; set; }
    public decimal Ph { get; set; }
    public int AgitatorRpm { get; set; }
    public string? Note { get; set; }
}
