const axios = require("axios");

async function queryKai(prompt, sessionId) {
  try {
    if (!sessionId) {
      throw new Error("Missing 'sessionId' parameter.");
    }

    const prefixedQuery = `Kai ${prompt}`;

    console.log("Sending query:", prefixedQuery, "with sessionId:", sessionId);

    const response = await axios.get("https://kai-api-2.onrender.com/chat", {
      params: {
        query: prefixedQuery,
        sessionId,
      },
      timeout: 10000,
    });

    console.log("Full API Response:", response.data);

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

module.exports = {
  config: {
    name: "kai",
    aliases: ["kai", "ai"],
    version: "1.0",
    author: "Sharma Zambara",
    longDescription: {
      en: "Interact with Kai via the provided API and continue chats based on replies.",
    },
    category: "AI",
    guide: {
      en: "{pn} <your query>",
    },
  },

  onStart: async function ({ message, args, event, api }) {
    const prompt = args.join(" ").trim();
    const userId = event.senderID;

    message.reaction("⏳", event.messageID);

    if (!prompt) {
      return message.reply("❌ Please provide a query to send to Kai.");
    }

    try {
      const reply = await queryKai(prompt, userId);
      const sentMessage = await message.reply(reply);
      message.reaction("✅", event.messageID);

      this.context = { botMessageID: sentMessage.messageID, userId };
    } catch (error) {
      console.error("Error in command execution:", error.message);
      message.reaction("❌", event.messageID);
      return message.reply("❌ An unexpected error occurred. Please try again later.");
    }
  },

  onChat: async function ({ message, event, args, api }) {
    try {
      if (event.messageReply && event.messageReply.messageID === this.context?.botMessageID) {
        const prompt = args.join(" ").trim() || "continue";

        const reply = await queryKai(prompt, this.context?.userId);
        const sentMessage = await message.reply(reply);

        this.context.botMessageID = sentMessage.messageID;
      }
    } catch (error) {
      console.error("Error in onChat:", error.message);
      return message.reply("❌ Something went wrong while continuing the chat.");
    }
  },
};
