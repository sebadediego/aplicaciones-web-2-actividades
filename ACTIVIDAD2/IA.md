# Uso de IA para aclarar conceptos

## Concepto elegido

Gestión de errores en JavaScript con `try/catch`.

## Prompt utilizado

Soy estudiante de nivel terciario y estoy cursando Aplicaciones Web 2.

Estoy trabajando con JavaScript vanilla en el backend usando NodeJS.

Quiero estudiar el concepto de gestión de errores en JavaScript con `try/catch`.

Actuá como profesor/tutor y explicame el tema paso a paso, de manera simple, concreta y resumida.

Quiero entender:
- Qué es `try/catch`.
- Para qué se usa.
- Cómo funciona.
- Qué ocurre cuando se produce un error.
- Un ejemplo básico aplicado a NodeJS.
- Un problema simple y su resolución usando `try/catch`.

Evitá tecnicismos innecesarios y explicalo para un estudiante de nivel básico/intermedio.

## Respuesta de la IA

`try/catch` se utiliza para controlar errores que pueden ocurrir mientras se ejecuta un programa.

El bloque `try` contiene el código que queremos ejecutar. Si dentro de ese bloque ocurre un error, JavaScript deja de ejecutar esa parte y pasa al bloque `catch`.

El bloque `catch` recibe el error y permite mostrar un mensaje o realizar alguna acción sin que el programa termine de forma inesperada.

### Ejemplo básico

```js
try {
    const numero = 10;
    console.log(numero);
} catch (error) {
    console.log("Ocurrió un error");
}


En este caso, como no ocurre ningún error, el programa muestra el número 10.


Ejemplo aplicado a NodeJS
try {
    const contenido = await fs.readFile("usuarios.json", "utf-8");
    console.log(contenido);
} catch (error) {
    console.log("No se pudo leer el archivo");
}

Si el archivo usuarios.json existe, se lee normalmente. Si no existe o ocurre algún problema, el programa entra al bloque catch y muestra un mensaje de error.

Problema simple

El programa necesita leer un archivo que puede no existir.

Resolución

Se utiliza try/catch para intentar leer el archivo y controlar el error en caso de que falle.

En esta actividad, try/catch también se utiliza para controlar posibles errores durante el fetch(), la escritura del archivo y la lectura del JSON.


Eso cumple con la parte de IA de la consigna: elegir un concepto, generar un prompt específico y utilizarlo. :contentReference[oaicite:0]{index=0}

Cuando lo pegues y guardes, seguimos con subir `IA.md` al repo.
