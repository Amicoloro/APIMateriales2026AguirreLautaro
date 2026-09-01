const API = "/api/"; // URL base de la API

let productosCache = [];    // productos con su composición adentro


//PRODUCTOS--trae los diferentes productos
async function getProductos() {
    const response = await fetch(`${API}Productos`);
    const productos = await response.json();
    productosCache = productos;        
     

    const tbody = document. getElementById("tbody-productos");
    tbody.innerHTML = ""; // Limpia el contenido previo de la tabla

    productos.forEach(producto => {
        tbody.innerHTML += `
                    <tr>
                <td>${producto.productoID}</td>
                <td>${producto.descripcion ?? ""}</td>
                <td>$${producto.costoTotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editarProducto(${producto.productoID})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${producto.productoID})">
                        <i class="bi bi-trash"></i>
                    </button>
                     <button class="btn btn-sm btn-info" onclick="abrirComposicion(${producto.productoID})">
                        <i class="bi bi-list"></i>
                    </button>
                </td>
            </tr>`;
    });
}






//referencia al modal en este caso modal-producto
const modalProducto = new bootstrap.Modal(document.getElementById("modal-producto"));

//Boton Agregar producto (crear producto)
document.getElementById("btn-nuevo-producto").addEventListener("click", () => {
    document.getElementById("producto-id").value = "";
    document.getElementById("producto-descripcion").value = "";
    document.getElementById("producto-costo").value = "";
    document.getElementById("titulo-modal-producto").textContent="Nuevo Producto";
    modalProducto.show();
});

async function editarProducto(id) {
    const response = await fetch(`${API}Productos/${id}`);   // GET api/Productos/5
    const producto = await response.json();

    document.getElementById("producto-id").value = producto.productoID;
    document.getElementById("producto-descripcion").value = producto.descripcion ?? "";
    document.getElementById("producto-costo").value = producto.costoTotal.toFixed(2);
    document.getElementById("titulo-modal-producto").textContent = "Editar Producto";
    modalProducto.show();
}

//boton Guardar Producto (crear o editar producto)
document.getElementById("btn-guardar-producto").addEventListener("click", async () => {
    const id = document.getElementById("producto-id").value;
    const descripcion = document.getElementById("producto-descripcion").value.trim();
    const costoTotal = parseFloat(document.getElementById("producto-costo").value);

    // Validación: descripción no puede estar vacía
    if (descripcion === "") {
        marcarError("producto-descripcion", "La descripción es obligatoria");
        return;   
    }

    if (isNaN(costoTotal) || costoTotal <= 0) {
        marcarError("producto-costo", "El costo total debe ser mayor a cero");
        return;   
    }

    const  producto = {
        descripcion: descripcion,
        costoTotal: costoTotal,
        eliminado: false
    };

    let response;
    if (id === "") {
        //Crear nuevo producto
        response = await fetch (`${API}Productos`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(producto)
        });
    } else {
        //Editar producto existente
        producto.productoID = parseInt(id); // Convertir el id a entero, SI NO ES ENTERO Y ES 0 ENTONCES NO SE PUEDE EDITAR PORQUE NO EXISTE
        response = await fetch(`${API}Productos/${id}`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(producto)
        });
    }

    if (!response.ok) {
        const mensaje = await response.text();
        marcarError("producto-descripcion", mensaje.replaceAll('"', ''));
        return;   // el modal queda abierto para que corrija
    }

    modalProducto.hide();
    getProductos();// Actualiza la lista de productos después de guardar
});


function eliminarProducto(id) {
    confirmarEliminar("¿Está seguro de eliminar este producto?", async () => {
        await fetch(`${API}Productos/${id}`, { method: "DELETE" });
        getProductos();
    });
}


// Recargar los datos cada vez que se abre una pestaña
document.getElementById("tab-productos").addEventListener("shown.bs.tab", getProductos);
