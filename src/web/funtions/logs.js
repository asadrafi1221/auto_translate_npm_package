#!/usr/bin/env node


const path = require("path");

const showBanner = () => {
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║                                                  ║");
  console.log("║           🚀 AUTO TRANSLATION TOOL 🚀            ║");
  console.log("║                                                  ║");
  console.log("║      Automatically extract React i18n keys      ║");
  console.log("║                                                  ║");
  console.log("╚══════════════════════════════════════════════════╝");
  console.log("\n");
};

const showImportAlert = (i18nPath) => {
  console.log("\n");
  console.log("┌──────────────────────────────────────────────────┐");
  console.log("│                  ⚠️  IMPORTANT ⚠️                  │");
  console.log("└──────────────────────────────────────────────────┘");
  console.log("");
  console.log("🔧 Don't forget to import i18n in your React layout file!");
  console.log("");
  console.log("📄 Add this to your layout.js/layout.tsx:");
  console.log("");
  console.log("┌────────────────────────────────────────────────┐");

  const relativePath = path.relative(process.cwd(), i18nPath);
  const importPath = relativePath.replace(/\\/g, "/");

  console.log(`│ import './${importPath}/i18n';                    │`);
  console.log("└────────────────────────────────────────────────┘");
  console.log("");
  console.log("💡 This ensures React i18n is initialized when your app starts!");
  console.log("");
};

const showUsage = () => {
  console.log("┌────────────────────────────────────────────────┐");
  console.log("│                   📖 USAGE                     │");
  console.log("└────────────────────────────────────────────────┘");
  console.log("");
  console.log(
    "  npx auto-translation react-init   # Complete React setup with dependencies"
  );
  console.log(
    "  npx auto-translation react-setup  # Setup React i18n folder structure only"
  );
  console.log(
    "  npx auto-translation react-scan   # Scan React files for translation keys"
  );

  console.log("");
  console.log("┌────────────────────────────────────────────────┐");
  console.log("│              🔧 AVAILABLE COMMANDS             │");
  console.log("└────────────────────────────────────────────────┘");
  console.log("");
  console.log(
    "  react-init        - Creates sample files + React i18n structure + installs deps"
  );
  console.log(
    "  react-setup       - Creates React i18n folder structure only"
  );
  console.log(
    "  react-scan        - Scans React files and extracts t() translation keys"
  );
  console.log(
    "  react-wrap        - Wrap all hardcoded text in t() function in JSX elements"
  );
  console.log(
    "  react-file-update - Manage translation files in React file-based structure"
  );
  console.log("");
};

module.exports = {
  showBanner,
  showImportAlert,
  showUsage,
};
