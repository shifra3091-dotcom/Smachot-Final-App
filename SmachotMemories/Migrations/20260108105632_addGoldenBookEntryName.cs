using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmachotMemories.Migrations
{
    /// <inheritdoc />
    public partial class addGoldenBookEntryName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "sender_name",
                table: "golden_book_entries",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "sender_name",
                table: "golden_book_entries");
        }
    }
}
