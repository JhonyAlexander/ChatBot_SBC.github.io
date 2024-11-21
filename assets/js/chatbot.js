// URL base de la API de OpenAI que se utilizará para realizar solicitudes al modelo GPT
const apiUrl = 'https://api.openai.com/v1/chat/completions';

// Clave API para la autenticación con OpenAI. Es importante mantener esta clave segura y no compartirla públicamente.
const llave = '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';

// Contexto inicial que define el propósito del asistente.
// Esto establece un "rol del sistema", es decir, cómo debe comportarse el asistente.
const PREMISE = `
Eres un asistente experto en la Universidad Popular del Cesar seccional Aguachica. 
Tu tarea es orientar a los aspirantes sobre las carreras de pregrado disponibles, requisitos de admisión, procesos de inscripción, y cualquier otra información relevante para los futuros estudiantes. 
Proporciona información precisa y útil para ayudar a los aspirantes a tomar decisiones informadas sobre su educación superior. 
`;

// Lista que mantiene el historial de la conversación. 
// Comienza con un mensaje del sistema que establece el propósito del asistente.
let conversationHistory = [
    { role: 'system', content: PREMISE }
];

// Función que muestra un mensaje inicial del asistente al cargar la página
function showInitialMessage() {
    const messageContainer = document.getElementById("messages"); // Contenedor donde se mostrarán los mensajes.

    // Mensaje de bienvenida que se mostrará al usuario.
    const initialMessage = "¡Hola! Soy un asistente que te ayudará a orientarte sobre los programas de pregrado de la UPC Seccional Aguachica. ¿En qué puedo ayudarte hoy?";

    // Crear un elemento visual en el DOM para el mensaje del bot.
    const botMessageElement = document.createElement("div");
    botMessageElement.className = "message bot-message"; // Clase para estilo de mensajes del bot.
    botMessageElement.innerText = initialMessage; // Contenido del mensaje.
    messageContainer.appendChild(botMessageElement); // Agregar el mensaje al contenedor.
    messageContainer.scrollTop = messageContainer.scrollHeight; // Desplazar el contenedor hacia el final.

    // Agregar este mensaje inicial al historial de la conversación.
    conversationHistory.push({ role: 'assistant', content: initialMessage });
}

// Esta función se ejecuta automáticamente al cargar la página.
window.onload = function() {
    showInitialMessage(); // Llama a la función que muestra el mensaje inicial.
    setupThemeToggle();   // Configura el botón para alternar entre modo claro y oscuro.
};

// Función asíncrona para enviar el mensaje del usuario a la API y recibir una respuesta.
async function getCompletion(prompt) {
    // Agregar el mensaje del usuario al historial de la conversación.
    conversationHistory.push({ role: 'user', content: prompt });

    try {
        // Realizar la solicitud a la API de OpenAI.
        const response = await fetch(apiUrl, {
            method: 'POST', // Método HTTP para enviar datos a la API.
            headers: {
                'Content-Type': 'application/json', // Indica que los datos se envían como JSON.
                'Authorization': `Bearer ${llave}`, // Clave para autenticar la solicitud.
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // Especifica el modelo que se utilizará.
                messages: conversationHistory // Envía todo el historial de la conversación.
            })
        });

        // Verificar si la solicitud fue exitosa.
        if (!response.ok) {
            throw new Error("Error al realizar la solicitud a la API"); // Lanzar un error si algo falla.
        }

        // Procesar la respuesta recibida de la API.
        const data = await response.json(); // Convertir la respuesta en JSON.
        const botMessage = data.choices[0].message.content.trim(); // Obtener el mensaje generado por el bot.

        // Agregar la respuesta del bot al historial de la conversación.
        conversationHistory.push({ role: 'assistant', content: botMessage });

        return botMessage; // Retornar el mensaje generado por el bot.
    } catch (error) {
        console.error("Error durante la llamada a la API:", error); // Registrar errores en la consola.
        throw error; // Volver a lanzar el error para manejarlo más adelante.
    }
}

// Función para enviar un mensaje desde la interfaz de usuario.
function sendMessage() {
    const userInput = document.getElementById("user-input"); // Campo de entrada del usuario.
    const messageContainer = document.getElementById("messages"); // Contenedor de mensajes.

    // Obtener y limpiar el mensaje ingresado por el usuario.
    const userMessage = userInput.value.trim();
    if (userMessage === "") return; // No hacer nada si el mensaje está vacío.

    // Crear un elemento HTML para mostrar el mensaje del usuario.
    const userMessageElement = document.createElement("div");
    userMessageElement.className = "message user-message"; // Clase para estilo de mensajes del usuario.
    userMessageElement.innerText = userMessage;
    messageContainer.appendChild(userMessageElement); // Agregar el mensaje al contenedor.

    // Limpiar el campo de entrada del usuario.
    userInput.value = "";

    // Desplazar el contenedor hacia el final para que el usuario vea el último mensaje.
    messageContainer.scrollTop = messageContainer.scrollHeight;

    // Mostrar un indicador de escritura para simular que el bot está pensando.
    showTypingIndicator();

    // Llamar a la API para obtener una respuesta y manejar la respuesta o errores.
    getCompletion(userMessage)
        .then(function(botMessage) {
            removeTypingIndicator(); // Eliminar el indicador de escritura.
            const botMessageElement = document.createElement("div");
            botMessageElement.className = "message bot-message"; // Estilo para el mensaje del bot.
            botMessageElement.innerText = botMessage;
            messageContainer.appendChild(botMessageElement); // Mostrar la respuesta del bot.
            messageContainer.scrollTop = messageContainer.scrollHeight; // Desplazar el contenedor.
        })
        .catch(function(error) {
            removeTypingIndicator(); // Eliminar el indicador de escritura si ocurre un error.
            const errorMessageElement = document.createElement("div");
            errorMessageElement.className = "message bot-message";
            errorMessageElement.innerText = "Ocurrió un error: " + error.message; // Mostrar mensaje de error.
            messageContainer.appendChild(errorMessageElement);
            messageContainer.scrollTop = messageContainer.scrollHeight;
        });
}

// Función para mostrar un indicador de que el bot está escribiendo.
function showTypingIndicator() {
    const messageContainer = document.getElementById("messages");
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "typing-indicator"; // Clase para el estilo del indicador.
    typingIndicator.innerHTML = '<span></span><span></span><span></span>'; // Animación de puntos.
    messageContainer.appendChild(typingIndicator);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Función para eliminar el indicador de escritura.
function removeTypingIndicator() {
    const typingIndicator = document.querySelector(".typing-indicator");
    if (typingIndicator) {
        typingIndicator.remove(); // Eliminar el indicador del DOM.
    }
}

// Configura el botón para alternar entre modo claro y oscuro.
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle'); // Botón de alternancia.
    const body = document.body;

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode'); // Alternar la clase de modo oscuro en el cuerpo de la página.
        if (body.classList.contains('dark-mode')) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // Cambiar icono al de "sol".
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // Cambiar icono al de "luna".
        }
    });
}

// Escucha eventos de teclado y envía mensajes cuando el usuario presiona "Enter".
document.getElementById("user-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage(); // Llama a la función para enviar el mensaje.
    }
});

// Escucha eventos de clic en el botón de enviar.
document.getElementById("send-button").addEventListener("click", sendMessage);
