using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
namespace APIMateriales2026AguirreLautaro.Models;

public class Producto
{
[Key]
    public int ProductoID { get; set; }
    public string? Descrippcion { get; set;}
   
    public bool Eliminado { get; set; }

}
