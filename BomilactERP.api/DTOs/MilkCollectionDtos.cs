namespace BomilactERP.api.DTOs;

public class MilkCollectionEntryDto
{
    public int Id { get; set; }
    public string Timestamp { get; set; } = string.Empty;
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public int? VehicleId { get; set; }
    public string VehiclePlate { get; set; } = string.Empty;
    public decimal QuantityLiters { get; set; }
    public decimal FatPercentage { get; set; }
    public decimal ProteinPercentage { get; set; }
    public decimal Temperature { get; set; }
    public decimal Ph { get; set; }
    public string AntibioticTest { get; set; } = string.Empty;
    public string SampleId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Inspector { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class CreateMilkCollectionEntryDto
{
    public string Timestamp { get; set; } = string.Empty;
    public int SupplierId { get; set; }
    public int? VehicleId { get; set; }
    public string? VehiclePlate { get; set; }
    public decimal QuantityLiters { get; set; }
    public decimal FatPercentage { get; set; }
    public decimal ProteinPercentage { get; set; }
    public decimal Temperature { get; set; }
    public decimal Ph { get; set; }
    public string AntibioticTest { get; set; } = string.Empty;
    public string SampleId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Inspector { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class UpdateMilkCollectionEntryDto
{
    public string Timestamp { get; set; } = string.Empty;
    public int SupplierId { get; set; }
    public int? VehicleId { get; set; }
    public string? VehiclePlate { get; set; }
    public decimal QuantityLiters { get; set; }
    public decimal FatPercentage { get; set; }
    public decimal ProteinPercentage { get; set; }
    public decimal Temperature { get; set; }
    public decimal Ph { get; set; }
    public string AntibioticTest { get; set; } = string.Empty;
    public string SampleId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Inspector { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class MilkCollectionSummaryDto
{
    public int Id { get; set; }
    public string Month { get; set; } = string.Empty;
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public int CollectionPointId { get; set; }
    public string CollectionPointName { get; set; } = string.Empty;
    public decimal TotalLiters { get; set; }
    public decimal AvgFat { get; set; }
    public decimal AvgProtein { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class SaveMonthlySummariesDto
{
    public string Month { get; set; } = string.Empty;
    public int CollectionPointId { get; set; }
    public List<SaveMonthlySummaryItemDto> Items { get; set; } = new();
}

public class SaveMonthlySummaryItemDto
{
    public int SupplierId { get; set; }
    public decimal TotalLiters { get; set; }
    public decimal AvgFat { get; set; }
    public decimal AvgProtein { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class FinalizeMonthlySummariesDto
{
    public string Month { get; set; } = string.Empty;
    public int CollectionPointId { get; set; }
}
