namespace BomilactERP.api.Models;

public enum ProductCategory
{
    RAW_MILK,
    INGREDIENT,
    PACKAGING,
    WIP,
    FINISHED,
    SERVICE
}

public class Product : ISoftDeletable
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Sku { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Unit { get; set; } = string.Empty; // kept for Orders/Inventory compat

    // Terméktörzs mezők
    public ProductCategory Category { get; set; } = ProductCategory.FINISHED;
    public string Uom { get; set; } = "db"; // Mértékegység
    public decimal? WeightNetKg { get; set; }
    public int? MinStockThreshold { get; set; }
    public string? SagaRefId { get; set; }
    public int? ShelfLifeDays { get; set; }
    public int? StorageTempMin { get; set; }
    public int? StorageTempMax { get; set; }

    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<InventoryItem> InventoryItems { get; set; } = new List<InventoryItem>();
    public ICollection<RecipeItem> RecipeItems { get; set; } = new List<RecipeItem>();
}
