using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Edunary.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCountryNameToTaxRegion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add as nullable first — table already has rows
            migrationBuilder.AddColumn<string>(
                name: "CountryName",
                table: "TaxRegions",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            // Backfill the five seeded rows
            migrationBuilder.Sql("UPDATE TaxRegions SET CountryName = N'🇻🇳 Vietnam'        WHERE CountryCode = 'VN'");
            migrationBuilder.Sql("UPDATE TaxRegions SET CountryName = N'🇩🇪 Germany'        WHERE CountryCode = 'DE'");
            migrationBuilder.Sql("UPDATE TaxRegions SET CountryName = N'🇫🇷 France'         WHERE CountryCode = 'FR'");
            migrationBuilder.Sql("UPDATE TaxRegions SET CountryName = N'🇬🇧 United Kingdom' WHERE CountryCode = 'GB'");
            migrationBuilder.Sql("UPDATE TaxRegions SET CountryName = N'🇺🇸 United States'  WHERE CountryCode = 'US'");

            // Fallback for any other existing rows
            migrationBuilder.Sql("UPDATE TaxRegions SET CountryName = '' WHERE CountryName IS NULL");

            // Now make the column NOT NULL
            migrationBuilder.AlterColumn<string>(
                name: "CountryName",
                table: "TaxRegions",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CountryName",
                table: "TaxRegions");
        }
    }
}
