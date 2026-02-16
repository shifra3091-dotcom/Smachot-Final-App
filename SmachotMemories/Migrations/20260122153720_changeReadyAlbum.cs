using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SmachotMemories.Migrations
{
    /// <inheritdoc />
    public partial class changeReadyAlbum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "albums_names",
                table: "event_types");

            migrationBuilder.CreateTable(
                name: "ready_album",
                columns: table => new
                {
                    ready_album_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    album_name = table.Column<string>(type: "text", nullable: false),
                    family = table.Column<bool>(type: "boolean", nullable: false),
                    times = table.Column<bool>(type: "boolean", nullable: false),
                    is_default = table.Column<bool>(type: "boolean", nullable: false),
                    event_type_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ready_album", x => x.ready_album_id);
                    table.ForeignKey(
                        name: "fk_ready_album_event_types_event_type_id",
                        column: x => x.event_type_id,
                        principalTable: "event_types",
                        principalColumn: "event_type_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_ready_album_event_type_id",
                table: "ready_album",
                column: "event_type_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ready_album");

            migrationBuilder.AddColumn<string[]>(
                name: "albums_names",
                table: "event_types",
                type: "text[]",
                nullable: false,
                defaultValue: new string[0]);
        }
    }
}
