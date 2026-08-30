import { obtenerUsuarios } from "./modules/usuarios.mjs";
import { guardarUsuarios, leerUsuarios } from "./modules/archivos.mjs";

try {
    const usuarios = await obtenerUsuarios();

    await guardarUsuarios(usuarios);

    console.log("Archivo usuarios.json guardado correctamente");

    const usuariosLeidos = await leerUsuarios();

    console.log(usuariosLeidos);

} catch (error) {
    console.error("Ocurrió un error:", error.message);
}