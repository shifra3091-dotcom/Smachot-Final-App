using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmachotMemories.Migrations
{
    /// <inheritdoc />
    public partial class addLanEventType1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "event_type_name_ar_xa",
                table: "event_types");

            migrationBuilder.DropColumn(
                name: "event_type_name_en",
                table: "event_types");

            migrationBuilder.DropColumn(
                name: "event_type_name_fr",
                table: "event_types");

            migrationBuilder.DropColumn(
                name: "event_type_name_he",
                table: "event_types");

            migrationBuilder.DropColumn(
                name: "event_type_name_ru",
                table: "event_types");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "event_type_name_ar_xa",
                table: "event_types",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "event_type_name_en",
                table: "event_types",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "event_type_name_fr",
                table: "event_types",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "event_type_name_he",
                table: "event_types",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "event_type_name_ru",
                table: "event_types",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
