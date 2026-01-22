namespace BomilactERP.api.DTOs;

public class InventoryItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public int Type { get; set; }
    public decimal Quantity { get; set; }
    public string? Location { get; set; }
    public string? LotNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
}

public class CreateInventoryItemDto
{
    public int ProductId { get; set; }
    public int Type { get; set; }
    public decimal Quantity { get; set; }
    public string? Location { get; set; }
    public string? LotNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
}

public class UpdateInventoryItemDto
{
    public decimal Quantity { get; set; }
    public string? Location { get; set; }
    public string? LotNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
}
