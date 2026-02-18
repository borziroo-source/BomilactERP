using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BomilactERP.api.Migrations
{
    /// <inheritdoc />
    public partial class AddPartnerImportFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApiaCode",
                table: "Partners",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExploitationCode",
                table: "Partners",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApiaCode",
                table: "Partners");

            migrationBuilder.DropColumn(
                name: "ExploitationCode",
                table: "Partners");
        }
    }
}
