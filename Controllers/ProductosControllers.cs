using APIMateriales2026AguirreLautaro.Data;
using APIMateriales2026AguirreLautaro.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APIMateriales2026AguirreLautaro.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductosController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    public ProductosController(ApplicationDbContext context)
    {
        _context = context;
    }


    //Get: api/Productos
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Producto>>> GetProductos()
    {
        return await _context.Productos
        .Include(p => p.Materiales!)
        .ThenInclude(mp => mp.Material)
        .Where(p => !p.Eliminado)
        .ToListAsync();
    }


    //GET: api/Productos/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Producto>> GetProducto(int id)
    {
        var producto = await _context.Productos
        .Include(p => p.Materiales!)
        .ThenInclude(mp => mp.Material)
        .FirstOrDefaultAsync(p => p.ProductoID == id && !p.Eliminado);

        if (producto == null)
        {
            return NotFound();
        }
        return producto;
    }


    //POST: api/Productos
    [HttpPost]
    public async Task<ActionResult<Producto>> PostProducto(Producto producto)
    {

        // Validar que la descripción no esté vacía
        if (string.IsNullOrWhiteSpace(producto.Descripcion))
        {
            return BadRequest("El nombre del producto no puede estar vacío.");
        }
        bool existe = await _context.Productos.AnyAsync(p => p.Descripcion == producto.Descripcion && !p.Eliminado);
        if (existe)
        {
            return BadRequest("Ya existe un producto con la misma descripción.");
        }
        producto.CostoTotal = 0;   // un producto nuevo arranca sin composición
        _context.Productos.Add(producto);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProducto), new { id = producto.ProductoID }, producto);
    }

    [HttpPost("MaterialProducto")]
    public async Task<ActionResult<IEnumerable<MaterialProducto>>> PostMaterialProducto(MaterialProducto materialProducto)
    {
        if (materialProducto.Cantidad <= 0)
        {
            return BadRequest("La cantidad debe ser mayor a cero.");
        }

        bool materialExiste = await _context.Materiales
            .AnyAsync(m => m.MaterialID == materialProducto.MaterialID);
        if (!materialExiste)
        {
            return BadRequest("El material seleccionado no existe.");
        }

        bool yaEsta = await _context.MaterialesProductos
            .AnyAsync(x => x.ProductoID == materialProducto.ProductoID && x.MaterialID == materialProducto.MaterialID);
        if (yaEsta)
        {
            return BadRequest("Ese material ya forma parte de la composición.");
        }
     // Obtener el precio de costo unitario del material
        materialProducto.PrecioCostoUnitario = await _context.Materiales
        .Where(m => m.MaterialID == materialProducto.MaterialID)
        .Select(m => m.PrecioCosto)
        .FirstOrDefaultAsync();

        materialProducto.SubTotal = materialProducto.PrecioCostoUnitario * materialProducto.Cantidad;

        await _context.MaterialesProductos.AddAsync(materialProducto);
        await _context.SaveChangesAsync();


        var materialesProductos = await _context.MaterialesProductos
        .Include(mp => mp.Material)
        .Where(m => m.ProductoID == materialProducto.ProductoID)
        .ToListAsync();

        // Actualizar el costo total del producto (suma de los subtotales)
        var producto = await _context.Productos
        .FindAsync(materialProducto.ProductoID);

        producto.CostoTotal = materialesProductos
        .Sum(m => m.SubTotal);

        await _context.SaveChangesAsync();

        return Ok(materialesProductos);
    }

    //PUT: api/Productos/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutProducto(int id, Producto producto)
    {
        // Validar que la descripción no esté vacía
        if (string.IsNullOrWhiteSpace(producto.Descripcion))
        {
            return BadRequest("El nombre del producto no puede estar vacío.");
        }
        bool existe = await _context.Productos.AnyAsync(p => p.Descripcion == producto.Descripcion && !p.Eliminado && p.ProductoID != id);
        if (existe)
        {
            return BadRequest("Ya existe un producto con la misma descripción.");
        }

        if (id != producto.ProductoID)
        {
            return BadRequest();
        }

        _context.Entry(producto).State = EntityState.Modified;
        _context.Entry(producto).Property(p => p.CostoTotal).IsModified = false;
       
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ProductoExists(id))
            {
                return NotFound();
            }

            throw;

        }

        return NoContent();
    }

    //DELETE: api/Productos/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProducto(int id)
    {
        var producto = await _context.Productos.FindAsync(id);
        if (producto == null)
        {
            return NotFound();
        }

        producto.Eliminado = true;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ProductoExists(int id)
    {
        return _context.Productos.Any(e => e.ProductoID == id);
    }
}