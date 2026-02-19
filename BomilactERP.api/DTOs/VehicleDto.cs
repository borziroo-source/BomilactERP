namespace BomilactERP.api.DTOs;

public class VehicleDto
{
    public int Id { get; set; }
    public string PlateNumber { get; set; } = string.Empty;
    public string MakeModel { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal? TotalCapacityLiters { get; set; }
    public List<VehicleCompartmentDto> Compartments { get; set; } = new();
    public string ItpExpiry { get; set; } = string.Empty;
    public string RcaExpiry { get; set; } = string.Empty;
    public string? LastWashTime { get; set; }
    public int MileageKm { get; set; }
}

public class VehicleCompartmentDto
{
    public int Id { get; set; }
    public decimal CapacityLiters { get; set; }
    public string? CurrentContent { get; set; }
}

public class CreateVehicleDto
{
    public string PlateNumber { get; set; } = string.Empty;
    public string MakeModel { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal? TotalCapacityLiters { get; set; }
    public List<CreateVehicleCompartmentDto>? Compartments { get; set; }
    public string ItpExpiry { get; set; } = string.Empty;
    public string RcaExpiry { get; set; } = string.Empty;
    public string? LastWashTime { get; set; }
    public int MileageKm { get; set; }
}

public class CreateVehicleCompartmentDto
{
    public decimal CapacityLiters { get; set; }
    public string? CurrentContent { get; set; }
}

public class UpdateVehicleDto
{
    public string PlateNumber { get; set; } = string.Empty;
    public string MakeModel { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal? TotalCapacityLiters { get; set; }
    public string ItpExpiry { get; set; } = string.Empty;
    public string RcaExpiry { get; set; } = string.Empty;
    public string? LastWashTime { get; set; }
    public int MileageKm { get; set; }
}

public class VehicleDocumentUpdateDto
{
    public string? ItpExpiry { get; set; }
    public string? RcaExpiry { get; set; }
}

public class WashLogDto
{
    public int Id { get; set; }
    public int VehicleId { get; set; }
    public string Timestamp { get; set; } = string.Empty;
    public string PerformedBy { get; set; } = string.Empty;
    public string[] Chemicals { get; set; } = Array.Empty<string>();
    public int Temperature { get; set; }
}

public class CreateWashLogDto
{
    public string PerformedBy { get; set; } = string.Empty;
    public string[] Chemicals { get; set; } = Array.Empty<string>();
    public int Temperature { get; set; }
    public string? Timestamp { get; set; }
}
