using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
namespace APIMateriales2026AguirreLautaro.Models;

public class MaterialProducto
{
    [Key]
    public int MaterialProductoID { get; set; }
    public int Cantidad { get; set; }
    public decimal PrecioCostoUnitario { get; set; }
    public decimal SubTotal { get; set; }
    public int MaterialID { get; set; }
    public virtual Material? Material { get; set; }
    public int ProductoID { get; set; }
    public virtual Producto? Producto { get; set; }



}