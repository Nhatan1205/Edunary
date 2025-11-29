using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Edunary.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseRatingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "RatingCourses",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<int>(
                name: "TotalRating",
                table: "Courses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalRatingStudent",
                table: "Courses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_RatingCourses_CourseId_UserId",
                table: "RatingCourses",
                columns: new[] { "CourseId", "UserId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_RatingCourses_Courses_CourseId",
                table: "RatingCourses",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RatingCourses_Courses_CourseId",
                table: "RatingCourses");

            migrationBuilder.DropIndex(
                name: "IX_RatingCourses_CourseId_UserId",
                table: "RatingCourses");

            migrationBuilder.DropColumn(
                name: "TotalRating",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "TotalRatingStudent",
                table: "Courses");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "RatingCourses",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }
    }
}
