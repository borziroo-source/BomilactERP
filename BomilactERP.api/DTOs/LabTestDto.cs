namespace BomilactERP.api.DTOs;

public class LabTestDto
{
    public int Id { get; set; }
    public string SampleId { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string SourceName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;

    public decimal? Fat { get; set; }
    public decimal? Protein { get; set; }
    public decimal? Ph { get; set; }
    public decimal? Density { get; set; }
    public decimal? Water { get; set; }
    public string? Antibiotic { get; set; }
    public decimal? Scc { get; set; }
    public decimal? Cfu { get; set; }

    public string Status { get; set; } = string.Empty;
    public string Result { get; set; } = string.Empty;
    public string Inspector { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class CreateLabTestDto
{
    public string SampleId { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string SourceName { get; set; } = string.Empty;
    public string Type { get; set; } = "RAW_MILK";

    public decimal? Fat { get; set; }
    public decimal? Protein { get; set; }
    public decimal? Ph { get; set; }
    public decimal? Density { get; set; }
    public decimal? Water { get; set; }
    public string? Antibiotic { get; set; }
    public decimal? Scc { get; set; }
    public decimal? Cfu { get; set; }

    public string Status { get; set; } = "PENDING";
    public string Inspector { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class UpdateLabTestDto
{
    public string SampleId { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string SourceName { get; set; } = string.Empty;
    public string Type { get; set; } = "RAW_MILK";

    public decimal? Fat { get; set; }
    public decimal? Protein { get; set; }
    public decimal? Ph { get; set; }
    public decimal? Density { get; set; }
    public decimal? Water { get; set; }
    public string? Antibiotic { get; set; }
    public decimal? Scc { get; set; }
    public decimal? Cfu { get; set; }

    public string Status { get; set; } = "PENDING";
    public string Inspector { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class PagedResult<T>
{
    public IEnumerable<T> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
}
