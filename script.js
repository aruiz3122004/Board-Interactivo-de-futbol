const canvas = document.getElementById('campoFutbol');
const ctx = canvas.getContext('2d');

// Lista de futbolistas
const jugadoresNombres = [
    'Jorge Carrascal', 'Santiago Arias', 'Cristian Borja', 'Kevin Castaño', 'Daniel Muñoz',
    'Rafael Santos Borré', 'James Rodriguez', 'Richard Rios', 'Juan Portilla', 'Jhon Lucumí',
    'Johan Mojica', 'Jefferson Lerma', 'Camilo Vargas', 'Jhon Arias', 'Davinson Sanchez',
    'Juan Quintero', 'Carlos Cuesta', 'Luis Diaz', 'Jhon Córdoba', 'David Ospina',
    'Jhon Durán', 'Matheus Uribe'
];

// Lista de jugadores disponibles y en el campo
let jugadoresDisponibles = [...jugadoresNombres];
let jugadoresEnCampo = [];

// Colores para las tarjetas de jugadores
const coloresEquipos = [
    '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE',
    '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE',
    '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740', '#FFAB40',
    '#FF6E40', '#FF3D00', '#8D6E63', '#78909C', '#9E9E9E'
];

// Función para dibujar el campo de fútbol
function dibujarCampo() {
    ctx.fillStyle = '#27ae60'; // Verde césped más vivo
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;

    // Líneas del borde del campo
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

    // Línea del medio campo
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 50);
    ctx.lineTo(canvas.width / 2, canvas.height - 50);
    ctx.stroke();

    // Círculo central
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 70, 0, Math.PI * 2);
    ctx.stroke();

    // Marca de medio campo
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    // Áreas de penalti
    ctx.strokeRect(50, 150, 150, canvas.height - 300);  // Izquierda
    ctx.strokeRect(canvas.width - 200, 150, 150, canvas.height - 300);  // Derecha
    
    // Áreas de meta
    ctx.strokeRect(50, (canvas.height / 2) - 50, 50, 100);  // Izquierda
    ctx.strokeRect(canvas.width - 100, (canvas.height / 2) - 50, 50, 100);  // Derecha
}

// Función para crear la tabla de jugadores disponibles
function crearTablaJugadores() {
    const tableBody = document.getElementById('playersTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    jugadoresDisponibles.forEach((nombre, index) => {
        const row = tableBody.insertRow();
        row.className = 'player-card';
        row.style.backgroundColor = coloresEquipos[index % coloresEquipos.length];
        row.style.backgroundImage = 'linear-gradient(to right, ' + 
            coloresEquipos[index % coloresEquipos.length] + ' 0%, ' +
            darkenColor(coloresEquipos[index % coloresEquipos.length], 20) + ' 100%)';
        
        const cell = row.insertCell(0);
        cell.textContent = nombre;
        cell.className = 'player-name';
        cell.setAttribute('draggable', 'true');
        cell.setAttribute('data-id', index);

        // Evento para arrastrar jugador
        cell.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('playerName', nombre);
            e.dataTransfer.setData('playerIndex', jugadoresDisponibles.indexOf(nombre));
        });
    });
}

// Función para oscurecer un color (para gradientes)
function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (
        0x1000000 +
        (R < 0 ? 0 : R) * 0x10000 +
        (G < 0 ? 0 : G) * 0x100 +
        (B < 0 ? 0 : B)
    ).toString(16).slice(1);
}

let jugadorSeleccionado = null;
let offsetX = 0;
let offsetY = 0;


// Función para dibujar los jugadores en el campo (actualizada)
function dibujarJugadores() {
    jugadoresEnCampo.forEach((jugador, index) => {
        ctx.save();
        ctx.translate(jugador.x, jugador.y);
        ctx.rotate(jugador.rotation);

        // Dibujar tarjeta del jugador (mejorada)
        ctx.beginPath();
        ctx.roundRect(-25, -25, 50, 50, 8);
        ctx.fillStyle = jugador.color;
        ctx.fill();
        
        // Borde con efecto de profundidad
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Número del jugador (más visible)
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((index + 1).toString(), 0, 0);

        // Nombre abreviado (solo visible cuando no se está arrastrando)
        if (jugador !== jugadorSeleccionado) {
            ctx.font = '9px Arial';
            const nombreAbreviado = obtenerNombreAbreviado(jugador.nombre);
            ctx.fillText(nombreAbreviado, 0, 18);
        }

        ctx.restore();
    });
}

function obtenerNombreAbreviado(nombreCompleto) {
    const partes = nombreCompleto.split(' ');
    return partes.length > 1 ? 
        partes[0].charAt(0) + '. ' + partes[partes.length - 1] : 
        nombreCompleto;
}

// Sistema de arrastre mejorado
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Buscar jugador clickeado (de atrás hacia adelante)
    for (let i = jugadoresEnCampo.length - 1; i >= 0; i--) {
        const jugador = jugadoresEnCampo[i];
        const dx = mouseX - jugador.x;
        const dy = mouseY - jugador.y;
        const distancia = dx * dx + dy * dy;
        
        if (distancia <= 625) { // Radio de 25px
            jugadorSeleccionado = jugador;
            offsetX = dx;
            offsetY = dy;
            
            // Mover el jugador al final del array para que se dibuje encima
            jugadoresEnCampo.splice(i, 1);
            jugadoresEnCampo.push(jugadorSeleccionado);
            
            canvas.style.cursor = 'grabbing';
            actualizarJuego();
            break;
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (jugadorSeleccionado) {
        const rect = canvas.getBoundingClientRect();
        jugadorSeleccionado.x = e.clientX - rect.left - offsetX;
        jugadorSeleccionado.y = e.clientY - rect.top - offsetY;
        
        // Limitar al área del campo
        jugadorSeleccionado.x = Math.max(30, Math.min(canvas.width - 30, jugadorSeleccionado.x));
        jugadorSeleccionado.y = Math.max(30, Math.min(canvas.height - 30, jugadorSeleccionado.y));
        
        actualizarJuego();
    }
});

canvas.addEventListener('mouseup', () => {
    if (jugadorSeleccionado) {
        jugadorSeleccionado = null;
        canvas.style.cursor = 'default';
    }
});

canvas.addEventListener('mouseleave', () => {
    if (jugadorSeleccionado) {
        jugadorSeleccionado = null;
        canvas.style.cursor = 'default';
        actualizarJuego();
    }
});

// Función para manejar el evento de soltar jugador en el campo
canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
});

canvas.addEventListener('drop', (e) => {
    e.preventDefault();

    const playerName = e.dataTransfer.getData('playerName');
    const playerIndex = parseInt(e.dataTransfer.getData('playerIndex'));

    // Añadir el jugador al campo
    jugadoresEnCampo.push({
        nombre: playerName,
        x: e.offsetX,
        y: e.offsetY,
        rotation: 0,
        color: coloresEquipos[jugadoresDisponibles.indexOf(playerName) % coloresEquipos.length],
        originalIndex: playerIndex
    });

    // Eliminar el jugador de la lista de disponibles
    jugadoresDisponibles = jugadoresDisponibles.filter(name => name !== playerName);

    // Actualizar la visualización
    actualizarJuego();
});

// Función para mover un jugador en el campo
let selectedPlayer = null;

canvas.addEventListener('mousedown', (e) => {
    // Buscar si se hizo clic en un jugador
    selectedPlayer = jugadoresEnCampo.find(jugador => {
        const dx = e.offsetX - jugador.x;
        const dy = e.offsetY - jugador.y;
        return dx * dx + dy * dy <= 900; // Radio de 30px
    });

    if (selectedPlayer) {
        selectedPlayer.dragging = true;
        canvas.style.cursor = 'grabbing';
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (selectedPlayer && selectedPlayer.dragging) {
        selectedPlayer.x = e.offsetX;
        selectedPlayer.y = e.offsetY;
        actualizarJuego();
    }
});

canvas.addEventListener('mouseup', () => {
    if (selectedPlayer) {
        selectedPlayer.dragging = false;
        selectedPlayer = null;
        canvas.style.cursor = 'default';
    }
});

// Función para rotar un jugador con doble clic
canvas.addEventListener('dblclick', (e) => {
    const clickedPlayer = jugadoresEnCampo.find(jugador => {
        const dx = e.offsetX - jugador.x;
        const dy = e.offsetY - jugador.y;
        return dx * dx + dy * dy <= 900; // Radio de 30px
    });

    if (clickedPlayer) {
        clickedPlayer.rotation += Math.PI / 2;
        actualizarJuego();
    }
});

// Función para eliminar un jugador del campo y devolverlo a la lista
function eliminarJugador(index) {
    if (index >= 0 && index < jugadoresEnCampo.length) {
        const jugador = jugadoresEnCampo[index];
        jugadoresDisponibles.push(jugador.nombre);
        jugadoresEnCampo.splice(index, 1);
        actualizarJuego();
    }
}

// Función para borrar todos los jugadores del campo
document.getElementById('resetButton').addEventListener('click', () => {
    jugadoresDisponibles = [...jugadoresNombres];
    jugadoresEnCampo = [];
    actualizarJuego();
});

// Función para actualizar todo el juego
function actualizarJuego() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dibujarCampo();
    dibujarJugadores();
    crearTablaJugadores();
    
    // Actualizar eventos de los botones de eliminar
    document.querySelectorAll('.delete-btn').forEach((btn, index) => {
        btn.onclick = () => eliminarJugador(index);
    });
}

// Inicializar el juego
function inicializarJuego() {
    // Configurar el canvas para que sea responsive
    function resizeCanvas() {
        const container = document.getElementById('gameArea');
        canvas.width = container.offsetWidth - 40;
        canvas.height = Math.min(600, window.innerHeight - 200);
        actualizarJuego();
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}

inicializarJuego();










