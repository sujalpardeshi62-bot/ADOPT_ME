/* Frontend rule-based chatbot - Luffy AI for AdoptMe */

(function () {
  const chatbotHTML = `
    <div class="chatbot-widget" id="chatbotWidget">
      <button class="chatbot-fab adoptme-chatbot-fab" id="chatbotToggle" aria-label="Open chatbot">
        <span class="chatbot-logo-wrap">
          <span class="chatbot-logo-icon">🐾</span>
          <span class="chatbot-logo-text">Luffy AI</span>
        </span>
      </button>

      <div class="chatbot-window" id="chatbotWindow">
        <div class="chatbot-header">
          <div class="chatbot-header-brand">
            <div class="chatbot-header-logo">🐾</div>
            <div>
              <h3>Luffy AI</h3>
              <small>AdoptMe Smart Assistant</small>
            </div>
          </div>
          <div class="chatbot-actions-top">
            <button id="chatbotClear" title="Clear chat">🗑</button>
            <button id="chatbotClose" title="Close chat">✕</button>
          </div>
        </div>

        <div class="chatbot-quick-actions">
          <button class="quick-chat-btn" data-action="Adopt a Pet">Adopt a Pet</button>
          <button class="quick-chat-btn" data-action="Donate">Donate</button>
          <button class="quick-chat-btn" data-action="Volunteer">Volunteer</button>
          <button class="quick-chat-btn" data-action="Contact">Contact</button>
        </div>

        <div class="chatbot-messages" id="chatbotMessages"></div>

        <form class="chatbot-input-area" id="chatbotForm">
          <input type="text" id="chatbotInput" placeholder="Ask Luffy AI anything..." autocomplete="off" />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  `;

  function getTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function getBotReply(message) {
    const msg = message.toLowerCase();

    if (msg.includes("how to adopt") || msg.includes("adopt")) {
      return "To adopt a pet:\n1. Go to the Adopt page\n2. Choose your pet\n3. Fill the adoption form\n4. Wait for approval 🐾";
    }

    if (msg.includes("how to donate") || msg.includes("donate")) {
      return "To donate:\n1. Visit the Donate page\n2. Enter your details and amount\n3. Submit the form\nYour support helps rescue more pets 💛";
    }

    if (msg.includes("how to volunteer") || msg.includes("volunteer")) {
      return "To volunteer:\n1. Open the Volunteer page\n2. Fill in your skills and availability\n3. Submit your registration\nWe’ll save your details locally for demo purposes 🤝";
    }

    if (msg.includes("where are you located") || msg.includes("location")) {
      return "We are located at 24 Rescue Street, Pet City. You can also explore events and rescue activities through the platform.";
    }

    if (msg.includes("show pets") || msg.includes("pets")) {
      return "You can see available pets on the Adopt page. Use filters by species, age, and location to find your best match.";
    }

    if (msg.includes("contact support") || msg.includes("contact")) {
      return "You can contact support via:\nEmail: support@adoptme.local\nPhone: +1 (555) 123-PAWS\nWe’re here to help 🐶";
    }

    if (msg.includes("hello") || msg.includes("hi")) {
      return "Hello! I'm Luffy AI 🐾 Your AdoptMe assistant. How can I help you today?";
    }

    return "I can help with adoption, donation, volunteering, rescue, pets, and contact support. Try asking: 'How to adopt?'";
  }

  function appendMessage(container, text, type) {
    const msg = document.createElement("div");
    msg.className = `chat-msg ${type}`;
    msg.innerHTML = `${text.replace(/\n/g, "<br>")}<small>${getTime()}</small>`;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }

    function initScrollButtons() {
    const topBtn = document.getElementById("backToTopBtn");
    const bottomBtn = document.getElementById("backToBottomBtn");

    function toggleButtons() {
      if (!topBtn || !bottomBtn) return;

      const scrollable = document.documentElement.scrollHeight > window.innerHeight + 50;

      if (scrollable) {
        topBtn.classList.add("show");
        bottomBtn.classList.add("show");
      } else {
        topBtn.classList.remove("show");
        bottomBtn.classList.remove("show");
      }
    }

    if (topBtn) {
      topBtn.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });
    }

    if (bottomBtn) {
      bottomBtn.addEventListener("click", () => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth"
        });
      });
    }

    window.addEventListener("scroll", toggleButtons);
    window.addEventListener("resize", toggleButtons);
    setTimeout(toggleButtons, 100);
  }
  
  function initChatbot() {
    const root = document.getElementById("chatbot-root");
    if (!root) return;

    root.innerHTML = chatbotHTML;

    const toggle = document.getElementById("chatbotToggle");
    const close = document.getElementById("chatbotClose");
    const clear = document.getElementById("chatbotClear");
    const windowEl = document.getElementById("chatbotWindow");
    const form = document.getElementById("chatbotForm");
    const input = document.getElementById("chatbotInput");
    const messages = document.getElementById("chatbotMessages");
    const quickButtons = document.querySelectorAll(".quick-chat-btn");

    appendMessage(messages, "Hi! I'm Luffy AI 🐾 Ask me how to adopt, donate, volunteer, or contact support.", "bot");

    toggle.addEventListener("click", () => {
      windowEl.classList.toggle("show");
    });

    close.addEventListener("click", () => {
      windowEl.classList.remove("show");
    });

    clear.addEventListener("click", () => {
      messages.innerHTML = "";
      appendMessage(messages, "Chat cleared. How can I help you now? 🐾", "bot");
    });

    function handleUserMessage(text) {
      if (!text.trim()) return;
      appendMessage(messages, text, "user");
      input.value = "";

      const typing = document.createElement("div");
      typing.className = "chat-msg bot";
      typing.innerHTML = `Luffy AI is typing...<small>${getTime()}</small>`;
      messages.appendChild(typing);
      messages.scrollTop = messages.scrollHeight;

      setTimeout(() => {
        typing.remove();
        const reply = getBotReply(text);
        appendMessage(messages, reply, "bot");
      }, 1000);
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleUserMessage(input.value);
    });

    quickButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;

        if (action === "Adopt a Pet") {
          handleUserMessage("How to adopt?");
        } else if (action === "Donate") {
          handleUserMessage("How to donate?");
        } else if (action === "Volunteer") {
          handleUserMessage("How to volunteer?");
        } else if (action === "Contact") {
          handleUserMessage("Contact support");
        }
      });
    });

    initScrollButtons();
  }

  document.addEventListener("DOMContentLoaded", initChatbot);
})();