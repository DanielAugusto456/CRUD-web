const API_URL = '/users';

// Obtener y mostrar todos los usuarios
async function cargarUsuarios() {
    const response = await fetch(API_URL);
    const usuarios = await response.json();
    
    const container = document.getElementById('usuarios');
    container.innerHTML = '';
    
    usuarios.forEach(usuario => {
        container.innerHTML += `
            <div class="usuario">
                <strong>ID:</strong> ${usuario.id}<br>
                <strong>Nombre:</strong> ${usuario.nombre}<br>
                <strong>Email:</strong> ${usuario.email}<br>
                <strong>Edad:</strong> ${usuario.edad}<br>
                <strong>Activo:</strong> ${usuario.activo ? 'Sí' : 'No'}<br>
                <button onclick="editarUsuario(${usuario.id})">Editar</button>
                <button onclick="eliminarUsuario(${usuario.id})">Eliminar</button>
            </div>
        `;
    });
}

// Crear usuario
document.getElementById('usuarioForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        edad: parseInt(document.getElementById('edad').value),
        activo: document.getElementById('activo').value === 'true'
    };
    
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
    });
    
    cargarUsuarios(); 
    e.target.reset();
});

// Eliminar usuario
async function eliminarUsuario(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    cargarUsuarios();
}

// Editar usuario
async function editarUsuario(id) {
    const nuevoNombre = prompt('Nuevo nombre:');
    if (nuevoNombre) {
        const usuario = {
            nombre: nuevoNombre,
            email: prompt('Nuevo email:'),
            edad: parseInt(prompt('Nueva edad:')),
            activo: confirm('¿Activo?')
        };
        
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuario)
        });
        
        cargarUsuarios();
    }
}

cargarUsuarios();