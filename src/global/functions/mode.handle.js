#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer").default;

const {
  REACT_MODE_COMMANDS,
  REACT_NATIVE_MODE_COMMANDS,
  NODE_MODE_COMMANDS,
  STRICT_COMMANDS,
} = require("../../constants/data/constants.js");

const { reactMain } = require("../../../src/web/main/index.js");
const { starter } = require("../../../src/global/functions/logs.js");

const findProjectRoot = (startDir = process.cwd()) => {
  let dir = startDir;

  while (true) {
    const pkgPath = path.join(dir, "package.json");
    if (fs.existsSync(pkgPath)) {
      return dir;
    }

    const parent = path.dirname(dir);
    if (parent === dir) break; // reached filesystem root
    dir = parent;
  }

  return process.cwd(); // fallback
};

//
// 🔹 Config file path (always in project root)
//
const PROJECT_ROOT = findProjectRoot();
const CONFIG_FILE = path.join(PROJECT_ROOT, ".translate-package-config");

const DEFAULT_CONFIG = {
  mode: null,
  strictLocked: false,
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
};

//
// Config helpers
//
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

//
// Status printing
//
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

//
// Mode + command mapping
//
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

  const modeActions = {
    react: () => reactMain(command),
    rn: () => reactMain(command),
    node: () => console.log("🚧 Node/Backend support coming soon!"),
  };

  return modeActions[mode] ? modeActions[mode]() : null;
};

//
// Command handlers
//
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

  const commandModeMap = {
    react: { commands: REACT_MODE_COMMANDS, action: () => reactMain(command) },
    rn: {
      commands: REACT_NATIVE_MODE_COMMANDS,
      action: () => reactMain(command),
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

//
// Command parsing helpers
//
const isExcludedCommand = (command, allArgs) => {
  const excludedCommands = [
    "node",
    "npm",
    "npx",
    "yarn",
    "pnpm",
    "auto-translation",
    "config",
    "reset-config",
  ];

  if (command === "node" && allArgs[1]?.includes(".js")) {
    return true;
  }

  return excludedCommands.includes(command) || command?.includes(".js");
};

const getActualCommand = (allArgs) => {
  const [first, second, third] = allArgs;

  if (first === "node" && second?.includes(".js") && third) {
    return third;
  }

  if (first === "node" && second?.includes(".js")) {
    return null;
  }

  return first;
};

const shouldAutoPrefix = (command, currentMode, allArgs) => {
  if (!command || !currentMode) return false;
  if (isExcludedCommand(allArgs[0], allArgs)) return false;
  if (STRICT_COMMANDS.includes(command)) return false;

  const allModeCommands = [
    ...REACT_MODE_COMMANDS,
    ...REACT_NATIVE_MODE_COMMANDS,
    ...NODE_MODE_COMMANDS,
  ];

  return !allModeCommands.includes(command);
};

//
// Mode initialization
//
const initializeMode = async () => {
  console.log(`🎯 Welcome! Please select your project mode:\n`);
  const mode = await starter();
  const currentMode = mode.replace("ignite-", "");
  setMode(currentMode);
  console.log(`\n✅ Project set to "${currentMode}" mode!\n`);
  return runByMode(currentMode);
};

module.exports = {
  CONFIG_FILE,
  DEFAULT_CONFIG,
  NODE_MODE_COMMANDS,
  PROJECT_ROOT,
  REACT_MODE_COMMANDS,
  REACT_NATIVE_MODE_COMMANDS,
  STRICT_COMMANDS,
  askModeMenu,
  buildMenuChoices,
  findProjectRoot,
  getActualCommand,
  getMode,
  getModeFromStrictCommand,
  handleMenuAction,
  handleModeCommands,
  handleSpecialCommands,
  handleStrictCommands,
  initializeMode,
  isExcludedCommand,
  isStrictLocked,
  lockStrictMode,
  readConfig,
  runByMode,
  setMode,
  shouldAutoPrefix,
  showConfigStatus,
  showUnknownCommandHelp,
  unlockStrictMode,
  writeConfig,
};
