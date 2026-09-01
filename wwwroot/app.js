const API = "/api/"; // URL base de la API

//RUBROS--trae los diferentes rubros
async function getRubros() {
    const response = await fetch(`${API}Rubros`);
    const rubros = await response.json(); // Convierte la respuesta en JSON

    const tbody = document.getElementById("tbody-rubros");
    tbody.innerHTML = ""; // Limpia el contenido previo de la tabla

    rubros.forEach(rubro => {
        tbody.innerHTML += `
                    <tr>
                <td>${rubro.rubroID}</td>
                <td>${rubro.descripcion ?? ""}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editarRubro(${rubro.rubroID})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarRubro(${rubro.rubroID})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>`;
    });
}

// Al abrir la página, carga los datos
getRubros();
// Al abrir la página, carga los datos
getProductos();

//referencia al modal en este caso modal-rubro
const modalRubro = new bootstrap.Modal(document.getElementById("modal-rubro"));

//Boton Agregar Rubro (crear rubro)
document.getElementById("btn-nuevo-rubro").addEventListener("click", () => {
    document.getElementById("rubro-id").value = "";
    document.getElementById("rubro-descripcion").value = "";
    document.getElementById("titulo-modal-rubro").textContent = "Nuevo Rubro";
    modalRubro.show();
});


async function editarRubro(id) {
    const response = await fetch(`${API}Rubros/${id}`);   // GET api/Rubros/5
    const rubro = await response.json();

    document.getElementById("rubro-id").value = rubro.rubroID;
    document.getElementById("rubro-descripcion").value = rubro.descripcion ?? "";
    document.getElementById("titulo-modal-rubro").textContent = "Editar rubro";
    modalRubro.show();
}

//boton Guardar Rubro (crear o editar rubro)
document.getElementById("btn-guardar-rubro").addEventListener("click", async () => {
    limpiarError("rubro-descripcion");

    const id = document.getElementById("rubro-id").value;
    const descripcion = document.getElementById("rubro-descripcion").value.trim();

    // Validación: descripción no puede estar vacía
    if (descripcion === "") {
        marcarError("rubro-descripcion", "La descripción no puede estar vacía.");
        return; // Detener la ejecución si hay error
    }

    const rubro = {
        descripcion: descripcion,
        eliminado: false
    };

    let response;
    if (id === "") {
        //Crear nuevo rubro
        response = await fetch(`${API}Rubros`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(rubro)
        });
    } else {
        //Editar rubro existente
        rubro.rubroID = parseInt(id); // Convertir el id a entero, SI NO ES ENTERO Y ES 0 ENTONCES NO SE PUEDE EDITAR PORQUE NO EXISTE
        response = await fetch(`${API}Rubros/${id}`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(rubro)
        });
    }

    if (!response.ok) {
        const mensaje = await response.text();
        marcarError("rubro-descripcion", mensaje.replaceAll('"', ''));
        return;   // el modal queda abierto para que corrija
    }

    modalRubro.hide();
    getRubros();// Actualiza la lista de rubros después de guardar
});

function eliminarRubro(id) {
    confirmarEliminar("¿Está seguro de eliminar este rubro?", async () => {
        await fetch(`${API}Rubros/${id}`, {
            method: "DELETE"
        });
        getRubros(); // Actualiza la lista de rubros después de eliminar
    });
}

let productosCache = [];    // productos con su composición adentro


//PRODUCTOS--trae los diferentes productos
async function getProductos() {
    const response = await fetch(`${API}Productos`);
    const productos = await response.json();
    productosCache = productos;


    const tbody = document.getElementById("tbody-productos");
    tbody.innerHTML = ""; // Limpia el contenido previo de la tabla

    productos.forEach(producto => {
        tbody.innerHTML += `
            <tr>
                 <td class="text-center">${producto.productoID}</td>
                 <td>${producto.descripcion ?? ""}</td>
                 <td class="text-end">$${producto.costoTotal.toFixed(2)}</td>
                 <td class="text-end">$${producto.precioVenta.toFixed(2)}</td>
                 <td class="text-end">${producto.porcentajeGanancia.toFixed(2)}%</td>
                 <td class="text-center">
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
    limpiarError("producto-descripcion");
    limpiarError("producto-costo");
    document.getElementById("producto-id").value = "";
    document.getElementById("producto-descripcion").value = "";
    // document.getElementById("producto-costo").value = "";
    document.getElementById("titulo-modal-producto").textContent = "Nuevo Producto";
    modalProducto.show();
});

async function editarProducto(id) {
    const response = await fetch(`${API}Productos/${id}`);   // GET api/Productos/5
    const producto = await response.json();

    document.getElementById("producto-id").value = producto.productoID;
    document.getElementById("producto-descripcion").value = producto.descripcion ?? "";
    document.getElementById("producto-costo").value = producto.costoTotal.toFixed(2);
    document.getElementById("producto-ganancia").value = producto.porcentajeGanancia.toFixed(2);
    document.getElementById("producto-precioVenta").value = producto.precioVenta.toFixed(2);
    document.getElementById("titulo-modal-producto").textContent = "Editar Producto";
    modalProducto.show();
}

//boton Guardar Producto (crear o editar producto)
document.getElementById("btn-guardar-producto").addEventListener("click", async () => {
    const id = document.getElementById("producto-id").value;
    const descripcion = document.getElementById("producto-descripcion").value.trim();
    // const costoTotal = parseFloat(document.getElementById("producto-costo").value);

    // Validación: descripción no puede estar vacía
    if (descripcion === "") {
        marcarError("producto-descripcion", "La descripción es obligatoria");
        return;
    }

    // if (isNaN(costoTotal) || costoTotal <= 0) {
    //     marcarError("producto-costo", "El costo total debe ser mayor a cero");
    //     return;   
    // }

    const producto = {
        descripcion: descripcion,
        porcentajeGanancia: parseFloat(document.getElementById("producto-ganancia").value) || 0,
        precioVenta: parseFloat(document.getElementById("producto-precioVenta").value) || 0,
        eliminado: false
    };
    let response;
    if (id === "") {
        //Crear nuevo producto
        response = await fetch(`${API}Productos`, {
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

// Función para calcular el precio de venta basado en el costo y la ganancia
function calcularPrecioVenta() {
    const costo = parseFloat(document.getElementById("producto-costo").value) || 0;
    const ganancia = parseFloat(document.getElementById("producto-ganancia").value) || 0;

    const precio = costo + (costo * ganancia / 100);
    document.getElementById("producto-precioVenta").value = precio.toFixed(2);
}

//calcular el porcentaje de ganancia basado en el costo y el precio de venta
function calcularPorcentajeGanancia() {
    const precio = parseFloat(document.getElementById("producto-precioVenta").value) || 0;
    const costo = parseFloat(document.getElementById("producto-costo").value) || 0;

    if (costo === 0) {
        document.getElementById("producto-ganancia").value = 0;
        return;   // no se puede sacar un % sobre un costo de cero
    }

    const ganancia = ((precio - costo) / costo) * 100;
    document.getElementById("producto-ganancia").value = ganancia.toFixed(2);
}
document.getElementById("producto-ganancia").addEventListener("input", calcularPrecioVenta);
document.getElementById("producto-precioVenta").addEventListener("input", calcularPorcentajeGanancia);

function eliminarProducto(id) {
    confirmarEliminar("¿Está seguro de eliminar este producto?", async () => {
        await fetch(`${API}Productos/${id}`, { method: "DELETE" });
        getProductos();
    });
}


//MATERIALES 
const modalMaterial = new bootstrap.Modal(document.getElementById("modal-material"));// referencia al modal en este caso modal-material

async function getMateriales() {
    const response = await fetch(`${API}Materiales`);
    const materiales = await response.json();

    const tbody = document.getElementById("tbody-materiales");
    tbody.innerHTML = "";

    materiales.forEach(material => {
        tbody.innerHTML += `
            <tr>
                <td>${material.materialID}</td>
                <td>${material.descripcion ?? ""}</td>
                <td>${material.rubro?.descripcion ?? "-"}</td>
                <td>$${material.precioCosto}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editarMaterial(${material.materialID})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarMaterial(${material.materialID})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>`;
    });
}

// Llena el <select> del modal con los rubros de la API
async function cargarSelectRubros() {
    const response = await fetch(`${API}Rubros`); //solicita los rubros a la API
    const rubros = await response.json(); // Convierte la respuesta en JSON

    const select = document.getElementById("material-rubro");// Obtiene el elemento <select> del modal osea que va a llenar el select con los rubros que trae de la API
    select.innerHTML = "";
    rubros.forEach(rubro => {
        select.innerHTML += `<option value="${rubro.rubroID}">${rubro.descripcion}</option>`;
    });
}

document.getElementById("btn-nuevo-material").addEventListener("click", async () => {
    await cargarSelectRubros();
    document.getElementById("material-id").value = "";
    document.getElementById("material-descripcion").value = "";
    document.getElementById("material-precio").value = "";
    document.getElementById("titulo-modal-material").textContent = "Nuevo Material";
    modalMaterial.show();
});

async function editarMaterial(id) {
    await cargarSelectRubros();
    const response = await fetch(`${API}Materiales/${id}`);
    const material = await response.json();

    document.getElementById("material-id").value = material.materialID;
    document.getElementById("material-descripcion").value = material.descripcion ?? "";
    document.getElementById("material-rubro").value = material.rubroID;   // preselecciona su rubro
    document.getElementById("material-precio").value = material.precioCosto;
    document.getElementById("titulo-modal-material").textContent = "Editar Material";
    modalMaterial.show();
}

document.getElementById("btn-guardar-material").addEventListener("click", async () => {
    const id = document.getElementById("material-id").value;
    const descripcion = document.getElementById("material-descripcion").value.trim();
    const precioCosto = parseFloat(document.getElementById("material-precio").value);

    // Validación: descripción no puede estar vacía
    if (descripcion === "") {
        marcarError("material-descripcion", "La descripción es obligatoria");
        return;
    }
    if (isNaN(precioCosto) || precioCosto <= 0) {
        marcarError("material-precio", "El precio debe ser mayor a cero");
        return;
    }

    const material = {
        descripcion: descripcion,
        rubroID: parseInt(document.getElementById("material-rubro").value),
        precioCosto: precioCosto,
        eliminado: false
    };

    let response;
    if (id === "") {
        response = await fetch(`${API}Materiales`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(material)
        });
    } else {
        material.materialID = parseInt(id);
        response = await fetch(`${API}Materiales/${id}`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(material)
        });
    }

    if (!response.ok) {
        const mensaje = await response.text();
        marcarError("material-descripcion", mensaje.replaceAll('"', ''));
        return;   // el modal queda abierto para que corrija
    }
    modalMaterial.hide();
    getMateriales();
});

function eliminarMaterial(id) {
    confirmarEliminar("¿Está seguro de eliminar este material?", async () => {
        await fetch(`${API}Materiales/${id}`, { method: "DELETE" });
        getMateriales();
    });
}

const modalComposicion = new bootstrap.Modal(document.getElementById("modal-composicion"));

// Abre el modal con la composición que YA tiene el producto
async function abrirComposicion(productoID) {
    document.getElementById("composicion-producto-id").value = productoID;

    const producto = productosCache.find(p => p.productoID === productoID);
    document.getElementById("titulo-modal-composicion").textContent =
        `Composición de: ${producto?.descripcion ?? ""}`;

    await cargarSelectMateriales();
    document.getElementById("composicion-cantidad").value = 1;
    document.getElementById("error-composicion").textContent = "";

    dibujarComposicion(producto?.materiales ?? []);
    modalComposicion.show();
}

// Dibuja la tabla del modal y el costo total
function dibujarComposicion(lista) {
    const tbody = document.getElementById("tbody-composicion");
    tbody.innerHTML = "";

    lista.forEach(mp => {
        tbody.innerHTML += `
            <tr>
                <td>${mp.material?.descripcion ?? "-"}</td>
                <td>${mp.cantidad}</td>
                <td>$${mp.precioCostoUnitario}</td>
                <td>$${mp.subTotal}</td>
            </tr>`;
    });

    const total = lista.reduce((suma, mp) => suma + mp.subTotal, 0);
    document.getElementById("composicion-total").value = total;
}

// Llena el select con los materiales disponibles
async function cargarSelectMateriales() {
    const response = await fetch(`${API}Materiales`);
    const materiales = await response.json();

    const select = document.getElementById("composicion-material");
    select.innerHTML = "";
    materiales.forEach(material => {
        select.innerHTML += `<option value="${material.materialID}">${material.descripcion}</option>`;
    });
}

// AGREGAR = POST inmediato + repintar con la lista que devuelve la API
document.getElementById("btn-agregar-composicion").addEventListener("click", async () => {
    const error = document.getElementById("error-composicion");
    error.textContent = "";

    const productoID = parseInt(document.getElementById("composicion-producto-id").value);
    const materialID = parseInt(document.getElementById("composicion-material").value);
    const cantidad = parseFloat(document.getElementById("composicion-cantidad").value);

    if (isNaN(cantidad) || cantidad <= 0) {
        error.textContent = "La cantidad debe ser mayor a cero";
        return;
    }

    const response = await fetch(`${API}Productos/MaterialProducto`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            productoID: productoID,
            materialID: materialID,
            cantidad: cantidad
            // precio y subtotal NO se mandan: los calcula el servidor
        })
    });

    if (!response.ok) {
        error.textContent = (await response.text()).replaceAll('"', '');
        return;
    }

    const composicionActualizada = await response.json();   // ← la lista que devuelve tu POST
    dibujarComposicion(composicionActualizada);

    document.getElementById("composicion-cantidad").value = 1;
    getProductos();    // refresca la tabla de atrás con el CostoTotal nuevo
});

// Recargar los datos cada vez que se abre una pestaña
document.getElementById("tab-rubros").addEventListener("shown.bs.tab", getRubros);
document.getElementById("tab-materiales").addEventListener("shown.bs.tab", getMateriales);
document.getElementById("tab-productos").addEventListener("shown.bs.tab", getProductos);
// document.getElementById("tab-composicion").addEventListener("shown.bs.tab", getMaterialesProducto);