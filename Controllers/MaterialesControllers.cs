using APIMateriales2026AguirreLautaro.Data;
using APIMateriales2026AguirreLautaro.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APIMateriales2026AguirreLautaro.Controllers;

[Route("api/[controller]")]
[ApiController]
public class MaterialesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public MaterialesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Materiales todos los materiales NO eliminados, cada uno con su Rubro
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Material>>> GetMateriales()
    {
        return await _context.Materiales
            .Include(m => m.Rubro)
            .Where(m => !m.Eliminado)
            .ToListAsync();
    }

    // GET: api/Materiales/5 UN material por id, con su Rubro incluido
    [HttpGet("{id}")]
    public async Task<ActionResult<Material>> GetMaterial(int id)
    {
        var material = await _context.Materiales
            .Include(m => m.Rubro)
            .FirstOrDefaultAsync(m => m.MaterialID == id && !m.Eliminado);

        if (material == null)
        {
            return NotFound();
        }

        return material;
    }

    
    // POST: api/Materiales crea un material (el RubroID debe existir en la tabla Rubros)
    [HttpPost]
    public async Task<ActionResult<Material>> PostMaterial(Material material)
    {

        // Validar que la descripción no esté vacía
        if (string.IsNullOrWhiteSpace(material.Descripcion))
        {
            return BadRequest("El nombre del material no puede estar vacío.");
        }

        if (material.PrecioCosto <= 0)
        {
            return BadRequest("El precio debe ser mayor a cero.");
        }

        bool existe = await _context.Materiales.AnyAsync(m => m.Descripcion == material.Descripcion && !m.Eliminado);
        if (existe)
        {
            return BadRequest("Ya existe un material con la misma descripción.");
        }
        _context.Materiales.Add(material);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMaterial), new { id = material.MaterialID }, material);
    }

    // PUT: api/Materiales/5 modifica un material existente
    [HttpPut("{id}")]
    public async Task<IActionResult> PutMaterial(int id, Material material)
    {
        if (id != material.MaterialID)
        {
            return BadRequest();
        }

        // Validar que la descripción no esté vacía
        if (string.IsNullOrWhiteSpace(material.Descripcion))
        {
            return BadRequest("El nombre del material no puede estar vacío.");
        }

        if (material.PrecioCosto <= 0)
        {
            return BadRequest("El precio debe ser mayor a cero.");
        }

        bool existe = await _context.Materiales.AnyAsync(m => m.Descripcion == material.Descripcion && !m.Eliminado && m.MaterialID != id);
        if (existe)
        {
            return BadRequest("Ya existe un material con la misma descripción.");
        }

        _context.Entry(material).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!MaterialExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/Materiales/5 borrado lógico
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMaterial(int id)
    {
        var material = await _context.Materiales.FindAsync(id);
        if (material == null)
        {
            return NotFound();
        }

        material.Eliminado = true;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool MaterialExists(int id)
    {
        return _context.Materiales.Any(e => e.MaterialID == id);
    }
}