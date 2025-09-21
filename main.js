// Import the Gradio client using unpkg CDN
import { Client } from "https://unpkg.com/@gradio/client@1.6.0/dist/index.js";

let gradioClient = null;
let isTyping = false;

// Typing animation class
class TypingAnimation {
  constructor(element, texts, options = {}) {
    this.element = element;
    this.texts = texts;
    this.textIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.typeSpeed = options.typeSpeed || 60;
    this.deleteSpeed = options.deleteSpeed || 30;
    this.pauseTime = options.pauseTime || 800;
    
    this.type();
  }

  type() {
    const currentText = this.texts[this.textIndex];
    const cursor = '<span class="cursor"></span>';

    if (this.isDeleting) {
      this.element.innerHTML = currentText.substring(0, this.charIndex - 1) + cursor;
      this.charIndex--;
    } else {
      this.element.innerHTML = currentText.substring(0, this.charIndex + 1) + cursor;
      this.charIndex++;
    }

    let speed = this.isDeleting ? this.deleteSpeed : this.typeSpeed;

    if (!this.isDeleting && this.charIndex === currentText.length) {
      speed = this.pauseTime;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.textIndex = (this.textIndex + 1) % this.texts.length;
    }

    setTimeout(() => this.type(), speed);
  }
}

// Loading screen management
function showLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  const mainContent = document.getElementById('mainContent');
  
  if (loadingScreen && mainContent) {
    loadingScreen.classList.remove('hidden');
    mainContent.classList.remove('visible');
  }
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  const mainContent = document.getElementById('mainContent');
  
  if (loadingScreen && mainContent) {
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      mainContent.classList.add('visible');
    }, 2500); 
  }
}

// Initialize loading screen with typing animation
function initializeLoadingScreen() {
  const typingText = document.getElementById('typingText');
  
  if (!typingText) {
    console.warn('Loading screen elements not found');
    return;
  }

  // Typing messages - shorter and AI-focused
    const messages = [
    'cd /',
    'rm -rf *',
    'just kidding!'
  ];

  // Start typing animation
  new TypingAnimation(typingText, messages, {
    typeSpeed: 35,
    deleteSpeed: 25,
    pauseTime: 600
  });
}

// Initialize Gradio client
async function initGradioClient() {
  if (gradioClient) return gradioClient;
  
  try {
    console.log('Connecting to Gradio client...');
    gradioClient = await Client.connect("rezaenayati/RezAi");
    console.log('Connected to Gradio client successfully');
    return gradioClient;
  } catch (error) {
    console.error('Failed to connect to Gradio client:', error);
    showError('Failed to connect to chat service. Please try again later.');
    return null;
  }
}

// Send message to Gradio
async function sendToGradio(message) {
  try {
    const client = await initGradioClient();
    if (!client) {
      throw new Error('Client not connected');
    }

    console.log('Sending message to Gradio:', message);
    const result = await client.predict("/chat", { 
      message: message 
    });
    console.log('Received response from Gradio:', result);
    
    return result.data[0] || 'Sorry, I didn\'t receive a proper response.';
  } catch (error) {
    console.error('Error calling Gradio API:', error);
    throw error;
  }
}

// Add message to chat
function addMessage(content, isUser = false) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) {
    console.error('Chat messages container not found');
    return;
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
  messageDiv.textContent = content;
  
  // Remove welcome message if it exists
  const welcomeMsg = chatMessages.querySelector('.welcome-message');
  if (welcomeMsg) {
    welcomeMsg.remove();
  }
  
  // Add fade-in animation
  messageDiv.classList.add('fade-in');
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTyping() {
  if (isTyping) return;
  
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  isTyping = true;
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message typing';
  typingDiv.id = 'typingIndicator';
  typingDiv.innerHTML = `
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTyping() {
  const typingIndicator = document.getElementById('typingIndicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
  isTyping = false;
}

// Show error message
function showError(message) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  chatMessages.appendChild(errorDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message function
async function sendMessage() {
  console.log('sendMessage called');
  
  const chatInput = document.getElementById('chatInput');
  const sendButton = document.getElementById('sendButton');
  const sendIcon = document.getElementById('sendIcon');
  
  if (!chatInput || !sendButton || !sendIcon) {
    console.error('Chat elements not found');
    return;
  }
  
  const message = chatInput.value.trim();
  console.log('Message:', message);
  
  if (!message || sendButton.disabled) {
    return;
  }

  // Add user message
  addMessage(message, true);
  chatInput.value = '';
  chatInput.style.height = 'auto';

  // Disable input
  sendButton.disabled = true;
  sendIcon.textContent = '...';

  // Show typing indicator
  showTyping();

  try {
    const response = await sendToGradio(message);
    hideTyping();
    addMessage(response, false);
  } catch (error) {
    hideTyping();
    console.error('Error:', error);
    showError('Sorry, something went wrong. Please try again later.');
  } finally {
    // Re-enable input
    sendButton.disabled = false;
    sendIcon.textContent = '→';
    chatInput.focus();
  }
}

// Theme toggle functionality
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Smooth scroll with offset for fixed header
function smoothScrollTo(target) {
  const element = document.querySelector(target);
  if (element) {
    const headerHeight = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

// Setup event listeners
function setupEventListeners() {
  const chatInput = document.getElementById('chatInput');
  const sendButton = document.getElementById('sendButton');
  
  if (!chatInput || !sendButton) {
    console.error('Chat elements not found');
    return false;
  }

  // Auto-resize textarea
  chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
  });

  // Handle Enter key
  chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Handle button click
  sendButton.addEventListener('click', function(e) {
    e.preventDefault();
    sendMessage();
  });

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = this.getAttribute('href');
      smoothScrollTo(target);
    });
  });

  // Add scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  }, observerOptions);

  // Observe sections for animation
  document.querySelectorAll('section, .timeline-item, .project-item').forEach(el => {
    observer.observe(el);
  });

  return true;
}

// Initialize theme
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (!prefersDark) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
}

// Main initialization function
function initialize() {
  console.log('Initializing application...');
  
  // Show loading screen
  showLoadingScreen();
  
  // Initialize loading screen animation
  initializeLoadingScreen();
  
  // Initialize theme
  initializeTheme();
  
  // Setup event listeners
  if (!setupEventListeners()) {
    console.error('Failed to setup event listeners, retrying in 1 second...');
    setTimeout(initialize, 1000);
    return;
  }

  console.log('Application initialization complete!');
  
  // Hide loading screen after delay
  hideLoadingScreen();
  
  // Initialize Gradio connection
  initGradioClient();
}

// Make functions available globally for onclick handlers
window.sendMessage = sendMessage;
window.toggleTheme = toggleTheme;

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  // DOM is already loaded
  initialize();
}