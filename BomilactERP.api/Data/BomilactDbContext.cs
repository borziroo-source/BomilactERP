using Microsoft.EntityFrameworkCore;
using BomilactERP.api.Models;

namespace BomilactERP.api.Data;

public class BomilactDbContext : DbContext
{
    public BomilactDbContext(DbContextOptions<BomilactDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Global query filter for soft delete
        modelBuilder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
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

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Username).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(100).IsRequired();
            entity.Property(e => e.PasswordHash).IsRequired();
        });

        // Product configuration
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Sku).HasMaxLength(50);
            entity.Property(e => e.Price).HasPrecision(18, 2);
            entity.HasIndex(e => e.Sku).IsUnique();
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

        // Recipe configuration
        modelBuilder.Entity<Recipe>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.OutputQuantity).HasPrecision(18, 3);
        });

        // RecipeItem configuration
        modelBuilder.Entity<RecipeItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity).HasPrecision(18, 3);
            entity.Property(e => e.Unit).HasMaxLength(20);
            
            entity.HasOne(e => e.Recipe)
                .WithMany(r => r.RecipeItems)
                .HasForeignKey(e => e.RecipeId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.Product)
                .WithMany(p => p.RecipeItems)
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

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
        modelBuilder.Entity<ProductionPlan>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PlanNumber).HasMaxLength(50).IsRequired();
            entity.HasIndex(e => e.PlanNumber).IsUnique();
        });

        // ProductionItem configuration
        modelBuilder.Entity<ProductionItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PlannedQuantity).HasPrecision(18, 3);
            entity.Property(e => e.ActualQuantity).HasPrecision(18, 3);
            entity.Property(e => e.LotNumber).HasMaxLength(50);
            
            entity.HasOne(e => e.ProductionPlan)
                .WithMany(pp => pp.ProductionItems)
                .HasForeignKey(e => e.ProductionPlanId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
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
