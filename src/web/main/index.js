#!/usr/bin/env node

const { getCurrentMode } = require("../funtions/handle.mode.js");
const {
  showUsage,
  showImportAlert,
  manageFiles,
  setupI18nStructure,
  installDependencies,
  scanAndUpdateTranslations,
  wrapPlainTextWithTranslation,
  initIgnoreKeys,
  selectFilesToScan,
} = require("../funtions/index.js");

//// its for handling user commands for react and react-native both  
const reactMain = async (commandToRun) => {
  const args = commandToRun ? [commandToRun] : process.argv.slice(2);
  const command = args[0];

  console.log(`\n🚀 Running command: ${command}\n`);

  const currentMode = getCurrentMode();
  try {
    switch (command) {
      //
      // 🔹 Init
      //
      case "react-init":
      case "rn-init":
        if (currentMode === "react" && command === "react-init") {
          console.log("🏗️  Initializing React i18n setup...\n");
          const i18nPath = await setupI18nStructure();
          await installDependencies();

          console.log("\n✅ React setup complete!");
          showImportAlert(i18nPath);

          console.log("📋 Next steps:");
          console.log("1. ✅ Dependencies installed");
          console.log("2. Import i18n config in your layout file (see above)");
          console.log("3. Run 'npx auto-translation react-scan' to extract translation keys\n");
        } else if (currentMode === "rn" && command === "rn-init") {
          console.log("🏗️  Initializing React Native i18n setup...\n");
          const i18nPath = await setupI18nStructure();
          await installDependencies();

          console.log("\n✅ React Native setup complete!");
          showImportAlert(i18nPath);

          console.log("📋 Next steps:");
          console.log("1. ✅ Dependencies installed");
          console.log("2. Import i18n config in your App.js / index.js");
          console.log("3. Run 'npx auto-translation rn-scan' to extract translation keys\n");
        } else {
          console.log(`❌ "${command}" does not match the current mode "${currentMode}"`);
        }
        break;

      //
      // 🔹 Scan
      //
      case "react-scan":
      case "rn-scan":
        if ((currentMode === "react" && command === "react-scan") ||
          (currentMode === "rn" && command === "rn-scan")) {
          console.log(`🔍 Scanning ${currentMode === "react" ? "React" : "React Native"} project for translation keys...\n`);
          const filesToScan = await selectFilesToScan();

          if (Array.isArray(filesToScan) && filesToScan.length === 0) {
            console.log("❌ No files to scan. Operation cancelled.");
            break;
          }

          await scanAndUpdateTranslations(filesToScan);
        } else {
          console.log(`❌ "${command}" does not match the current mode "${currentMode}"`);
        }
        break;

      //
      // 🔹 Wrap
      //
      case "react-wrap":
      case "rn-wrap":
        if ((currentMode === "react" && command === "react-wrap") ||
          (currentMode === "rn" && command === "rn-wrap")) {
          console.log(`🔄 Wrapping plain text with t() calls in ${currentMode === "react" ? "React" : "React Native"} project...\n`);
          await wrapPlainTextWithTranslation();
        } else {
          console.log(`❌ "${command}" does not match the current mode "${currentMode}"`);
        }
        break;

      //
      // 🔹 File Update
      //
      case "react-file-update":
      case "rn-file-update":
        if ((currentMode === "react" && command === "react-file-update") ||
          (currentMode === "rn" && command === "rn-file-update")) {
          console.log(`📁 Managing ${currentMode === "react" ? "React" : "React Native"} translation files...\n`);
          await manageFiles();
        } else {
          console.log(`❌ "${command}" does not match the current mode "${currentMode}"`);
        }
        break;

      //
      // 🔹 Setup
      //
      case "react-setup":
      case "rn-setup":
        if ((currentMode === "react" && command === "react-setup") ||
          (currentMode === "rn" && command === "rn-setup")) {
          console.log(`📁 Setting up ${currentMode === "react" ? "React" : "React Native"} folder structure...\n`);
          await setupI18nStructure();
        } else {
          console.log(`❌ "${command}" does not match the current mode "${currentMode}"`);
        }
        break;

      //
      // 🔹 Ignore Init
      //
      case "react-ignore-init":
      case "rn-ignore-init":
        if ((currentMode === "react" && command === "react-ignore-init") ||
          (currentMode === "rn" && command === "rn-ignore-init")) {
          console.log(`🚫 Initializing .ignoreKeys for ${currentMode === "react" ? "React" : "React Native"}...\n`);
          await initIgnoreKeys();
        } else {
          console.log(`❌ "${command}" does not match the current mode "${currentMode}"`);
        }
        break;

      //
      // 🔹 Default
      //
      default:
        showUsage();
        break;
    }
  }
  catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

module.exports = {
  setupI18nStructure,
  installDependencies,
  scanAndUpdateTranslations,
  manageFiles,
  reactMain,
};

if (require.main === module) {
  reactMain().catch((error) => {
    console.error("❌ Fatal error:");
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
