namespace BomilactERP.api.Models;

public class VehicleCompartment
{
    public int Id { get; set; }
    public int VehicleId { get; set; }
    public decimal CapacityLiters { get; set; }
    public string? CurrentContent { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Vehicle Vehicle { get; set; } = null!;
}
