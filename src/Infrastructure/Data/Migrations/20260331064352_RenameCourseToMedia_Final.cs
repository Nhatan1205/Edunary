using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Edunary.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RenameCourseToMedia_Final : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "CourseContents",
                newName: "MediaFiles");

            migrationBuilder.RenameIndex(
                name: "IX_CourseContents_CourseId",
                table: "MediaFiles",
                newName: "IX_MediaFiles_CourseId");

            migrationBuilder.AddColumn<string>(name: "ThumbnailUrl", table: "MediaFiles", type: "nvarchar(max)", nullable: true);
            migrationBuilder.AddColumn<string>(name: "HlsPath", table: "MediaFiles", type: "nvarchar(max)", nullable: true);
            migrationBuilder.AddColumn<int>(name: "HlsStatus", table: "MediaFiles", type: "int", nullable: false, defaultValue: 0);
            migrationBuilder.AddColumn<string>(name: "Duration", table: "MediaFiles", type: "nvarchar(max)", nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "MediaFiles",
                newName: "CourseContents");

            migrationBuilder.RenameIndex(
                name: "IX_MediaFiles_CourseId",
                table: "CourseContents",
                newName: "IX_CourseContents_CourseId");

            migrationBuilder.DropColumn(name: "ThumbnailUrl", table: "CourseContents");
            migrationBuilder.DropColumn(name: "HlsPath", table: "CourseContents");
            migrationBuilder.DropColumn(name: "HlsStatus", table: "CourseContents");
            migrationBuilder.DropColumn(name: "Duration", table: "CourseContents");
        }
    }
}
