namespace BomilactERP.api.Models;

public class InventoryItem
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public InventoryType Type { get; set; }
    public decimal Quantity { get; set; }
    public string? Location { get; set; }
    public string? LotNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public Product Product { get; set; } = null!;
}

public enum InventoryType
{
    RawMaterial,
    WorkInProgress,
    FinishedGoods,
    Auxiliary
}
