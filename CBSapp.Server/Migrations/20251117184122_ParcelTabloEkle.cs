using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CBSapp.Server.Migrations
{
    /// <inheritdoc />
    public partial class ParcelTabloEkle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Parcels",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Sehir = table.Column<string>(type: "text", nullable: false),
                    Ilce = table.Column<string>(type: "text", nullable: false),
                    Mahalle = table.Column<string>(type: "text", nullable: false),
                    Ada = table.Column<string>(type: "text", nullable: false),
                    Parsel = table.Column<string>(type: "text", nullable: false),
                    geom = table.Column<Polygon>(type: "geometry(Polygon, 4326)", nullable: false),
                    CreatAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Parcels", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Parcels_geom",
                table: "Parcels",
                column: "geom")
                .Annotation("Npgsql:IndexMethod", "GIST");

            migrationBuilder.CreateIndex(
                name: "IX_Parcels_Sehir_Ilce_Mahalle_Ada_Parsel",
                table: "Parcels",
                columns: new[] { "Sehir", "Ilce", "Mahalle", "Ada", "Parsel" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Parcels");
        }
    }
}
