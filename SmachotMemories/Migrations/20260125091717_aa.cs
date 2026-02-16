using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmachotMemories.Migrations
{
    /// <inheritdoc />
    public partial class aa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_ready_album_event_types_event_type_id",
                table: "ready_album");

            migrationBuilder.DropPrimaryKey(
                name: "pk_ready_album",
                table: "ready_album");

            migrationBuilder.RenameTable(
                name: "ready_album",
                newName: "ready_albums");

            migrationBuilder.RenameColumn(
                name: "default_album_count",
                table: "event_types",
                newName: "default_album_s_count");

            migrationBuilder.RenameIndex(
                name: "ix_ready_album_event_type_id",
                table: "ready_albums",
                newName: "ix_ready_albums_event_type_id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_ready_albums",
                table: "ready_albums",
                column: "ready_album_id");

            migrationBuilder.AddForeignKey(
                name: "fk_ready_albums_event_types_event_type_id",
                table: "ready_albums",
                column: "event_type_id",
                principalTable: "event_types",
                principalColumn: "event_type_id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_ready_albums_event_types_event_type_id",
                table: "ready_albums");

            migrationBuilder.DropPrimaryKey(
                name: "pk_ready_albums",
                table: "ready_albums");

            migrationBuilder.RenameTable(
                name: "ready_albums",
                newName: "ready_album");

            migrationBuilder.RenameColumn(
                name: "default_album_s_count",
                table: "event_types",
                newName: "default_album_count");

            migrationBuilder.RenameIndex(
                name: "ix_ready_albums_event_type_id",
                table: "ready_album",
                newName: "ix_ready_album_event_type_id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_ready_album",
                table: "ready_album",
                column: "ready_album_id");

            migrationBuilder.AddForeignKey(
                name: "fk_ready_album_event_types_event_type_id",
                table: "ready_album",
                column: "event_type_id",
                principalTable: "event_types",
                principalColumn: "event_type_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
