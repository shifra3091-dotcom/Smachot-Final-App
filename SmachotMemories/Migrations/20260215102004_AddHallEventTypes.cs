using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmachotMemories.Migrations
{
    /// <inheritdoc />
    public partial class AddHallEventTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "hall_event_types",
                columns: table => new
                {
                    allowed_event_types_event_type_id = table.Column<int>(type: "integer", nullable: false),
                    halls_hall_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_hall_event_types", x => new { x.allowed_event_types_event_type_id, x.halls_hall_id });
                    table.ForeignKey(
                        name: "fk_hall_event_types_event_types_allowed_event_types_event_type",
                        column: x => x.allowed_event_types_event_type_id,
                        principalTable: "event_types",
                        principalColumn: "event_type_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_hall_event_types_halls_halls_hall_id",
                        column: x => x.halls_hall_id,
                        principalTable: "halls",
                        principalColumn: "hall_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_hall_event_types_halls_hall_id",
                table: "hall_event_types",
                column: "halls_hall_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "hall_event_types");
        }
    }
}
