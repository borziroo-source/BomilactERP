namespace BomilactERP.api.DTOs;

public class OrderItemDto
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string? Notes { get; set; }
}

public class CreateOrderItemDto
{
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class UpdateOrderItemDto
{
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? Notes { get; set; }
}
