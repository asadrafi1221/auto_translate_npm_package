#!/usr/bin/env node


const readline = require("readline");
const { execSync } = require("child_process");



const askQuestion = (query) => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(query, (answer) => {
      rl.close(); 
      resolve(answer.trim());
    });
  });
};

const installDependencies = async () => {
  console.log("\n📦 Installing dependencies...\n");

  // Ask user for package manager preference
  console.log("Which package manager would you like to use?");
  console.log("1. npm");
  console.log("2. yarn");

  const choice = await askQuestion("\nEnter your choice (1 or 2): ");

  let installCommand;
  let packageManager;

  if (choice === "2") {
    packageManager = "yarn";
    installCommand = "yarn add i18next react-i18next";
  } else {
    packageManager = "npm";
    installCommand = "npm install i18next react-i18next";
  }

  console.log(`\n🚀 Running: ${installCommand}\n`);

  try {
    console.log("┌────────────────────────────────────────────────┐");
    console.log("│              📦 INSTALLING PACKAGES             │");
    console.log("└────────────────────────────────────────────────┘");
    console.log("");

    // Execute the install command
    execSync(installCommand, {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    console.log("");
    console.log("✅ Dependencies installed successfully!");
  } catch (error) {
    console.log("");
    console.log("❌ Failed to install dependencies automatically.");
    console.log(`💡 Please run manually: ${installCommand}`);
    console.log("");
  }
};

module.exports = {
   askQuestion,
   installDependencies
}