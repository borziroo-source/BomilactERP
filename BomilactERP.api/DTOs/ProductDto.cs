namespace BomilactERP.api.DTOs;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Sku { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Uom { get; set; } = string.Empty;
    public string Category { get; set; } = "FINISHED";
    public decimal? WeightNetKg { get; set; }
    public int? MinStockThreshold { get; set; }
    public string? SagaRefId { get; set; }
    public int? ShelfLifeDays { get; set; }
    public int? StorageTempMin { get; set; }
    public int? StorageTempMax { get; set; }
    public bool IsActive { get; set; } = true;
}

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Sku { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Uom { get; set; } = "db";
    public string Category { get; set; } = "FINISHED";
    public decimal? WeightNetKg { get; set; }
    public int? MinStockThreshold { get; set; }
    public string? SagaRefId { get; set; }
    public int? ShelfLifeDays { get; set; }
    public int? StorageTempMin { get; set; }
    public int? StorageTempMax { get; set; }
}

public class UpdateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Sku { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Uom { get; set; } = "db";
    public string Category { get; set; } = "FINISHED";
    public decimal? WeightNetKg { get; set; }
    public int? MinStockThreshold { get; set; }
    public string? SagaRefId { get; set; }
    public int? ShelfLifeDays { get; set; }
    public int? StorageTempMin { get; set; }
    public int? StorageTempMax { get; set; }
    public bool IsActive { get; set; } = true;
}
