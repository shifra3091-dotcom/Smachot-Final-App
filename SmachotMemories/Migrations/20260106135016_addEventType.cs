using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SmachotMemories.Migrations
{
    /// <inheritdoc />
    public partial class addEventType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "event_type_id",
                table: "events",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "event_types",
                columns: table => new
                {
                    event_type_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    event_type_name = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_event_types", x => x.event_type_id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_events_event_type_id",
                table: "events",
                column: "event_type_id");

            migrationBuilder.AddForeignKey(
                name: "fk_events_event_types_event_type_id",
                table: "events",
                column: "event_type_id",
                principalTable: "event_types",
                principalColumn: "event_type_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_events_event_types_event_type_id",
                table: "events");

            migrationBuilder.DropTable(
                name: "event_types");

            migrationBuilder.DropIndex(
                name: "ix_events_event_type_id",
                table: "events");

            migrationBuilder.DropColumn(
                name: "event_type_id",
                table: "events");
        }
    }
}
