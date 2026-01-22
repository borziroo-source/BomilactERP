namespace BomilactERP.api.Models;

public class Recipe : ISoftDeletable
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int OutputProductId { get; set; }
    public decimal OutputQuantity { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<RecipeItem> RecipeItems { get; set; } = new List<RecipeItem>();
}

public class RecipeItem : ISoftDeletable
{
    public int Id { get; set; }
    public int RecipeId { get; set; }
    public int ProductId { get; set; }
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public bool IsDeleted { get; set; } = false;

    // Navigation properties
    public Recipe Recipe { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
