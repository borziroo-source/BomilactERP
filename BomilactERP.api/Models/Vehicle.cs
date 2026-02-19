namespace BomilactERP.api.Models;

public class Vehicle : ISoftDeletable
{
    public int Id { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
    public string MakeModel { get; set; } = string.Empty;
    public VehicleType Type { get; set; } = VehicleType.MilkTanker;
    public VehicleStatus Status { get; set; } = VehicleStatus.ReadyToCollect;

    public decimal? TotalCapacityLiters { get; set; }

    public DateTime ItpExpiry { get; set; }
    public DateTime RcaExpiry { get; set; }

    public DateTime? LastWashTime { get; set; }
    public int MileageKm { get; set; }

    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<VehicleCompartment> Compartments { get; set; } = new List<VehicleCompartment>();
    public ICollection<WashLog> WashLogs { get; set; } = new List<WashLog>();
}

public enum VehicleType
{
    MilkTanker,
    ReeferTruck,
    Passenger
}

public enum VehicleStatus
{
    ReadyToCollect,
    Dirty,
    Maintenance,
    OutOfService
}
