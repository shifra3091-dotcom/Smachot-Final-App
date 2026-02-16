using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmachotMemories.Migrations
{
    /// <inheritdoc />
    public partial class phne : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "phone",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "phone",
                table: "AspNetUsers");
        }
    }
}
