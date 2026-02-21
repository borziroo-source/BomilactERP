using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BomilactERP.api.Migrations
{
    /// <inheritdoc />
    public partial class AddMilkCollections : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MilkCollectionEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PartnerId = table.Column<int>(type: "int", nullable: false),
                    VehicleId = table.Column<int>(type: "int", nullable: true),
                    VehiclePlate = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    QuantityLiters = table.Column<decimal>(type: "decimal(18,3)", precision: 18, scale: 3, nullable: false),
                    FatPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    ProteinPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    TemperatureC = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    Ph = table.Column<decimal>(type: "decimal(4,2)", precision: 4, scale: 2, nullable: false),
                    AntibioticTest = table.Column<int>(type: "int", nullable: false),
                    SampleId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    InspectorName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MilkCollectionEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MilkCollectionEntries_Partners_PartnerId",
                        column: x => x.PartnerId,
                        principalTable: "Partners",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MilkCollectionEntries_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "MilkCollectionSummaries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Month = table.Column<DateTime>(type: "date", nullable: false),
                    SupplierId = table.Column<int>(type: "int", nullable: false),
                    CollectionPointId = table.Column<int>(type: "int", nullable: false),
                    TotalLiters = table.Column<decimal>(type: "decimal(18,3)", precision: 18, scale: 3, nullable: false),
                    AvgFat = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    AvgProtein = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MilkCollectionSummaries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MilkCollectionSummaries_Partners_SupplierId",
                        column: x => x.SupplierId,
                        principalTable: "Partners",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MilkCollectionSummaries_SupplierGroups_CollectionPointId",
                        column: x => x.CollectionPointId,
                        principalTable: "SupplierGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MilkCollectionEntries_PartnerId",
                table: "MilkCollectionEntries",
                column: "PartnerId");

            migrationBuilder.CreateIndex(
                name: "IX_MilkCollectionEntries_VehicleId",
                table: "MilkCollectionEntries",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_MilkCollectionSummaries_CollectionPointId",
                table: "MilkCollectionSummaries",
                column: "CollectionPointId");

            migrationBuilder.CreateIndex(
                name: "IX_MilkCollectionSummaries_Month_SupplierId_CollectionPointId",
                table: "MilkCollectionSummaries",
                columns: new[] { "Month", "SupplierId", "CollectionPointId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MilkCollectionSummaries_SupplierId",
                table: "MilkCollectionSummaries",
                column: "SupplierId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MilkCollectionEntries");

            migrationBuilder.DropTable(
                name: "MilkCollectionSummaries");
        }
    }
}
