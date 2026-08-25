using APIMateriales2026AguirreLautaro.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
namespace APIMateriales2026AguirreLautaro.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>

{

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)

        : base(options)

    {

    }

 public DbSet<Material> Materiales { get; set; }
 public DbSet<Producto> Productos  { get; set; }
 public DbSet<Rubro> Rubros { get; set; }
 public DbSet<MaterialProducto> MaterialesProductos { get; set; }

}