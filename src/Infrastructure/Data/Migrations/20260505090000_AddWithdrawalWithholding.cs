using Edunary.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Edunary.Infrastructure.Data.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260505090000_AddWithdrawalWithholding")]
    public partial class AddWithdrawalWithholding : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "WithholdingRate",
                table: "WithdrawalRequests",
                type: "decimal(6,4)",
                precision: 6,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "WithholdingAmount",
                table: "WithdrawalRequests",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "NetAmount",
                table: "WithdrawalRequests",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "TaxCountryCode",
                table: "WithdrawalRequests",
                type: "nvarchar(2)",
                maxLength: 2,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WithholdingRate",
                table: "WithdrawalRequests");

            migrationBuilder.DropColumn(
                name: "WithholdingAmount",
                table: "WithdrawalRequests");

            migrationBuilder.DropColumn(
                name: "NetAmount",
                table: "WithdrawalRequests");

            migrationBuilder.DropColumn(
                name: "TaxCountryCode",
                table: "WithdrawalRequests");
        }
    }
}
