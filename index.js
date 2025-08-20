#!/usr/bin/env node

const {
  REACT_MODE_COMMANDS,
  REACT_NATIVE_COMMANDS,
  NODE_COMMANDS,
} = require("./src/constants/data/constants.js");
const { starter } = require("./src/global/functions/logs.js");
const { reactMain } = require("./src/web/main/index.js");

const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0];

  if (REACT_MODE_COMMANDS.includes(command)) {
    await reactMain();
  } else if (REACT_NATIVE_COMMANDS.includes(command)) {
    console.log("❌ You cannot use React Native commands in React mode!");
    process.exit(1);
  } else if (NODE_COMMANDS.includes(command)) {
    console.log("❌ You cannot use backend/Node commands in React mode!");
    process.exit(1);
  } else {
    starter();
  }
};

if (require.main === module) {
  main().catch((err) => {
    console.error("❌ Fatal error:\n", err.stack);
    process.exit(1);
  });
}
