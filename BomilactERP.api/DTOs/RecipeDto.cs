namespace BomilactERP.api.DTOs;

public class RecipeItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ComponentName { get; set; } = string.Empty;
    public string? ComponentSku { get; set; }
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal UnitCost { get; set; }
    public string Category { get; set; } = string.Empty;
}

public class RecipeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? OutputProductId { get; set; }
    public string? OutputProductName { get; set; }
    public string? OutputProductSku { get; set; }
    public decimal OutputQuantity { get; set; }
    public string OutputUom { get; set; } = "db";
    public string Version { get; set; } = "v1.0";
    public string Status { get; set; } = "DRAFT";
    public string? Instructions { get; set; }
    public bool IsActive { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<RecipeItemDto> Items { get; set; } = new();
}

public class RecipeItemInputDto
{
    public int ProductId { get; set; }
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal UnitCost { get; set; }
    public string Category { get; set; } = string.Empty;
}

public class CreateRecipeDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? OutputProductId { get; set; }
    public decimal OutputQuantity { get; set; }
    public string OutputUom { get; set; } = "db";
    public string Version { get; set; } = "v0.1";
    public string? Instructions { get; set; }
    public List<RecipeItemInputDto> Items { get; set; } = new();
}

public class UpdateRecipeDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? OutputProductId { get; set; }
    public decimal OutputQuantity { get; set; }
    public string OutputUom { get; set; } = "db";
    public string Version { get; set; } = "v1.0";
    public string Status { get; set; } = "DRAFT";
    public string? Instructions { get; set; }
    public bool IsActive { get; set; }
    public List<RecipeItemInputDto> Items { get; set; } = new();
}
