using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
namespace APIMateriales2026AguirreLautaro.Models;

public class Rubro 
{
[Key]
    public int RubroID { get; set; }
    public string? Descripcion { get; set;}
    public bool Eliminado { get; set; }
    // Propiedad de navegación: un Rubro tiene MUCHOS Materiales
public virtual ICollection<Material>? Materiales { get; set; }

}
