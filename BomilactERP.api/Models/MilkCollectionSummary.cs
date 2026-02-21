namespace BomilactERP.api.Models;

public class MilkCollectionSummary : ISoftDeletable
{
    public int Id { get; set; }
    public DateTime Month { get; set; } = DateTime.UtcNow.Date;

    public int SupplierId { get; set; }
    public Partner Supplier { get; set; } = null!;

    public int CollectionPointId { get; set; }
    public SupplierGroup CollectionPoint { get; set; } = null!;

    public decimal TotalLiters { get; set; }
    public decimal AvgFat { get; set; }
    public decimal AvgProtein { get; set; }
    public MilkCollectionSummaryStatus Status { get; set; } = MilkCollectionSummaryStatus.Draft;

    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public enum MilkCollectionSummaryStatus
{
    Draft,
    Finalized
}
