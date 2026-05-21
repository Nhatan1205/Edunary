using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Edunary.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class SimplifyTaxProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HasSubmittedW8Ben",
                table: "TaxProfiles");

            migrationBuilder.DropColumn(
                name: "LastReviewedAt",
                table: "TaxProfiles");

            migrationBuilder.DropColumn(
                name: "W8BenSubmittedAt",
                table: "TaxProfiles");

            migrationBuilder.DropColumn(
                name: "WithholdingRate",
                table: "TaxProfiles");

            migrationBuilder.AddColumn<decimal>(
                name: "WithholdingRate",
                table: "TaxRegions",
                type: "decimal(6,4)",
                precision: 6,
                scale: 4,
                nullable: false,
                defaultValue: 0.30m);

            migrationBuilder.AlterColumn<string>(
                name: "TaxCountryCode",
                table: "TaxProfiles",
                type: "nvarchar(2)",
                maxLength: 2,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(2)",
                oldMaxLength: 2,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RealName",
                table: "TaxProfiles",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TaxIdentificationNumber",
                table: "TaxProfiles",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WithholdingRate",
                table: "TaxRegions");

            migrationBuilder.DropColumn(
                name: "RealName",
                table: "TaxProfiles");

            migrationBuilder.DropColumn(
                name: "TaxIdentificationNumber",
                table: "TaxProfiles");

            migrationBuilder.AlterColumn<string>(
                name: "TaxCountryCode",
                table: "TaxProfiles",
                type: "nvarchar(2)",
                maxLength: 2,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(2)",
                oldMaxLength: 2);

            migrationBuilder.AddColumn<bool>(
                name: "HasSubmittedW8Ben",
                table: "TaxProfiles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastReviewedAt",
                table: "TaxProfiles",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "W8BenSubmittedAt",
                table: "TaxProfiles",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "WithholdingRate",
                table: "TaxProfiles",
                type: "decimal(6,4)",
                precision: 6,
                scale: 4,
                nullable: false,
                defaultValue: 0.30m);
        }
    }
}
