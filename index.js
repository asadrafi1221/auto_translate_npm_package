#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer").default;

const {
  REACT_MODE_COMMANDS,
  REACT_NATIVE_MODE_COMMANDS,
  NODE_MODE_COMMANDS,
  STRICT_COMMANDS,
} = require("./src/constants/data/constants.js");

const { reactMain } = require("./src/web/main/index.js");
const { starter } = require("./src/global/functions/logs.js");

const MODE_FILE = path.resolve(process.cwd(), ".project_mode");
const STRICT_LOCK_FILE = path.resolve(process.cwd(), ".mode_lock");

// --- helpers ---
const getMode = () =>
  fs.existsSync(MODE_FILE) ? fs.readFileSync(MODE_FILE, "utf8").trim() : null;

const setMode = (mode) => fs.writeFileSync(MODE_FILE, mode);

const isStrictLocked = () => fs.existsSync(STRICT_LOCK_FILE);

const lockStrictMode = () => fs.writeFileSync(STRICT_LOCK_FILE, "locked");

// Get mode from strict command
const getModeFromStrictCommand = (command) => {
  if (command.startsWith("react")) return "react";
  if (command.startsWith("rn")) return "rn";
  if (command.startsWith("node")) return "node";
  return null;
};

async function askModeMenu(currentMode, strictLocked) {
  const choices = [
    { name: "▶ Continue in this mode", value: "continue" },
    { name: "❌ Exit", value: "exit" },
  ];

  // Only allow mode change if NOT strict locked
  if (!strictLocked) {
    choices.splice(1, 0, { name: "🔄 Change mode", value: "change" });
  } else {
    console.log(
      "🔒 Project is in strict mode. To change modes, manually delete the .mode_lock file."
    );
  }

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: `Project is in "${currentMode}" mode. What do you want to do?`,
      choices,
    },
  ]);
  return action;
}

const runByMode = (mode, command) => {
  if (mode === "react") return reactMain(command);
  if (mode === "rn") return console.log("🚧 React Native support coming soon!");
  if (mode === "node")
    return console.log("🚧 Node/Backend support coming soon!");
};

const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0];
  let currentMode = getMode();
  const strictLocked = isStrictLocked();

  if (!currentMode) {
    if (command) {
      console.log(`❌ No mode selected! You must choose a project mode first.`);
      console.log(`🚫 Cannot run "${command}" without selecting a mode.`);
      console.log(
        `\n📋 Please run the CLI without any commands to select a mode first.\n`
      );
      process.exit(1);
    }

    // No command provided and no mode - force mode selection
    console.log(`🎯 Welcome! Please select your project mode:\n`);
    const mode = await starter();
    currentMode = mode.replace("ignite-", "");
    setMode(currentMode);
    console.log(`\n✅ Project set to "${currentMode}" mode!\n`);

    // After mode selection, continue to main menu
    return runByMode(currentMode);
  }

  // --- Handle strict commands AFTER mode is confirmed ---
  if (STRICT_COMMANDS.includes(command)) {
    const commandMode = getModeFromStrictCommand(command);

    if (currentMode !== commandMode) {
      // Trying to run strict command for different mode
      console.log(
        `❌ Project is in "${currentMode}" mode. Cannot run ${command} (${commandMode} command).`
      );
      if (strictLocked) {
        console.log(
          `💡 To change modes, manually delete the .mode_lock file and restart.`
        );
      }
      process.exit(1);
    }

    // Running strict command in correct mode - lock it if not already locked
    if (!strictLocked) {
      lockStrictMode();
      console.log(
        `\n🔒 Strict mode enabled! Project locked into "${currentMode}" mode.\n`
      );
    }

    // Run the command in the correct mode
    return runByMode(currentMode, command);
  }

  // --- If no command provided ---
  if (!command) {
    const action = await askModeMenu(currentMode, strictLocked);

    if (action === "change" && !strictLocked) {
      // Only possible if NOT strict locked
      const mode = await starter();
      currentMode = mode.replace("ignite-", "");
      setMode(currentMode);
      console.log(`\n🔄 Project mode changed to "${currentMode}"!\n`);
      return runByMode(currentMode);
    }

    if (action === "change" && strictLocked) {
      console.log(
        "❌ Cannot change mode in strict mode. Delete .mode_lock file to unlock."
      );
      process.exit(1);
    }

    if (action === "exit") {
      console.log("👋 Bye!");
      process.exit(0);
    }

    if (action === "continue") {
      return runByMode(currentMode);
    }
  }

  // --- Validate commands against current mode ---
  if (REACT_MODE_COMMANDS.includes(command)) {
    if (currentMode !== "react") {
      console.log(
        `❌ Project is locked in "${currentMode}" mode. Cannot use React commands.`
      );
      if (strictLocked) {
        console.log(
          `💡 To change modes, manually delete the .mode_lock file and restart.`
        );
      }
      process.exit(1);
    }
    return reactMain(command);
  }

  if (REACT_NATIVE_MODE_COMMANDS.includes(command)) {
    if (currentMode !== "rn") {
      console.log(
        `❌ Project is locked in "${currentMode}" mode. Cannot use React Native commands.`
      );
      if (strictLocked) {
        console.log(
          `💡 To change modes, manually delete the .mode_lock file and restart.`
        );
      }
      process.exit(1);
    }
    return console.log("🚧 React Native support coming soon!");
  }

  if (NODE_MODE_COMMANDS.includes(command)) {
    if (currentMode !== "node") {
      console.log(
        `❌ Project is locked in "${currentMode}" mode. Cannot use Node commands.`
      );
      if (strictLocked) {
        console.log(
          `💡 To change modes, manually delete the .mode_lock file and restart.`
        );
      }
      process.exit(1);
    }
    return console.log("🚧 Node/Backend support coming soon!");
  }

  // --- Unknown command ---
  console.log(
    "❓ Unknown command. Available commands depend on your current mode:"
  );
  console.log(`📍 Current mode: "${currentMode}"`);

  if (currentMode === "react") {
    console.log("🔵 React commands available");
  } else if (currentMode === "rn") {
    console.log("📱 React Native commands available");
  } else if (currentMode === "node") {
    console.log("🟢 Node commands available");
  }

  if (strictLocked) {
    console.log("🔒 Project is in strict mode");
  }
};

console.log("🚀 Starting Ignite CLI...");

if (require.main === module) {
  main().catch((err) => {
    console.error("❌ Fatal error:\n", err.stack);
    process.exit(1);
  });
}
