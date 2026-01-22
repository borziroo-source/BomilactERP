namespace BomilactERP.api.Models;

public class Invoice : ISoftDeletable
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int PartnerId { get; set; }
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public DateTime? DueDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal? PaidAmount { get; set; }
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Pending;
    public string? Notes { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public Partner Partner { get; set; } = null!;
}

public enum InvoiceStatus
{
    Pending,
    Paid,
    Overdue,
    Cancelled
}
