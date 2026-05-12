using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Edunary.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddQnASchemas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CourseQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseId = table.Column<int>(type: "int", nullable: false),
                    ItemId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Detail = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: true),
                    AnswerCount = table.Column<int>(type: "int", nullable: false),
                    UpvoteCount = table.Column<int>(type: "int", nullable: false),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseQuestions_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CourseAnswers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuestionId = table.Column<int>(type: "int", nullable: false),
                    Body = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: false),
                    IsTopAnswer = table.Column<bool>(type: "bit", nullable: false),
                    UpvoteCount = table.Column<int>(type: "int", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CourseAnswers_CourseQuestions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "CourseQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuestionUpvotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuestionId = table.Column<int>(type: "int", nullable: false),
                    VoterId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionUpvotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionUpvotes_CourseQuestions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "CourseQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AnswerUpvotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AnswerId = table.Column<int>(type: "int", nullable: false),
                    VoterId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnswerUpvotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnswerUpvotes_CourseAnswers_AnswerId",
                        column: x => x.AnswerId,
                        principalTable: "CourseAnswers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "UX_AnswerUpvotes_Answer_Voter",
                table: "AnswerUpvotes",
                columns: new[] { "AnswerId", "VoterId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CourseAnswers_Question_Created",
                table: "CourseAnswers",
                columns: new[] { "QuestionId", "Created" });

            migrationBuilder.CreateIndex(
                name: "IX_CourseQuestions_Course_Created",
                table: "CourseQuestions",
                columns: new[] { "CourseId", "Created" });

            migrationBuilder.CreateIndex(
                name: "IX_CourseQuestions_Course_Item",
                table: "CourseQuestions",
                columns: new[] { "CourseId", "ItemId" });

            migrationBuilder.CreateIndex(
                name: "UX_QuestionUpvotes_Question_Voter",
                table: "QuestionUpvotes",
                columns: new[] { "QuestionId", "VoterId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AnswerUpvotes");

            migrationBuilder.DropTable(
                name: "QuestionUpvotes");

            migrationBuilder.DropTable(
                name: "CourseAnswers");

            migrationBuilder.DropTable(
                name: "CourseQuestions");
        }
    }
}
