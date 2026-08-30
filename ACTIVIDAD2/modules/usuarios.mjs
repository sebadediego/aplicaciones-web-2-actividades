export async function obtenerUsuarios() {
    const respuesta = await fetch("https://api.escuelajs.co/api/v1/users");

    const usuarios = await respuesta.json();

    const usuariosFormateados = usuarios.map(usuario => {
        return {
            id: usuario.id,
            email: usuario.email,
            name: usuario.name
        };
    });

    return usuariosFormateados;
}