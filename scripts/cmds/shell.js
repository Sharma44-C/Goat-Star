const { exec } = require('child_process');

module.exports = {
  config: {
    name: "shell",
    aliases: ["sh"],
    version: "1.0",
    author: "King Monsterwith",
    countDown: 5,
    role: 0,
    shortDescription: "Execute shell commands",
    longDescription: "",
    category: "𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥",
    guide: {
      vi: "{p}{n} <command>",
      en: "{p}{n} <command>"
    }
  },

  onStart: async function ({ args, message, event }) {
    const mesbah = ['100088264286917'];
    if (!mesbah.includes(event.senderID)) {
      return message.reply(`you don’t have permission to use the command`, event.threadID, event.messageID);
    }
    const command = args.join(" ");

    if (!command) {
      return message.reply("Please provide a command to execute.");
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error}`);
        return message.reply(`An error occurred while executing the command: ${error.message}`);
      }

      if (stderr) {
        console.error(`Command execution resulted in an error: ${stderr}`);
        return message.reply(`Command execution resulted in an error: ${stderr}`);
      }

      console.log(`Command executed successfully:\n${stdout}`);
      message.reply(`Command executed successfully:\n${stdout}`);
    });
  }
};
