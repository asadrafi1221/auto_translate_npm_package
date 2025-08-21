#!/usr/bin/env node
const inquirer = require("inquirer").default;

async function starter() {
  console.clear();
  console.log("🚀 AUTO TRANSLATION TOOL 🚀\n");
  console.log("Automatically extract and manage i18n keys\n");
  console.log("⚡ Fast | 🔒 Secure | 🎯 Accurate\n");
  console.log("⚠️  Once you ignite a mode, it cannot be undone in this project!\n");

  const { mode } = await inquirer.prompt([
    {
      type: "list",
      name: "mode",
      message: "Select project mode to ignite:",
      choices: [
        { name: "🔥 React (availible)", value: "ignite-react" },
        { name: "📱 React Native (upcoming)  ", value: "ignite-rn" },
        { name: "⚙️ Node / Backend (upcoming) ", value: "ignite-node" },
      ],
    },
  ]);

  return mode; 
}

module.exports = { starter };
