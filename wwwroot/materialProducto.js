const API = "/api/"; // URL base de la API

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
