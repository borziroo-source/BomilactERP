namespace BomilactERP.api.Models;

public class ProductionLog : ISoftDeletable
{
    public int Id { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string BatchNumber { get; set; } = string.Empty; // LOT szám
    public string ProductName { get; set; } = string.Empty;
    public string Step { get; set; } = string.Empty; // Technológiai lépés / CCP
    public decimal Temperature { get; set; }
    public decimal Ph { get; set; }
    public string Operator { get; set; } = string.Empty;
    public string Status { get; set; } = "OK"; // OK | WARNING | CRITICAL
    public string? Notes { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
