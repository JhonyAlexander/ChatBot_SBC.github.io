const apiUrl = 'https://api.openai.com/v1/chat/completions';

const llave = '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';
const PREMISE = `
Eres un asistente experto en los programas de posgrado de la Universidad Popular del Cesar seccional Aguachica. 
Tu tarea es orientar a los aspirantes sobre los programas de posgrado disponibles, requisitos de admisión, procesos de inscripción, y cualquier otra información relevante para los futuros estudiantes de posgrado. 
Proporciona información precisa y útil para ayudar a los aspirantes a tomar decisiones informadas sobre su educación de posgrado.

**Programas Ofrecidos:**
La seccional Aguachica de la Universidad Popular del Cesar ofrece los siguientes programas de posgrado:

- Especialización en Sistemas Integrados de Gestión

**Requisitos de Inscripción:**
Los aspirantes deben aportar los siguientes documentos al momento de la inscripción:
- Copia del Documento de Identidad.
- Diploma de Pregrado o Acta de Grado.
- Fotografía tipo documento con fondo blanco.

**Pago de Inscripción:**
- El recibo de pago de la inscripción estará disponible para descarga desde el formulario de inscripción.
- Se puede realizar el pago a través de PSE o en los puntos afiliados de Bancolombia.
 
**Proceso de Inscripción:**
- A partir del año 2022, los documentos deben ser aportados de forma virtual al momento de la inscripción.
- Una vez completado el formulario y realizado el pago, el aspirante quedará preinscrito hasta que se valide el pago.
 
**Cambios Recientes:**
- Recuerde incluir los datos de contacto en el formulario para que el coordinador del programa pueda comunicarse con usted.
 
**Nota Importante:** Solo responde preguntas relacionadas con los programas de posgrado, requisitos, inscripción y procesos de la Universidad Popular del Cesar Seccional Aguachica.
`;

let conversationHistory = [
    { role: 'system', content: PREMISE }
];

function showInitialMessage() {
    const messageContainer = document.getElementById("messages");

    const initialMessage = "¡Hola! Soy un asistente que te ayudará a orientarte sobre los programas de posgrado de la UPC Seccional Aguachica. ¿En qué puedo ayudarte hoy?";

    const botMessageElement = document.createElement("div");
    botMessageElement.className = "message bot-message";
    botMessageElement.innerText = initialMessage;
    messageContainer.appendChild(botMessageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;

    conversationHistory.push({ role: 'assistant', content: initialMessage });
}

window.onload = function() {
    showInitialMessage();
    setupThemeToggle();
};

async function getCompletion(prompt) {
    conversationHistory.push({ role: 'user', content: prompt });

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${llave}`,
        
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: conversationHistory
        })
    });

    if (!response.ok) {
        throw new Error("Error al realizar la solicitud a la API");
    }

    const data = await response.json();
    const botMessage = data.choices[0].message.content.trim();

    conversationHistory.push({ role: 'assistant', content: botMessage });

    return botMessage;
}

function sendMessage() {
    const userInput = document.getElementById("user-input");
    const messageContainer = document.getElementById("messages");

    const userMessage = userInput.value.trim();
    if (userMessage === "") return;

    const userMessageElement = document.createElement("div");
    userMessageElement.className = "message user-message";
    userMessageElement.innerText = userMessage;
    messageContainer.appendChild(userMessageElement);

    userInput.value = "";
    messageContainer.scrollTop = messageContainer.scrollHeight;

    showTypingIndicator();

    getCompletion(userMessage)
        .then(function(botMessage) {
            removeTypingIndicator();
            const botMessageElement = document.createElement("div");
            botMessageElement.className = "message bot-message";
            botMessageElement.innerText = botMessage;
            messageContainer.appendChild(botMessageElement);
            messageContainer.scrollTop = messageContainer.scrollHeight;
        })
        .catch(function(error) {
            removeTypingIndicator();
            const errorMessageElement = document.createElement("div");
            errorMessageElement.className = "message bot-message";
            errorMessageElement.innerText = "Ocurrió un error: " + error.message;
            messageContainer.appendChild(errorMessageElement);
            messageContainer.scrollTop = messageContainer.scrollHeight;
        });
}

function showTypingIndicator() {
    const messageContainer = document.getElementById("messages");
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "typing-indicator";
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    messageContainer.appendChild(typingIndicator);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.querySelector(".typing-indicator");
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });
}

document.getElementById("user-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

document.getElementById("send-button").addEventListener("click", sendMessage);