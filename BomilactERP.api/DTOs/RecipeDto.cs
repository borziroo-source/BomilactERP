namespace BomilactERP.api.DTOs;

public class RecipeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int OutputProductId { get; set; }
    public string? OutputProductName { get; set; }
    public decimal OutputQuantity { get; set; }
    public bool IsActive { get; set; }
}

public class CreateRecipeDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int OutputProductId { get; set; }
    public decimal OutputQuantity { get; set; }
}

public class UpdateRecipeDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int OutputProductId { get; set; }
    public decimal OutputQuantity { get; set; }
    public bool IsActive { get; set; }
}
