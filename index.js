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

const CONFIG_FILE = path.resolve(process.cwd(), ".translate-package-config");

const DEFAULT_CONFIG = {
  mode: null,
  strictLocked: false,
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
};

const readConfig = () => {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return { ...DEFAULT_CONFIG };
    const configData = fs.readFileSync(CONFIG_FILE, "utf8").trim();

    if (configData && !configData.startsWith("{")) {
      return {
        ...DEFAULT_CONFIG,
        mode: configData,
        lastModified: new Date().toISOString(),
      };
    }

    return { ...DEFAULT_CONFIG, ...JSON.parse(configData) };
  } catch (error) {
    console.log("⚠️  Config file corrupted, resetting to defaults...");
    return { ...DEFAULT_CONFIG };
  }
};

const writeConfig = (updates) => {
  const currentConfig = readConfig();
  const newConfig = {
    ...currentConfig,
    ...updates,
    lastModified: new Date().toISOString(),
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
  return newConfig;
};

const getMode = () => readConfig().mode;
const setMode = (mode) => writeConfig({ mode });
const isStrictLocked = () => readConfig().strictLocked;
const lockStrictMode = () => writeConfig({ strictLocked: true });
const unlockStrictMode = () => writeConfig({ strictLocked: false });

const showConfigStatus = () => {
  const config = readConfig();
  console.log("\n📊 Project Configuration Status:");
  console.log(`   Mode: ${config.mode || "Not set"}`);
  console.log(
    `   Strict Lock: ${config.strictLocked ? "🔒 Enabled" : "🔓 Disabled"}`
  );
  console.log(
    `   Last Modified: ${new Date(config.lastModified).toLocaleString()}`
  );
  console.log();
};

const getModeFromStrictCommand = (command) => {
  const modeMap = {
    react: "react",
    rn: "rn",
    node: "node",
  };

  return Object.keys(modeMap).find((key) => command.startsWith(key))
    ? modeMap[Object.keys(modeMap).find((key) => command.startsWith(key))]
    : null;
};

const buildMenuChoices = (strictLocked) => {
  const baseChoices = [
    { name: "▶ Continue in this mode", value: "continue" },
    { name: "❌ Exit", value: "exit" },
  ];

  const additionalChoices = strictLocked
    ? [
        { name: "📊 Show config details", value: "status" },
        { name: "🔓 Unlock strict mode", value: "unlock" },
      ]
    : [
        { name: "🔄 Change mode", value: "change" },
        { name: "📊 Show config details", value: "status" },
      ];

  return [baseChoices[0], ...additionalChoices, baseChoices[1]];
};

const askModeMenu = async (currentMode, strictLocked) => {
  if (strictLocked) console.log("🔒 Project is in strict mode.");

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: `Project is in "${currentMode}" mode. What do you want to do?`,
      choices: buildMenuChoices(strictLocked),
    },
  ]);

  return action;
};

const runByMode = (mode, command) => {
  console.log("hehhe i am ", command);

  const modeActions = {
    react: () => reactMain(command),
    rn: () => console.log("🚧 React Native support coming soon!"),
    node: () => console.log("🚧 Node/Backend support coming soon!"),
  };

  return modeActions[mode] ? modeActions[mode]() : null;
};

const handleSpecialCommands = (command) => {
  switch (command) {
    case "config":
      showConfigStatus();
      process.exit(0);
    case "reset-config":
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
      console.log("✅ Configuration reset to defaults!");
      process.exit(0);
    default:
      return false;
  }
};

const handleStrictCommands = (command, currentMode, strictLocked) => {
  if (!STRICT_COMMANDS.includes(command)) return false;

  const commandMode = getModeFromStrictCommand(command);

  if (currentMode !== commandMode) {
    console.log(
      `❌ Project is in "${currentMode}" mode. Cannot run ${command} (${commandMode} command).`
    );
    if (strictLocked)
      console.log(
        `💡 To change modes, use the unlock option or run: npm run cli`
      );
    process.exit(1);
  }

  if (!strictLocked) {
    lockStrictMode();
    console.log(
      `\n🔒 Strict mode enabled! Project locked into "${currentMode}" mode.\n`
    );
  }

  runByMode(currentMode, command);
  return true;
};

const handleModeCommands = (command, currentMode, strictLocked) => {
  console.log("hehhe i am ", command);

  const commandModeMap = {
    react: { commands: REACT_MODE_COMMANDS, action: () => reactMain(command) },
    rn: {
      commands: REACT_NATIVE_MODE_COMMANDS,
      action: () => console.log("🚧 React Native support coming soon!"),
    },
    node: {
      commands: NODE_MODE_COMMANDS,
      action: () => console.log("🚧 Node/Backend support coming soon!"),
    },
  };

  for (const [mode, config] of Object.entries(commandModeMap)) {
    if (config.commands.includes(command)) {
      if (currentMode !== mode) {
        console.log(
          `❌ Project is locked in "${currentMode}" mode. Cannot use ${mode} commands.`
        );
        if (strictLocked)
          console.log(
            `💡 To change modes, run the CLI without arguments to unlock.`
          );
        process.exit(1);
      }
      config.action();
      return true;
    }
  }

  return false;
};

const handleMenuAction = async (action, currentMode) => {
  switch (action) {
    case "status":
      showConfigStatus();
      return main();

    case "unlock":
      unlockStrictMode();
      console.log(
        "🔓 Strict mode disabled! You can now change project modes.\n"
      );
      return main();

    case "change":
      const mode = await starter();
      const newMode = mode.replace("ignite-", "");
      setMode(newMode);
      console.log(`\n🔄 Project mode changed to "${newMode}"!\n`);
      return runByMode(newMode);

    case "exit":
      console.log("👋 Bye!");
      process.exit(0);

    case "continue":
      return runByMode(currentMode);

    default:
      console.log("❌ Cannot change mode in strict mode. Please unlock first.");
      return main();
  }
};

const showUnknownCommandHelp = (currentMode, strictLocked) => {
  console.log(
    "❓ Unknown command. Available commands depend on your current mode:"
  );
  console.log(`📍 Current mode: "${currentMode}"`);

  const modeDescriptions = {
    react: "🔵 React commands available",
    rn: "📱 React Native commands available",
    node: "🟢 Node commands available",
  };

  console.log(modeDescriptions[currentMode] || "❓ Unknown mode");

  if (strictLocked) console.log("🔒 Project is in strict mode");

  console.log("\n💡 Special commands:");
  console.log("   config          - Show configuration status");
  console.log("   reset-config    - Reset configuration to defaults");
};

const isExcludedCommand = (command, allArgs) => {
  const excludedCommands = [
    "node",
    "npm",
    "npx",
    "yarn",
    "pnpm", // Package managers and Node
    "auto-translation", // Main CLI command
    "config",
    "reset-config", // Special config commands
  ];

  // Check for "node index.js" pattern
  if (command === "node" && allArgs[1]?.includes(".js")) {
    return true;
  }

  return excludedCommands.includes(command) || command?.includes(".js");
};

const getActualCommand = (allArgs) => {
  const [first, second, third] = allArgs;

  // Handle "node index.js command" pattern
  if (first === "node" && second?.includes(".js") && third) {
    return third;
  }

  // Handle "node script.js command" pattern
  if (first === "node" && second?.includes(".js")) {
    return null; // No command after script
  }

  // Standard case: first argument is the command
  return first;
};

const shouldAutoPrefix = (command, currentMode, allArgs) => {
  if (!command || !currentMode) return false;
  if (isExcludedCommand(allArgs[0], allArgs)) return false;
  if (STRICT_COMMANDS.includes(command)) return false; // Already mode-prefixed

  // Check if it's already a mode command
  const allModeCommands = [
    ...REACT_MODE_COMMANDS,
    ...REACT_NATIVE_MODE_COMMANDS,
    ...NODE_MODE_COMMANDS,
  ];

  return !allModeCommands.includes(command);
};

const initializeMode = async () => {
  console.log(`🎯 Welcome! Please select your project mode:\n`);
  const mode = await starter();
  const currentMode = mode.replace("ignite-", "");
  setMode(currentMode);
  console.log(`\n✅ Project set to "${currentMode}" mode!\n`);
  return runByMode(currentMode);
};

const main = async () => {
  const allArgs = process.argv.slice(2);
  const command = getActualCommand(allArgs);
  let currentMode = getMode();
  const strictLocked = isStrictLocked();

  if (handleSpecialCommands(command)) return;

  if (!currentMode) {
    if (command) {
      console.log(`❌ No mode selected! You must choose a project mode first.`);
      console.log(`🚫 Cannot run "${command}" without selecting a mode.`);
      console.log(
        `\n📋 Please run the CLI without any commands to select a mode first.\n`
      );
      process.exit(1);
    }
    return initializeMode();
  }

  if (handleStrictCommands(command, currentMode, strictLocked)) return;

  if (!command) {
    const action = await askModeMenu(currentMode, strictLocked);
    const canChange = action === "change" && !strictLocked;
    return handleMenuAction(
      canChange ? action : action === "change" ? "invalid" : action,
      currentMode
    );
  }

  // Auto-prefix ALL commands with current mode (except excluded ones)
  if (shouldAutoPrefix(command, currentMode, allArgs)) {
    const modeCommand = `${currentMode}-${command}`;
    console.log(
      `🔄 Running "${command}" as "${modeCommand}" in ${currentMode} mode`
    );

    // Try to run as mode command first
    if (handleModeCommands(modeCommand, currentMode, strictLocked)) return;

    // Fallback to direct execution
    return runByMode(currentMode, modeCommand);
  }

  if (handleModeCommands(command, currentMode, strictLocked)) return;

  showUnknownCommandHelp(currentMode, strictLocked);
};

if (require.main === module) {
  main().catch((err) => {
    console.error("❌ Fatal error:\n", err.stack);
    process.exit(1);
  });
}
