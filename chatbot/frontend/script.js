(function() {
  // DOM references
  const messagesContainer = document.getElementById('chatMessages');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');

  // Helper: add message
  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    if (sender === 'bot') {
      avatar.innerHTML = '<i class="fas fa-robot"></i>';
    } else {
      avatar.innerHTML = '<i class="fas fa-user"></i>';
    }

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Typing indicator
  function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
      <div class="avatar"><i class="fas fa-robot"></i></div>
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function removeTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
  }

  // Send message to backend
  async function sendMessageToBackend(userMessage) {
    try {
      const API_URL = 'http://127.0.0.1:5000/chat';
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      return data.reply || "I'm not sure how to respond to that 🤔";
    } catch (error) {
      console.warn('Backend unreachable, using fallback replies.', error);
      return getFallbackReply(userMessage);
    }
  }

  // Fallback replies (when backend is down)
  function getFallbackReply(msg) {
    const lower = msg.toLowerCase();
    if (lower.includes('hello') || lower.includes('hi')) return 'Hello! Nice to meet you 😊';
    if (lower.includes('how are you')) return "I'm just a bot, but I'm functioning perfectly!";
    if (lower.includes('weather')) return "I don't have live weather data, but it's always sunny in my server ☀️";
    if (lower.includes('bye')) return 'Goodbye! Come back anytime.';
    if (lower.includes('name')) return "I'm Nova, your friendly chat assistant.";
    return `I received: "${msg}" — but my Python backend isn't running. Start it with "python app.py"`;
  }

  // Handle user message
  async function handleUserMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    userInput.value = '';
    userInput.disabled = true;
    sendBtn.disabled = true;

    addMessage(text, 'user');
    showTyping();

    const reply = await sendMessageToBackend(text);

    removeTyping();
    addMessage(reply, 'bot');

    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();
  }

  // Event listeners
  sendBtn.addEventListener('click', handleUserMessage);

  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserMessage();
    }
  });

  window.addEventListener('load', () => {
    userInput.focus();
  });
})();