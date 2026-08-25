using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
namespace APIMateriales2026AguirreLautaro.Models;

public class Material
{
[Key]
    public int MaterialID { get; set; }
    public string? Descripcion { get; set;}
    public int RubroID { get; set; }
    
    public decimal PrecioCosto { get; set;}
    public bool Eliminado { get; set; }
    
    // Propiedad de navegación: cada Material pertenece a UN Rubro
    public virtual Rubro? Rubro { get; set; }
    public virtual ICollection<MaterialProducto>? Productos { get; set; }
}

