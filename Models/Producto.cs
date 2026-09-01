using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
namespace APIMateriales2026AguirreLautaro.Models;

public class Producto
{
[Key]
    public int ProductoID { get; set; }
    public string? Descripcion { get; set;}
   
    public bool Eliminado { get; set; }
    public decimal CostoTotal { get; set; }

    public decimal PrecioVenta { get; set; }

    public decimal PorcentajeGanancia { get; set; }

    public virtual ICollection<MaterialProducto>? Materiales { get; set; }

}

