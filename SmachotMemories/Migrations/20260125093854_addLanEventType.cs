using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmachotMemories.Migrations
{
    /// <inheritdoc />
    public partial class addLanEventType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "event_type_name",
                table: "event_types",
                newName: "event_type_name_ru");

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
                name: "event_type_name_key",
                table: "event_types",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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
                name: "event_type_name_key",
                table: "event_types");

            migrationBuilder.RenameColumn(
                name: "event_type_name_ru",
                table: "event_types",
                newName: "event_type_name");
        }
    }
}
