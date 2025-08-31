#!/usr/bin/env node

const { getActualCommand, getMode, isStrictLocked, handleSpecialCommands, initializeMode, handleStrictCommands, askModeMenu, handleMenuAction, shouldAutoPrefix, handleModeCommands, runByMode, showUnknownCommandHelp } = require("./src/global/functions/mode.handle.js");


//// its main entry of this npm package in which mode selection etc all goes ! 
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

  if (shouldAutoPrefix(command, currentMode, allArgs)) {
    const modeCommand = `${currentMode}-${command}`;
    console.log(
      `🔄 Running "${command}" as "${modeCommand}" in ${currentMode} mode`
    );

    if (handleModeCommands(modeCommand, currentMode, strictLocked)) return;

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
