import fs from "fs/promises";
import path from "path";

const rutaArchivo = path.join(process.cwd(), "usuarios.json");

export async function guardarUsuarios(usuarios) {
    await fs.writeFile(
        rutaArchivo,
        JSON.stringify(usuarios, null, 2)
    );
}

export async function leerUsuarios() {
    const contenidoArchivo = await fs.readFile(rutaArchivo, "utf-8");

    return JSON.parse(contenidoArchivo);
}