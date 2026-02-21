namespace BomilactERP.api.Models;

public class MilkCollectionEntry : ISoftDeletable
{
    public int Id { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public int PartnerId { get; set; }
    public Partner Partner { get; set; } = null!;

    public int? VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }
    public string VehiclePlate { get; set; } = string.Empty;

    public decimal QuantityLiters { get; set; }
    public decimal FatPercentage { get; set; }
    public decimal ProteinPercentage { get; set; }
    public decimal TemperatureC { get; set; }
    public decimal Ph { get; set; }
    public AntibioticTestResult AntibioticTest { get; set; } = AntibioticTestResult.Negative;
    public string SampleId { get; set; } = string.Empty;
    public MilkCollectionStatus Status { get; set; } = MilkCollectionStatus.Pending;
    public string InspectorName { get; set; } = string.Empty;
    public string? Notes { get; set; }

    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public enum AntibioticTestResult
{
    Negative,
    Positive
}

public enum MilkCollectionStatus
{
    Pending,
    Approved,
    Rejected
}
