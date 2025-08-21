#!/usr/bin/env node


const {
  showUsage,
  showImportAlert,
  manageFiles,
  setupI18nStructure,
  installDependencies,
  scanAndUpdateTranslations,
  wrapPlainTextWithTranslation,
} = require("../funtions/index.js");

const reactMain = async () => {
  const args = process.argv.slice(2);
  const command = args[0];




  try {
    switch (command) {
      case "react-init":
        console.log("🏗️  Initializing React i18n setup...\n");
        const i18nPath = await setupI18nStructure();
        await installDependencies();

        console.log("\n✅ React setup complete!");
        showImportAlert(i18nPath);

        console.log("📋 Next steps:");
        console.log("1. ✅ Dependencies installed");
        console.log("2. Import i18n config in your layout file (see above)");
        console.log("3. Run 'npx auto-translation react-scan' to extract translation keys");
        console.log("");
        break;

      case "react-scan":
        console.log("🔍 Scanning React project for translation keys...\n");
        await scanAndUpdateTranslations();
        break;

      case "react-wrap":
        console.log("🔄 Wrapping plain text with t() calls in React project...\n");
        await wrapPlainTextWithTranslation();
        break;

      case "react-file-update":
        console.log("📁 Managing React translation files...\n");
        await manageFiles();
        break;

      case "react-setup":
        console.log("📁 Setting up React folder structure...\n");
        await setupI18nStructure();
        break;

      default:
        showUsage();
        break;
    }
  } catch (error) {
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
