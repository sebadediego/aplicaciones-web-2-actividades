const mensajes = {
    datosinvalidos: 'Completá el usuario y una contraseña de al menos 8 caracteres y hasta 72 bytes.',
    usuarioexistente: 'Ese usuario ya está registrado.',
    usuarioregistrado: 'Usuario registrado. Ya podés iniciar sesión.',
    usuarioincorrecto: 'Usuario o contraseña incorrectos.',
    autorizado: 'Iniciá sesión para acceder al administrador.'
}
const parametros = new URLSearchParams(location.search)
for (const [clave, texto] of Object.entries(mensajes)) {
    if (parametros.has(clave)) document.getElementById('mensaje').textContent = texto
}
