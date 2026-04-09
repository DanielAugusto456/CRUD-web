// Inizialización de la API
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// manejar el frontend
app.use(express.static('public'));

const archivoUsuarios = path.join(__dirname, 'datos', 'usuarios.json');

async function inicializarArchivo() {
    try {
        await fs.access(archivoUsuarios);
        console.log('Archivo usuarios.json ya existe');
    } catch (error) {
        await fs.mkdir(path.dirname(archivoUsuarios), { recursive: true });
        await fs.writeFile(archivoUsuarios, JSON.stringify([], null, 2));
        console.log('Archivo usuarios.json creado con array vacío');
    }
}

// Rutas:
// Crear un nuevo usuario, POST users
app.post("/users", async (req, res) => {
  try {

    // Datos del body
    const { nombre, email, edad, activo } = req.body;
    
    // Validaciones
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ 
        error: "El nombre es obligatorio", 
      });
    }
    
    if (!email.includes("@") || !email.includes(".")) {
        return res.status(400).json({ 
        error: "El email es invalido, por favor seguir el formato: 'nombre@gmail.com'", 
      });
    }
    
    if (!edad || edad <= 0) {
        return res.status(400).json({ 
        error: "La edad debe ser mayor a 0", 
      });
    }
    
    if (typeof activo !== "boolean") {
        return res.status(400).json({ 
        error: "El campo activo debe ser true o false", 
      });
    }
    
    // Leer usuarios actuales del archivo JSON
    const data = await fs.readFile(archivoUsuarios, "utf8");
    const usuarios = JSON.parse(data);
    
    // Generar nuevo id
    let nuevoId;

    if (usuarios.length > 0) {
        nuevoId = Math.max(...usuarios.map(u => u.id)) + 1;
    } else {
        nuevoId = 1;
    }
    
    // Crear nuevo usuario
    const nuevoUsuario = {
      id: nuevoId,
      nombre: nombre.trim(),
      email: email.trim(),
      edad: Number(edad),
      activo: activo
    };
    usuarios.push(nuevoUsuario);
    
    // Guardar en el archivo JSON
    await fs.writeFile(archivoUsuarios, JSON.stringify(usuarios, null, 2));
    res.status(201).json(nuevoUsuario);
    
  } catch (error) {
    console.error("Error en POST /users:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Buscar los usuarios, GET users
app.get("/users", async (req, res) => {
  try {
    // Leer JSON
    const data = await fs.readFile(archivoUsuarios, "utf8");
    
    const usuarios = JSON.parse(data);
    
    // Devolver datos usuarios
    res.status(200).json(usuarios);
  }
  catch (error) {
    console.error("Error en GET /users:", error);
    res.status(404).json({ error: "Error al leer los usuarios" });
  }
});

// Buscar usuario por id, GET users/id
app.get("/users/:id", async (req, res) => {
  try {
    // Obtener el id de los parámetros
    const id = parseInt(req.params.id);
    
    // Validar el id 
    if (isNaN(id)) {
      return res.status(400).json({ error: "El ID debe ser un número válido" });
    }
    
    const data = await fs.readFile(archivoUsuarios, "utf8");
    const usuarios = JSON.parse(data);
    
    // Buscar el usuario
    const usuario = usuarios.find(u => u.id === id);
    
    if (!usuario) {
      return res.status(404).json({ error: `Usuario con ID ${id} no encontrado` });
    }
    
    res.status(200).json(usuario);
    
  } catch (error) {
    console.error("Error en GET /users/:id:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Actualizar un usuario existente, PUT users/id
app.put("/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "El ID debe ser un número válido" });
    }
    
    const { nombre, email, edad, activo } = req.body;
    // Validaciones
    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({ 
        error: "El nombre es obligatorio", 
      });
    }
    
    if (!email.includes("@") || !email.includes(".")) {
        return res.status(400).json({ 
        error: "El email es invalido, por favor seguir el formato: 'nombre@gmail.com'", 
      });
    }
    
    if (!edad || edad <= 0) {
        return res.status(400).json({ 
        error: "La edad debe ser mayor a 0", 
      });
    }

    if (typeof activo !== "boolean") {
        return res.status(400).json({ 
        error: "El campo activo debe ser true o false", 
      });
    }
    const data = await fs.readFile(archivoUsuarios, "utf8");
    const usuarios = JSON.parse(data);
    
    // Buscar el índice del usuario a actualizar
    const indice = usuarios.findIndex(u => u.id === id);
    
    if (indice === -1) {
      return res.status(404).json({ error: `Usuario con ID ${id} no encontrado` });
    }
    
    // Actualizar el usuario
    usuarios[indice] = {
      id: id,  
      nombre: nombre.trim(),
      email: email.trim(),
      edad: Number(edad),
      activo: activo
    };
    await fs.writeFile(archivoUsuarios, JSON.stringify(usuarios, null, 2));
    
    res.status(200).json(usuarios[indice]);
    
  } catch (error) {
    console.error("Error en PUT /users/:id:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Eliminar un usuario,  DELETE users/id
app.delete("/users/:id", async (req, res) => {
  try {

    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "El ID debe ser un número válido" });
    }
    
    const data = await fs.readFile(archivoUsuarios, "utf8");
    const usuarios = JSON.parse(data);
    
    const indice = usuarios.findIndex(u => u.id === id);
    
    if (indice === -1) {
      return res.status(404).json({ error: `Usuario con ID ${id} no encontrado` });
    }
    
    // Guardar el usuario eliminado para responder
    const usuarioEliminado = usuarios[indice];
    
    // Eliminar el usuario del array
    usuarios.splice(indice, 1);
    
    await fs.writeFile(archivoUsuarios, JSON.stringify(usuarios, null, 2));
    
    res.status(200).json({ 
      mensaje: `Usuario con ID ${id} eliminado correctamente`,
      usuarioEliminado: usuarioEliminado
    });
    
  } catch (error) {
    console.error("Error en DELETE /users/:id:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Iniciar server
inicializarArchivo().then(() => {
    app.listen(port, () => {
        console.log(`Servidor en http://localhost:${port}`);
    });
});