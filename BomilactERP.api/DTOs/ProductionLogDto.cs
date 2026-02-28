namespace BomilactERP.api.DTOs;

public class ProductionLogDto
{
    public int Id { get; set; }
    public DateTime Timestamp { get; set; }
    public string BatchNumber { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Step { get; set; } = string.Empty;
    public decimal Temperature { get; set; }
    public decimal Ph { get; set; }
    public string Operator { get; set; } = string.Empty;
    public string Status { get; set; } = "OK";
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateProductionLogDto
{
    public DateTime Timestamp { get; set; }
    public string BatchNumber { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Step { get; set; } = string.Empty;
    public decimal Temperature { get; set; }
    public decimal Ph { get; set; }
    public string Operator { get; set; } = string.Empty;
    public string? Notes { get; set; }
}
