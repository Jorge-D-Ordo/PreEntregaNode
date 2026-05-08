const URL_BASE = "https://fakestoreapi.com";
const [, , metodo, endpoint, ...parametros] = process.argv; // destructurando y tomando lo neceario
const argumentosPermitidos = ["GET", "POST", "PUT", "DELETE"];


// Funciones de cosnsultas de productos

async function crearProducto(titulo, precio, categoria) {
  try {
    const rta = await fetch(`${URL_BASE}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: titulo,
        price: Number(precio),
        category: categoria,
      }),
    });
    if (!rta.ok) throw new Error(`Producto no fue agregado`);
    const data = await rta.json();
    console.log("Producto creado:");
    console.table([
       {
        id: data.id,
        producto: data.title,
        precio: data.price,
        categoria: data.category,
       }
      ]);
  } catch (error) {
    console.error("Error al crear producto:", error.message);
  }
}

async function obtenerTodosLosProductos() {
  try {
    const rta = await fetch(`${URL_BASE}/products`);
    if (rta.status !== 200)
      throw new Error(`Falla en la solicitud ${rta.status}`);
    const datos = await rta.json();
    console.log("Listado de productos :");
    console.table(
      datos.map(({ id, title, price, category }) => ({
        id,
        producto: title,
        precio: price,
        categoria: category,
      })),
    );
  } catch (error) {
    console.error("Error al obtener productos:", error.message);
  }
}

async function obtenerProductoPorId(id) {
  try {
    const rta = await fetch(`${URL_BASE}/products/${id}`);
    if (!rta.ok) throw new Error(`Producto con ID ${id} no encontrado`);
    const datos = await rta.json();
    console.log("Producto :");
    console.table([
      {
        id: datos.id,
        producto: datos.title,
        precio: datos.price,
        categoria: datos.category,
      },
    ]);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function eliminarProducto(id) {
  try {
    const rta = await fetch(`${URL_BASE}/products/${id}`, { method: "DELETE" });
    const datos = await rta.json();
    console.log("Producto eliminado:");
    console.table([
      {
        id: datos.id,
        producto: datos.title,
        precio: datos.price,
        categoria: datos.category,
      },
    ]);
  } catch (error) {
    console.error("Error al eliminar producto:", error.message);
  }
}

async function actualizarProducto(id, titulo, precio, categoria) {
  try {
    const rtaAnt = await fetch(`${URL_BASE}/products/${id}`);
    if (!rtaAnt.ok) throw new Error(`Producto con ID ${id} no encontrado`);
    const productoAnt = await rtaAnt.json();

    const datosActualizados = {
      title: titulo === "*" ? productoAnt.title : titulo,
      price: precio === "*" ? productoAnt.price : Number(precio),       
      category: categoria === "*" ? productoAnt.category : categoria,
     };
   
    const rta = await fetch(`${URL_BASE}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosActualizados),
    });

    if (!rta.ok) throw new Error(`Producto con ID ${id} no pudo ser actualizado`);

    const productoActualizado  = await rta.json();
    console.log("Producto actualizado correctamente:");
    console.table([
       {
        id: productoActualizado.id,
        producto: productoActualizado.title,
        precio: productoActualizado.price,
        categoria: productoActualizado.category,
       }
      ]);
  } catch (error) {
    console.error("Error al actualizar producto:", error.message);
  }
}

// Codigo principal

(async () => {
  console.clear();  
  console.log("Iniciando Programa\n\n");
  const metodoMayuscula = metodo.toUpperCase();
  if (!endpoint || !argumentosPermitidos.includes(metodoMayuscula)) {
    console.log(`⚠️ Comando incompleto o inválido. Comandos posibles:
         Crear      un producto nuevo:   npm run start POST products <titulo> <precio> <categoria>
         Consultar  todos los productos: npm run start GET products
         Consultar  un producto por ID:  npm run start GET products/<idProducto>
         Eliminar   un producto por ID:  npm run start DELETE products/<idProducto>
         Actualizar un producto :        npm run start PUT products/<idProducto> <titulo> <precio> <categoria>
                    NOTA: introducir * para mentieer el valor anterior de <titulo> <precio> <categoria>`);
    return;
  }
  switch (metodoMayuscula) {
    case "GET":
      if (endpoint === "products") {
        await obtenerTodosLosProductos();
      } else if (endpoint.startsWith("products/")) {
        const id = endpoint.split("/")[1];
        if (!id) return console.error("Debe especificar un productId");
        await obtenerProductoPorId(id);
      } else {
        console.error("Endpoint GET inválido");
      }
      break;

    case "POST":
      if (endpoint === "products") {
        const [titulo, precio, categoria] = parametros;
        if (!titulo || !precio || !categoria) {
          return console.error(
            "Uso: npm run start POST products <titulo> <precio> <categoria>",
          );
        }
        await crearProducto(titulo, precio, categoria);
      } else {
        console.error("Endpoint POST inválido");
      }
      break;

    case "DELETE":
      if (endpoint.startsWith("products/")) {
        const id = endpoint.split("/")[1];
        if (!id) return console.error("Debe especificar el Id del producto a eliminar");
        await eliminarProducto(id);
      } else {
        console.error("Endpoint DELETE inválido");
      }
      break;

    case "PUT":
      if (endpoint.startsWith("products/")) {
        const id = endpoint.split("/")[1];
        if (!id) return console.error("Debe especificar el Id de producto a actualizar");

        const [titulo, precio, categoria] = parametros;
        await actualizarProducto(id, titulo, precio, categoria);
      } else {
        console.error("Endpoint PUT inválido");
      }
      break;

    default:
      console.error("Método HTTP no soportado. Usa GET, POST, PUT o DELETE");
  }
})();
