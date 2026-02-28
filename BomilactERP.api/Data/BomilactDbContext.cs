using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using BomilactERP.api.Models;

namespace BomilactERP.api.Data;

public class BomilactDbContext : IdentityDbContext<ApplicationUser>
{
    public BomilactDbContext(DbContextOptions<BomilactDbContext> options) : base(options)
    {
    }

    public DbSet<AppPermission> AppPermissions { get; set; }
    public DbSet<RolePermission> RolePermissions { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Partner> Partners { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<InventoryItem> InventoryItems { get; set; }
    public DbSet<Recipe> Recipes { get; set; }
    public DbSet<RecipeItem> RecipeItems { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<ProductionPlan> ProductionPlans { get; set; }
    public DbSet<ProductionItem> ProductionItems { get; set; }
    public DbSet<Contract> Contracts { get; set; }
    public DbSet<SupplierGroup> SupplierGroups { get; set; }
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<VehicleCompartment> VehicleCompartments { get; set; }
    public DbSet<WashLog> WashLogs { get; set; }
    public DbSet<MilkCollectionEntry> MilkCollectionEntries { get; set; }
    public DbSet<MilkCollectionSummary> MilkCollectionSummaries { get; set; }
    public DbSet<LabTest> LabTests { get; set; }
    public DbSet<ProductionBatch> ProductionBatches { get; set; }
    public DbSet<ProductionStep> ProductionSteps { get; set; }
    public DbSet<ProductionBatchAlert> ProductionBatchAlerts { get; set; }
    public DbSet<ProductionLog> ProductionLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ApplicationUser soft delete filter
        modelBuilder.Entity<ApplicationUser>().HasQueryFilter(e => !e.IsDeleted);

        // AppPermission configuration
        modelBuilder.Entity<AppPermission>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ModuleId).HasMaxLength(50).IsRequired();
            entity.Property(e => e.SubModuleId).HasMaxLength(50);
            entity.Property(e => e.Action).HasMaxLength(20).IsRequired();
            entity.Property(e => e.DisplayName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.HasIndex(e => new { e.ModuleId, e.SubModuleId, e.Action }).IsUnique();
        });

        // RolePermission configuration (composite key)
        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.HasKey(e => new { e.RoleId, e.PermissionId });
            entity.HasOne(e => e.Permission)
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(e => e.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<Product>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Partner>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Order>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<OrderItem>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<InventoryItem>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Recipe>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<RecipeItem>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Invoice>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<ProductionPlan>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<ProductionItem>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Contract>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<SupplierGroup>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Vehicle>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<WashLog>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<MilkCollectionEntry>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<MilkCollectionSummary>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<LabTest>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<ProductionBatch>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<ProductionStep>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<ProductionBatchAlert>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<ProductionLog>().HasQueryFilter(e => !e.IsDeleted);

        // Product configuration
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Sku).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Price).HasPrecision(18, 2);
            entity.HasIndex(e => e.Sku).IsUnique();
            entity.Property(e => e.Uom).HasMaxLength(20);
            entity.Property(e => e.WeightNetKg).HasPrecision(10, 4);
            entity.Property(e => e.SagaRefId).HasMaxLength(50);
        });

        // Partner configuration
        modelBuilder.Entity<Partner>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.TaxNumber).HasMaxLength(50);
            entity.Property(e => e.ExploitationCode).HasMaxLength(50);
            entity.Property(e => e.ApiaCode).HasMaxLength(50);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.HasIndex(e => e.TaxNumber).IsUnique();
            
            entity.HasOne(e => e.SupplierGroup)
                .WithMany(sg => sg.Partners)
                .HasForeignKey(e => e.SupplierGroupId)
                .OnDelete(DeleteBehavior.SetNull);
        });
        
        // SupplierGroup configuration
        modelBuilder.Entity<SupplierGroup>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Color).HasMaxLength(100).IsRequired();
        });

        // Order configuration
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OrderNumber).HasMaxLength(50).IsRequired();
            entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
            entity.HasIndex(e => e.OrderNumber).IsUnique();
            
            entity.HasOne(e => e.Partner)
                .WithMany(p => p.Orders)
                .HasForeignKey(e => e.PartnerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // OrderItem configuration
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity).HasPrecision(18, 3);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
            entity.Property(e => e.TotalPrice).HasPrecision(18, 2);
            
            entity.HasOne(e => e.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(e => e.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.Product)
                .WithMany(p => p.OrderItems)
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // InventoryItem configuration
        modelBuilder.Entity<InventoryItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity).HasPrecision(18, 3);
            entity.Property(e => e.LotNumber).HasMaxLength(50);
            
            entity.HasOne(e => e.Product)
                .WithMany(p => p.InventoryItems)
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Recipe configuration - see below (extended)

        // RecipeItem configuration - see below (extended)

        // Invoice configuration
        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.InvoiceNumber).HasMaxLength(50).IsRequired();
            entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
            entity.Property(e => e.PaidAmount).HasPrecision(18, 2);
            entity.HasIndex(e => e.InvoiceNumber).IsUnique();
            
            entity.HasOne(e => e.Partner)
                .WithMany(p => p.Invoices)
                .HasForeignKey(e => e.PartnerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Contract configuration
        modelBuilder.Entity<Contract>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ContractNumber).HasMaxLength(50).IsRequired();
            entity.HasIndex(e => e.ContractNumber).IsUnique();
            entity.Property(e => e.MilkQuotaLiters).HasPrecision(18, 3);
            entity.Property(e => e.BasePricePerLiter).HasPrecision(18, 4);

            entity.HasOne(e => e.Partner)
                .WithMany(p => p.Contracts)
                .HasForeignKey(e => e.PartnerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ProductionPlan configuration
        // ProductionPlan configuration - see extended config below

        // ProductionItem configuration
        modelBuilder.Entity<ProductionItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PlannedQuantity).HasPrecision(18, 3);
            entity.Property(e => e.ActualQuantity).HasPrecision(18, 3);
            entity.Property(e => e.LotNumber).HasMaxLength(50);

            entity.HasOne(e => e.ProductionPlan)
                .WithMany()
                .HasForeignKey(e => e.ProductionPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Vehicle configuration
        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PlateNumber).HasMaxLength(20).IsRequired();
            entity.HasIndex(e => e.PlateNumber).IsUnique();
            entity.Property(e => e.MakeModel).HasMaxLength(200);
            entity.Property(e => e.TotalCapacityLiters).HasPrecision(18, 2);

            entity.HasMany(e => e.Compartments)
                .WithOne(c => c.Vehicle)
                .HasForeignKey(c => c.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.WashLogs)
                .WithOne(w => w.Vehicle)
                .HasForeignKey(w => w.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<VehicleCompartment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CapacityLiters).HasPrecision(18, 2);
            entity.Property(e => e.CurrentContent).HasMaxLength(50);
        });

        modelBuilder.Entity<WashLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PerformedBy).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Chemicals).HasMaxLength(500);
        });

        modelBuilder.Entity<MilkCollectionEntry>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SampleId).HasMaxLength(50).IsRequired();
            entity.Property(e => e.VehiclePlate).HasMaxLength(20);
            entity.Property(e => e.QuantityLiters).HasPrecision(18, 3);
            entity.Property(e => e.FatPercentage).HasPrecision(5, 2);
            entity.Property(e => e.ProteinPercentage).HasPrecision(5, 2);
            entity.Property(e => e.TemperatureC).HasPrecision(5, 2);
            entity.Property(e => e.Ph).HasPrecision(4, 2);
            entity.Property(e => e.InspectorName).HasMaxLength(200);

            entity.HasOne(e => e.Partner)
                .WithMany()
                .HasForeignKey(e => e.PartnerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Vehicle)
                .WithMany()
                .HasForeignKey(e => e.VehicleId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<MilkCollectionSummary>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Month).HasColumnType("date");
            entity.Property(e => e.TotalLiters).HasPrecision(18, 3);
            entity.Property(e => e.AvgFat).HasPrecision(5, 2);
            entity.Property(e => e.AvgProtein).HasPrecision(5, 2);
            entity.HasIndex(e => new { e.Month, e.SupplierId, e.CollectionPointId }).IsUnique();

            entity.HasOne(e => e.Supplier)
                .WithMany()
                .HasForeignKey(e => e.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.CollectionPoint)
                .WithMany()
                .HasForeignKey(e => e.CollectionPointId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<LabTest>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SampleId).HasMaxLength(50).IsRequired();
            entity.HasIndex(e => e.SampleId).IsUnique();
            entity.Property(e => e.SourceName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Inspector).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Fat).HasPrecision(6, 2);
            entity.Property(e => e.Protein).HasPrecision(6, 2);
            entity.Property(e => e.Ph).HasPrecision(4, 2);
            entity.Property(e => e.Density).HasPrecision(6, 4);
            entity.Property(e => e.Water).HasPrecision(5, 2);
            entity.Property(e => e.Scc).HasPrecision(10, 2);
            entity.Property(e => e.Cfu).HasPrecision(10, 2);
        });

        // ProductionPlan configuration
        modelBuilder.Entity<ProductionPlan>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PlanNumber).HasMaxLength(50).IsRequired();
            entity.HasIndex(e => e.PlanNumber).IsUnique();
            entity.Property(e => e.ProductName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Sku).HasMaxLength(50);
            entity.Property(e => e.Quantity).HasPrecision(18, 3);
            entity.Property(e => e.Uom).HasMaxLength(20);
            entity.Property(e => e.Line).HasMaxLength(100);
            entity.Property(e => e.Supervisor).HasMaxLength(200);
            entity.Property(e => e.Priority).HasMaxLength(20);
        });

        // Recipe configuration
        modelBuilder.Entity<Recipe>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.OutputQuantity).HasPrecision(18, 3);
            entity.Property(e => e.OutputUom).HasMaxLength(20);
            entity.Property(e => e.Version).HasMaxLength(20);
            entity.Property(e => e.Instructions).HasColumnType("nvarchar(max)");

            entity.HasOne(e => e.OutputProduct)
                .WithMany()
                .HasForeignKey(e => e.OutputProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // RecipeItem configuration
        modelBuilder.Entity<RecipeItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity).HasPrecision(18, 3);
            entity.Property(e => e.Unit).HasMaxLength(20);
            entity.Property(e => e.UnitCost).HasPrecision(18, 4);
            entity.Property(e => e.Category).HasMaxLength(50);

            entity.HasOne(e => e.Recipe)
                .WithMany(r => r.RecipeItems)
                .HasForeignKey(e => e.RecipeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Product)
                .WithMany(p => p.RecipeItems)
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ProductionBatch configuration
        modelBuilder.Entity<ProductionBatch>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.LineId).HasMaxLength(50).IsRequired();
            entity.Property(e => e.LineName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.ProductName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.BatchNumber).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Uom).HasMaxLength(20);
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.Quantity).HasPrecision(18, 3);
            entity.Property(e => e.CurrentTemp).HasPrecision(6, 2);
            entity.Property(e => e.TargetTemp).HasPrecision(6, 2);
            entity.Property(e => e.CurrentPh).HasPrecision(4, 2);
        });

        // ProductionStep configuration
        modelBuilder.Entity<ProductionStep>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.StepType).HasMaxLength(30);

            entity.HasOne(e => e.ProductionBatch)
                .WithMany(b => b.Steps)
                .HasForeignKey(e => e.ProductionBatchId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ProductionBatchAlert configuration
        modelBuilder.Entity<ProductionBatchAlert>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Message).HasMaxLength(500).IsRequired();

            entity.HasOne(e => e.ProductionBatch)
                .WithMany(b => b.Alerts)
                .HasForeignKey(e => e.ProductionBatchId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ProductionLog configuration
        modelBuilder.Entity<ProductionLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.BatchNumber).HasMaxLength(50).IsRequired();
            entity.Property(e => e.ProductName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Step).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Operator).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.Temperature).HasPrecision(6, 2);
            entity.Property(e => e.Ph).HasPrecision(4, 2);
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Automatically set IsDeleted to true instead of deleting
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.State == EntityState.Deleted && entry.Entity is ISoftDeletable softDeletable)
            {
                entry.State = EntityState.Modified;
                softDeletable.IsDeleted = true;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
