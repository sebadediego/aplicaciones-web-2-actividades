async function obtenerDatos() {

    const contenedor = document.getElementById("contenedor");

    try {

        const respuesta = await fetch("recursos/datos/productos.json");

        if (respuesta.ok) {

            const productos = await respuesta.json();

            contenedor.innerHTML = "";

            for (let i = 0; i < productos.length; i++) {

                contenedor.innerHTML += `
                    <article class="producto">
                        <h3 class="nombre">${productos[i].nombre}</h3>
                        <data class="precio" value="${productos[i].precio}">
                            Precio: $${productos[i].precio}
                        </data>
                        <data class="stock" value="${productos[i].stock}">
                            Stock: ${productos[i].stock}
                        </data>
                    </article>
                `;
            }

            alert("Los datos se cargaron correctamente");

        } else {

            alert("No se pudieron cargar los datos");

        }

    } catch (error) {

        alert("Ocurrió un error al cargar los datos");

        console.log(error);
    }
}

obtenerDatos();