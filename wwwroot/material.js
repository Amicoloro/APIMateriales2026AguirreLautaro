const API = "/api/"; // URL base de la API

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
// Recargar los datos cada vez que se abre una pestaña
document.getElementById("tab-materiales").addEventListener("shown.bs.tab", getMateriales);