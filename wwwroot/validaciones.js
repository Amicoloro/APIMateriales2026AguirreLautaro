function marcarError(idCampo, mensaje) {
    document.getElementById(idCampo).classList.add("is-invalid");
    document.getElementById("error-" + idCampo).textContent = mensaje;
}

function limpiarError(idCampo) {
    document.getElementById(idCampo).classList.remove("is-invalid");
}

// Guarda "lo que hay que hacer si el usuario confirma"
let accionConfirmada = null;
const modalConfirmar = new bootstrap.Modal(document.getElementById("modal-confirmar"));

// Abre el modal con un mensaje y recuerda la acción a ejecutar
function confirmarEliminar(mensaje, accion) {
    document.getElementById("confirmar-mensaje").textContent = mensaje;
    accionConfirmada = accion;
    modalConfirmar.show();
}

// El botón rojo del modal ejecuta la acción recordada
document.getElementById("btn-confirmar-eliminar").addEventListener("click", async () => {
    modalConfirmar.hide();
    if (accionConfirmada) await accionConfirmada();
});