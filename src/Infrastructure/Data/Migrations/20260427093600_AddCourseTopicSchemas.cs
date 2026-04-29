using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Edunary.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseTopicSchemas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Topic",
                table: "Courses");

            migrationBuilder.CreateTable(
                name: "CourseTopics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseTopics", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CourseCourseTopic",
                columns: table => new
                {
                    CoursesId = table.Column<int>(type: "int", nullable: false),
                    TopicsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseCourseTopic", x => new { x.CoursesId, x.TopicsId });
                    table.ForeignKey(
                        name: "FK_CourseCourseTopic_CourseTopics_TopicsId",
                        column: x => x.TopicsId,
                        principalTable: "CourseTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CourseCourseTopic_Courses_CoursesId",
                        column: x => x.CoursesId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourseCourseTopic_TopicsId",
                table: "CourseCourseTopic",
                column: "TopicsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CourseCourseTopic");

            migrationBuilder.DropTable(
                name: "CourseTopics");

            migrationBuilder.AddColumn<string>(
                name: "Topic",
                table: "Courses",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
