namespace BomilactERP.api.DTOs;

public class PermissionDto
{
    public int Id { get; set; }
    public string ModuleId { get; set; } = string.Empty;
    public string? SubModuleId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}

public class RolePermissionsDto
{
    public string RoleId { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
    public List<int> PermissionIds { get; set; } = new();
}

public class UpdateRolePermissionsDto
{
    public List<int> PermissionIds { get; set; } = new();
}
