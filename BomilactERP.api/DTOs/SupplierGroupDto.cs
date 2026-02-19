namespace BomilactERP.api.DTOs;

public class SupplierGroupDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public int MemberCount { get; set; } = 0;
}

public class CreateSupplierGroupDto
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}

public class UpdateSupplierGroupDto
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}

public class UpdateSupplierGroupMemberDto
{
    public int PartnerId { get; set; }
}
