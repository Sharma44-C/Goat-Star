const axios = require("axios");

const messageHistory = new Map();
const MAX_HISTORY = 10;

async function queryAI(prompt, senderID) {
    try {
        const response = await axios.get(`https://kai-api-2.onrender.com/chat?query=${encodeURIComponent(prompt)}&sessionId=${senderID}`, {
            timeout: 10000
        });

        // Kai API returns { message: "Kai's response" }
        return response.data.message;
    } catch (error) {
        if (error.response) {
            console.error("API Error:", error.response.status, error.response.data);
            return `API Error: ${error.response.status} - ${error.response.data.error || "Unknown error"}`;
        } else if (error.request) {
            console.error("No Response from API:", error.request);
            return "No response received from the API. Please check your connection.";
        } else {
            console.error("Error:", error.message);
            return `Error: ${error.message}. Please try again later.`;
        }
    }
}

module.exports = {
    config: {
        name: "kai",
        aliases: [],
        version: "1.0.0",
        author: "Sharma Zambara",
        longDescription: "Chat with Kai — your spicy bro trained by Sharma Zambara, Free Fire legend and coder.",
        category: "AI",
        timestamp: "2025-05-10 00:00:00",
        credit: "Sharma Zambara & Frank Kaumba"
    },

    onStart: async function({ api, event, args }) {
        return await this.processMessage({ api, event, messageText: args.join(" ") });
    },

    onChat: async function({ api, event }) {
        if (event.body.startsWith(global.GoatBot.config.prefix) || event.type !== "message") {
            return;
        }
        return await this.processMessage({ api, event, messageText: event.body });
    },

    processMessage: async function({ api, event, messageText }) {
        const prompt = messageText.trim();
        if (!prompt) return;

        try {
            api.setMessageReaction("⏳", event.messageID);

            const threadID = event.threadID;
            if (!messageHistory.has(threadID)) {
                messageHistory.set(threadID, []);
            }

            const history = messageHistory.get(threadID);
            history.push(`user: ${prompt}`);
            
            while (history.length > MAX_HISTORY) {
                history.shift();
            }

            const response = await queryAI(prompt, event.senderID);
            if (response) {
                history.push(`assistant: ${response}`);
                api.setMessageReaction("✅", event.messageID);
                api.sendMessage(response, event.threadID, (err, info) => {
                    if (!err) {
                        this.context = { botMessageID: info.messageID };
                    }
                });
            } else {
                throw new Error("Empty response from API");
            }

        } catch (error) {
            console.error("Error in command execution:", error.message);
            api.setMessageReaction("❌", event.messageID);
            api.sendMessage(`❌ An unexpected error occurred: ${error.message}`, event.threadID);
        }
    }
};
