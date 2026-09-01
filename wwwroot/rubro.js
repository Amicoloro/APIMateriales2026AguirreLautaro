const API = "/api/"; // URL base de la API

//RUBROS--trae los diferentes rubros
async function getRubros() {
    const response = await fetch(`${API}Rubros`);
    const rubros = await response.json(); // Convierte la respuesta en JSON

    const tbody = document. getElementById("tbody-rubros");
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
// getProductos();

//referencia al modal en este caso modal-rubro
const modalRubro = new bootstrap.Modal(document.getElementById("modal-rubro"));

//Boton Agregar Rubro (crear rubro)
document.getElementById("btn-nuevo-rubro").addEventListener("click", () => {
    document.getElementById("rubro-id").value = "";
    document.getElementById("rubro-descripcion").value = "";
    document.getElementById("titulo-modal-rubro").textContent="Nuevo Rubro";
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
    if(descripcion === "") {
        marcarError("rubro-descripcion", "La descripción no puede estar vacía.");
        return; // Detener la ejecución si hay error
    }

    const  rubro = {
        descripcion: descripcion,
        eliminado: false
    };

    let response;
    if (id === "") {
        //Crear nuevo rubro
        response = await fetch (`${API}Rubros`, {
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
        await fetch(`${API}Rubros/${id}`, { method: "DELETE"
        });
         getRubros(); // Actualiza la lista de rubros después de eliminar
    });
}

// Recargar los datos cada vez que se abre una pestaña
document.getElementById("tab-rubros").addEventListener("shown.bs.tab", getRubros);