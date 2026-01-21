namespace BomilactERP.api.DTOs;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Sku { get; set; }
    public decimal Price { get; set; }
    public string Unit { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Sku { get; set; }
    public decimal Price { get; set; }
    public string Unit { get; set; } = string.Empty;
}

public class UpdateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Sku { get; set; }
    public decimal Price { get; set; }
    public string Unit { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
