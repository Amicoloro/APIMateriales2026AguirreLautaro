using APIMateriales2026AguirreLautaro.Data;
using APIMateriales2026AguirreLautaro.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APIMateriales2026AguirreLautaro.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RubrosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RubrosController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Rubros todos los rubros NO eliminados, cada uno con su lista de materiales
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Rubro>>> GetRubros()
    {
        return await _context.Rubros
            .Include(r => r.Materiales!.Where(m => !m.Eliminado))
            .Where(r => !r.Eliminado)
            .ToListAsync();
    }

    // GET: api/Rubros/5 UN rubro por id, con sus materiales incluidos
    [HttpGet("{id}")]
    public async Task<ActionResult<Rubro>> GetRubro(int id)
    {
        var rubro = await _context.Rubros
            .Include(r => r.Materiales!.Where(m => !m.Eliminado))
            .FirstOrDefaultAsync(r => r.RubroID == id && !r.Eliminado);

        if (rubro == null)
        {
            return NotFound();
        }

        return rubro;
    }

    // POST: api/Rubros crea un rubro nuevo
    [HttpPost]
    public async Task<ActionResult<Rubro>> PostRubro(Rubro rubro)
    {

        // Validar que la descripción no esté vacía
        if (string.IsNullOrWhiteSpace(rubro.Descripcion))
        {
            return BadRequest("El nombre del rubro no puede estar vacío.");
        }

        // Verificar si ya existe un rubro con la misma descripción y que no esté eliminado
        bool existe = await _context.Rubros.AnyAsync(r => r.Descripcion == rubro.Descripcion && !r.Eliminado);
        if (existe)
        {
            return BadRequest("Ya existe un rubro con la misma descripción.");
        }

        _context.Rubros.Add(rubro);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRubro), new { id = rubro.RubroID }, rubro);
    }

    // PUT: api/Rubros/5 modifica un rubro existente
    [HttpPut("{id}")]
    public async Task<IActionResult> PutRubro(int id, Rubro rubro)
    {

        //lo mismo que en el POST, validar que la descripción no esté vacía y que no exista otro rubro con la misma descripción
        if (string.IsNullOrWhiteSpace(rubro.Descripcion))
        {
            return BadRequest("El nombre del rubro no puede estar vacío.");
        }

        bool existe = await _context.Rubros.AnyAsync(r => r.Descripcion == rubro.Descripcion && !r.Eliminado && r.RubroID != id);
        if (existe)
        {
            return BadRequest("Ya existe un rubro con la misma descripción.");
        }

        if (id != rubro.RubroID)
        {
            return BadRequest();
        }

        _context.Entry(rubro).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!RubroExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/Rubros/5 borrado lógico
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRubro(int id)
    {
        var rubro = await _context.Rubros.FindAsync(id);
        if (rubro == null)
        {
            return NotFound();
        }

        rubro.Eliminado = true;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool RubroExists(int id)
    {
        return _context.Rubros.Any(e => e.RubroID == id);
    }
}