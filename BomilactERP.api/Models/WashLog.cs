namespace BomilactERP.api.Models;

public class WashLog : ISoftDeletable
{
    public int Id { get; set; }
    public int VehicleId { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string PerformedBy { get; set; } = string.Empty;
    public string Chemicals { get; set; } = string.Empty;
    public int Temperature { get; set; }

    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public Vehicle Vehicle { get; set; } = null!;
}
