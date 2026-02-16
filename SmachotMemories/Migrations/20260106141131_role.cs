using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmachotMemories.Migrations
{
    /// <inheritdoc />
    public partial class role : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "role",
                table: "AspNetUsers",
                newName: "roles");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "roles",
                table: "AspNetUsers",
                newName: "role");
        }
    }
}
