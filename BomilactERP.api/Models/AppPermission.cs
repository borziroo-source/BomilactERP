namespace BomilactERP.api.Models;

public class AppPermission
{
    public int Id { get; set; }
    public string ModuleId { get; set; } = string.Empty;
    public string? SubModuleId { get; set; }
    public string Action { get; set; } = string.Empty; // view, create, update, delete, export
    public string DisplayName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // For UI grouping

    // Navigation: which roles have this permission
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

public class RolePermission
{
    public string RoleId { get; set; } = string.Empty;
    public int PermissionId { get; set; }
    public AppPermission Permission { get; set; } = null!;
}
