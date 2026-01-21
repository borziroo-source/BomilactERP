namespace BomilactERP.api.DTOs;

public class OrderDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int PartnerId { get; set; }
    public string? PartnerName { get; set; }
    public DateTime OrderDate { get; set; }
    public DateTime? DeliveryDate { get; set; }
    public int Status { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
}

public class CreateOrderDto
{
    public string OrderNumber { get; set; } = string.Empty;
    public int PartnerId { get; set; }
    public DateTime OrderDate { get; set; }
    public DateTime? DeliveryDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
}

public class UpdateOrderDto
{
    public string OrderNumber { get; set; } = string.Empty;
    public int PartnerId { get; set; }
    public DateTime OrderDate { get; set; }
    public DateTime? DeliveryDate { get; set; }
    public int Status { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
}
