namespace BomilactERP.api.Models;

public class LabTest : ISoftDeletable
{
    public int Id { get; set; }
    public string SampleId { get; set; } = string.Empty;
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string SourceName { get; set; } = string.Empty;
    public LabSampleType Type { get; set; } = LabSampleType.RawMilk;

    // Minőségi paraméterek
    public decimal? Fat { get; set; }
    public decimal? Protein { get; set; }
    public decimal? Ph { get; set; }
    public decimal? Density { get; set; }
    public decimal? Water { get; set; }

    // Mikrobiológia
    public AntibioticResult? Antibiotic { get; set; }
    public decimal? Scc { get; set; }  // Somatic Cell Count (ezres)
    public decimal? Cfu { get; set; }  // Colony Forming Units (ezres)

    public LabTestStatus Status { get; set; } = LabTestStatus.Pending;
    public LabTestResult Result { get; set; } = LabTestResult.Pass;
    public string Inspector { get; set; } = string.Empty;
    public string? Notes { get; set; }

    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public enum LabSampleType
{
    RawMilk,
    Wip,
    FinishedGood
}

public enum LabTestStatus
{
    Pending,
    Completed
}

public enum LabTestResult
{
    Pass,
    Fail,
    Warning
}

public enum AntibioticResult
{
    Negative,
    Positive
}
