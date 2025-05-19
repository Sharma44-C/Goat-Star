const axios = require("axios");
const messageHistory = new Map();
const MAX_HISTORY = 10;
const activeUsers = new Set();

async function queryStar(prompt, senderID) {
  try {
    const response = await axios.get("https://star-bot-pwah.onrender.com/chat", {
      params: { query: `Star ${prompt}`, sessionId: senderID },
      timeout: 10000,
    });
    return response.data.message || response.data;
  } catch (error) {
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
      return `API Error: ${error.response.status} - ${error.response.data.message || "Unknown error"}`;
    } else if (error.request) {
      console.error("No Response from API:", error.request);
      return "No response received from the API. Please check your connection.";
    } else {
      console.error("Error:", error.message);
      return `Error: ${error.message}. Please try again later.`;
    }
  }
}

async function generateImage(prompt) {
  try {
    const response = await axios.get(`https://www.smfahim.xyz/creartai?prompt=${prompt}`, { responseType: 'stream' });
    return response.data;
  } catch (error) {
    console.error("Error generating image:", error.message);
    throw error;
  }
}

module.exports = {
  config: {
    name: "star",
    aliases: ["chat", "ai"],
    version: "1.0.0",
    author: "Sharma Zambara",
    longDescription: "Chat with Star using the Star API. Continue conversations in a WhatsApp-like experience.",
    category: "AI",
    timestamp: "2025-05-10 00:00:00",
    credit: "Zambara + Frank Kaumba"
  },
  onStart: async function({ api, event, args }) {
    const input = args.join(" ").toLowerCase().trim();
    if (input === "on") {
      activeUsers.add(event.senderID);
      api.sendMessage("Star is now active for you. Say 'Star off' to deactivate.", event.threadID);
      return;
    } else if (input === "off") {
      activeUsers.delete(event.senderID);
      api.sendMessage("Star is now deactivated for you. Say 'Star on' to activate again.", event.threadID);
      return;
    }
    if (activeUsers.has(event.senderID)) {
      return await this.processMessage({ api, event, messageText: args.join(" ") });
    } else {
      api.sendMessage("Star is currently deactivated. Say 'Star on' to start chatting with Star.", event.threadID);
    }
  },
  onChat: async function({ api, event }) {
    if (event.body.startsWith(global.GoatBot.config.prefix) || event.type !== "message") {
      return;
    }
    const messageText = event.body.trim().toLowerCase();
    if (messageText === "star on") {
      activeUsers.add(event.senderID);
      api.sendMessage("Star is now active for you. Say 'Star off' to deactivate.", event.threadID);
      return;
    } else if (messageText === "star off") {
      activeUsers.delete(event.senderID);
      api.sendMessage("Star is now deactivated for you. Say 'Star on' to activate again.", event.threadID);
      return;
    } else if (messageText.includes("star") && !activeUsers.has(event.senderID)) {
      api.sendMessage("Say 'Star on' to activate me", event.threadID);
      return;
    }
    if (activeUsers.has(event.senderID)) {
      return await this.processMessage({ api, event, messageText: event.body.trim() });
    }
  },
  processMessage: async function({ api, event, messageText }) {
    const prompt = messageText.trim();
    if (!prompt) return;

    const imageKeywords = ["image", "picture", "photo"];
    const isImageRequest = imageKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
    if (isImageRequest) {
      try {
        const imagePrompt = prompt.replace(new RegExp(imageKeywords.join("|"), "gi"), "").trim();
        const imageResponse = await generateImage(imagePrompt);
        api.sendMessage(`Here's your image 👌`, event.threadID);
        api.sendMessage({ attachment: imageResponse }, event.threadID);
      } catch (error) {
        api.sendMessage(`Error generating image: ${error.message}`, event.threadID);
      }
    } else {
      try {
        const response = await queryStar(prompt, event.senderID);
        api.sendMessage(response, event.threadID);
      } catch (error) {
        api.sendMessage(`Error: ${error.message}`, event.threadID);
      }
    }
  }
      }
