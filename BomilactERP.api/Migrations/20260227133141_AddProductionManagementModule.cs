using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BomilactERP.api.Migrations
{
    /// <inheritdoc />
    public partial class AddProductionManagementModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActualEndDate",
                table: "ProductionPlans");

            migrationBuilder.DropColumn(
                name: "ActualStartDate",
                table: "ProductionPlans");

            migrationBuilder.RenameColumn(
                name: "PlannedDate",
                table: "ProductionPlans",
                newName: "StartDate");

            migrationBuilder.AddColumn<string>(
                name: "Instructions",
                table: "Recipes",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OutputUom",
                table: "Recipes",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Recipes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Version",
                table: "Recipes",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "RecipeItems",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "UnitCost",
                table: "RecipeItems",
                type: "decimal(18,4)",
                precision: 18,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "ProductionPlans",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Line",
                table: "ProductionPlans",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Priority",
                table: "ProductionPlans",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ProductName",
                table: "ProductionPlans",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Progress",
                table: "ProductionPlans",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "Quantity",
                table: "ProductionPlans",
                type: "decimal(18,3)",
                precision: 18,
                scale: 3,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Sku",
                table: "ProductionPlans",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Supervisor",
                table: "ProductionPlans",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Uom",
                table: "ProductionPlans",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "ProductionBatches",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LineId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LineName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ProductName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    BatchNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,3)", precision: 18, scale: 3, nullable: false),
                    Uom = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CurrentStepIndex = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CurrentTemp = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false),
                    TargetTemp = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false),
                    CurrentPh = table.Column<decimal>(type: "decimal(4,2)", precision: 4, scale: 2, nullable: false),
                    AgitatorRpm = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductionBatches", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductionLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    BatchNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ProductName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Step = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Temperature = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: false),
                    Ph = table.Column<decimal>(type: "decimal(4,2)", precision: 4, scale: 2, nullable: false),
                    Operator = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductionLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductionBatchAlerts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductionBatchId = table.Column<int>(type: "int", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductionBatchAlerts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductionBatchAlerts_ProductionBatches_ProductionBatchId",
                        column: x => x.ProductionBatchId,
                        principalTable: "ProductionBatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductionSteps",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductionBatchId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    ElapsedMinutes = table.Column<int>(type: "int", nullable: false),
                    StepType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductionSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductionSteps_ProductionBatches_ProductionBatchId",
                        column: x => x.ProductionBatchId,
                        principalTable: "ProductionBatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Recipes_OutputProductId",
                table: "Recipes",
                column: "OutputProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatchAlerts_ProductionBatchId",
                table: "ProductionBatchAlerts",
                column: "ProductionBatchId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionSteps_ProductionBatchId",
                table: "ProductionSteps",
                column: "ProductionBatchId");

            migrationBuilder.AddForeignKey(
                name: "FK_Recipes_Products_OutputProductId",
                table: "Recipes",
                column: "OutputProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Recipes_Products_OutputProductId",
                table: "Recipes");

            migrationBuilder.DropTable(
                name: "ProductionBatchAlerts");

            migrationBuilder.DropTable(
                name: "ProductionLogs");

            migrationBuilder.DropTable(
                name: "ProductionSteps");

            migrationBuilder.DropTable(
                name: "ProductionBatches");

            migrationBuilder.DropIndex(
                name: "IX_Recipes_OutputProductId",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "Instructions",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "OutputUom",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "RecipeItems");

            migrationBuilder.DropColumn(
                name: "UnitCost",
                table: "RecipeItems");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "ProductionPlans");

            migrationBuilder.DropColumn(
                name: "Line",
                table: "ProductionPlans");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "ProductionPlans");

            migrationBuilder.DropColumn(
                name: "ProductName",
                table: "ProductionPlans");

            migrationBuilder.DropColumn(
                name: "Progress",
                table: "ProductionPlans");

            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "ProductionPlans");

            migrationBuilder.DropColumn(
                name: "Sku",
                table: "ProductionPlans");

            migrationBuilder.DropColumn(
                name: "Supervisor",
                table: "ProductionPlans");

            migrationBuilder.DropColumn(
                name: "Uom",
                table: "ProductionPlans");

            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "ProductionPlans",
                newName: "PlannedDate");

            migrationBuilder.AddColumn<DateTime>(
                name: "ActualEndDate",
                table: "ProductionPlans",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ActualStartDate",
                table: "ProductionPlans",
                type: "datetime2",
                nullable: true);
        }
    }
}
