using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Edunary.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddMoreAttrForCC : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ChunkSize",
                table: "CourseContents",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiresAt",
                table: "CourseContents",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileHash",
                table: "CourseContents",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "FileSize",
                table: "CourseContents",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "CourseContents",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalChunks",
                table: "CourseContents",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UploadedChunks",
                table: "CourseContents",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChunkSize",
                table: "CourseContents");

            migrationBuilder.DropColumn(
                name: "ExpiresAt",
                table: "CourseContents");

            migrationBuilder.DropColumn(
                name: "FileHash",
                table: "CourseContents");

            migrationBuilder.DropColumn(
                name: "FileSize",
                table: "CourseContents");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "CourseContents");

            migrationBuilder.DropColumn(
                name: "TotalChunks",
                table: "CourseContents");

            migrationBuilder.DropColumn(
                name: "UploadedChunks",
                table: "CourseContents");
        }
    }
}
