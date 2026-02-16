using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmachotMemories.Migrations
{
    /// <inheritdoc />
    public partial class AddDownloadStatusToEvent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "download_status",
                table: "events",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "last_downloaded_at",
                table: "events",
                type: "timestamp without time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "download_status",
                table: "events");

            migrationBuilder.DropColumn(
                name: "last_downloaded_at",
                table: "events");
        }
    }
}
