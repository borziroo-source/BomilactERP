using BomilactERP.api.Data;
using BomilactERP.api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BomilactERP.api.Services;

public class PermissionSeedService
{
    private static readonly List<(string moduleId, string? subModuleId, string category, string displayName)> ModuleDefinitions = new()
    {
        // Dashboard
        ("dashboard", "dash_summary", "Vezérlőpult", "Vezérlőpult - Vezetői Összefoglaló"),
        ("dashboard", "dash_alerts", "Vezérlőpult", "Vezérlőpult - Riasztások & HACCP"),
        // Logistics
        ("logistics", "log_shipments", "Logisztika", "Logisztika - Beérkező Szállítmányok"),
        ("logistics", "log_collection", "Logisztika", "Logisztika - Napi Begyűjtési Napló"),
        ("logistics", "log_farmer_invoicing", "Logisztika", "Logisztika - Gazda Elszámolás"),
        ("logistics", "log_routes", "Logisztika", "Logisztika - Útvonal Tervező"),
        ("logistics", "log_fleet", "Logisztika", "Logisztika - Flotta & Mosás"),
        ("logistics", "log_suppliers", "Logisztika", "Logisztika - Beszállítói Törzs"),
        ("logistics", "log_supplier_groups", "Logisztika", "Logisztika - Tejcsarnokok Kezelése"),
        ("logistics", "log_contracts", "Logisztika", "Logisztika - Szerződések & Árak"),
        // Production
        ("production", "prod_plan", "Termelés", "Termelés - Gyártási Terv"),
        ("production", "prod_active", "Termelés", "Termelés - Aktív Gyártások"),
        ("production", "prod_bom", "Termelés", "Termelés - Receptúrák (BOM)"),
        ("production", "prod_haccp", "Termelés", "Termelés - Technológiai Napló"),
        // Inventory
        ("inventory", "inv_raw", "Raktár", "Raktár - Nyersanyag (Silók)"),
        ("inventory", "inv_aux", "Raktár", "Raktár - Segédanyag & Csomagoló"),
        ("inventory", "inv_wip", "Raktár", "Raktár - Félkész (Érlelő)"),
        ("inventory", "inv_finished", "Raktár", "Raktár - Késztermék Raktár"),
        ("inventory", "inv_moves", "Raktár", "Raktár - Készletmozgások"),
        // QA
        ("qa", "qa_lab", "Minőségügy", "Minőségügy - Laborvizsgálatok"),
        ("qa", "qa_haccp_logs", "Minőségügy", "Minőségügy - HACCP Archívum"),
        ("qa", "qa_claims", "Minőségügy", "Minőségügy - Reklamációk"),
        // Sales
        ("sales", "sales_orders", "Értékesítés", "Értékesítés - Vevői Rendelések"),
        ("sales", "sales_partners", "Értékesítés", "Értékesítés - Vevőtörzs"),
        ("sales", "sales_delivery", "Értékesítés", "Értékesítés - Kiszállítás Tervező"),
        // Finance
        ("finance", "fin_profit", "Pénzügy", "Pénzügy - Profitabilitás"),
        ("finance", "fin_saga", "Pénzügy", "Pénzügy - SAGA Integráció"),
        ("finance", "fin_costs", "Pénzügy", "Pénzügy - Költségelemzés"),
        // Admin
        ("admin", "admin_users", "Adminisztráció", "Adminisztráció - Felhasználók"),
        ("admin", "admin_roles", "Adminisztráció", "Adminisztráció - Szerepkörök"),
        ("admin", "admin_permissions", "Adminisztráció", "Adminisztráció - Jogosultságok"),
        ("admin", "admin_products", "Adminisztráció", "Adminisztráció - Terméktörzs"),
        ("admin", "admin_logs", "Adminisztráció", "Adminisztráció - Audit Log"),
        // Driver menu
        ("driver", "drive_route", "Sofőr", "Sofőr - Mai Begyűjtés"),
        ("driver", "drive_pickup", "Sofőr", "Sofőr - Tejátvétel"),
        ("driver", "drive_maint", "Sofőr", "Sofőr - CIP Mosás"),
        // Agent menu
        ("agent", "agt_dashboard", "Ügynök", "Ügynök - Vezérlőpult"),
        ("agent", "agt_sales", "Ügynök", "Ügynök - Rendelésfelvétel"),
        ("agent", "agt_finance", "Ügynök", "Ügynök - Pénzügyek"),
        // Partner menu
        ("partner", "part_new_order", "Partner", "Partner - Új Rendelés"),
        ("partner", "part_my_orders", "Partner", "Partner - Rendeléseim"),
        ("partner", "part_invoices", "Partner", "Partner - Számlák"),
        ("partner", "part_profile", "Partner", "Partner - Adatlap"),
    };

    private static readonly string[] Actions = { "view", "create", "update", "delete", "export" };

    private static readonly Dictionary<string, string> ActionDisplayNames = new()
    {
        { "view", "Megtekintés" },
        { "create", "Létrehozás" },
        { "update", "Módosítás" },
        { "delete", "Törlés" },
        { "export", "Export" }
    };

    // Default permissions per role
    private static readonly Dictionary<string, List<string>> DefaultRolePermissions = new()
    {
        {
            "Admin", new List<string> { "all" } // Admin gets everything
        },
        {
            "Manager", new List<string>
            {
                "dashboard:view", "logistics:view", "production:view", "inventory:view",
                "qa:view", "sales:view", "finance:view",
                "logistics:create", "logistics:update", "logistics:delete", "logistics:export",
                "production:create", "production:update", "production:delete",
                "inventory:create", "inventory:update",
                "qa:create", "qa:update",
                "sales:create", "sales:update",
            }
        },
        {
            "Internal", new List<string>
            {
                "dashboard:view", "logistics:view", "production:view", "inventory:view",
                "qa:view", "sales:view",
                "logistics:create", "logistics:update",
                "production:create", "production:update",
                "inventory:create", "inventory:update",
                "qa:create", "qa:update",
                "sales:create", "sales:update",
            }
        },
        {
            "Driver", new List<string>
            {
                "driver:view", "driver:create", "driver:update",
            }
        },
        {
            "Agent", new List<string>
            {
                "agent:view", "agent:create", "agent:update",
            }
        },
        {
            "Partner", new List<string>
            {
                "partner:view", "partner:create",
            }
        },
    };

    public static async Task SeedPermissionsAsync(BomilactDbContext context, RoleManager<IdentityRole> roleManager, UserManager<ApplicationUser> userManager)
    {
        // Seed roles
        string[] roles = { "Admin", "Manager", "Internal", "Driver", "Agent", "Partner" };
        foreach (var roleName in roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }

        // Seed permissions
        foreach (var (moduleId, subModuleId, category, baseDisplayName) in ModuleDefinitions)
        {
            foreach (var action in Actions)
            {
                var exists = await context.AppPermissions.AnyAsync(p =>
                    p.ModuleId == moduleId && p.SubModuleId == subModuleId && p.Action == action);

                if (!exists)
                {
                    context.AppPermissions.Add(new AppPermission
                    {
                        ModuleId = moduleId,
                        SubModuleId = subModuleId,
                        Action = action,
                        DisplayName = $"{baseDisplayName} - {ActionDisplayNames[action]}",
                        Category = category
                    });
                }
            }
        }
        await context.SaveChangesAsync();

        // Assign default permissions to roles
        var allPermissions = await context.AppPermissions.ToListAsync();
        var adminRole = await roleManager.FindByNameAsync("Admin");

        if (adminRole != null)
        {
            // Admin gets all permissions
            foreach (var permission in allPermissions)
            {
                var exists = await context.RolePermissions.AnyAsync(rp =>
                    rp.RoleId == adminRole.Id && rp.PermissionId == permission.Id);
                if (!exists)
                {
                    context.RolePermissions.Add(new RolePermission
                    {
                        RoleId = adminRole.Id,
                        PermissionId = permission.Id
                    });
                }
            }
        }

        // Assign module-level permissions to other roles
        foreach (var (roleName, permDefs) in DefaultRolePermissions)
        {
            if (roleName == "Admin") continue;
            var role = await roleManager.FindByNameAsync(roleName);
            if (role == null) continue;

            foreach (var permDef in permDefs)
            {
                var parts = permDef.Split(':');
                var moduleId = parts[0];
                var action = parts.Length > 1 ? parts[1] : "view";

                // Find matching permissions
                var matchingPerms = allPermissions.Where(p =>
                    p.ModuleId == moduleId && p.Action == action).ToList();

                foreach (var perm in matchingPerms)
                {
                    var exists = await context.RolePermissions.AnyAsync(rp =>
                        rp.RoleId == role.Id && rp.PermissionId == perm.Id);
                    if (!exists)
                    {
                        context.RolePermissions.Add(new RolePermission
                        {
                            RoleId = role.Id,
                            PermissionId = perm.Id
                        });
                    }
                }
            }
        }

        await context.SaveChangesAsync();

        // Seed default admin user
        var adminEmail = "admin@bomilact.hu";
        var existingAdmin = await userManager.FindByEmailAsync(adminEmail);
        if (existingAdmin == null)
        {
            var adminUser = new ApplicationUser
            {
                UserName = "admin",
                Email = adminEmail,
                FirstName = "Rendszer",
                LastName = "Admin",
                Department = "IT",
                IsActive = true,
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(adminUser, "Admin@123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }
    }
}
