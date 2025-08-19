const path = require("path");
const fs = require("fs");

const showBanner = () => {
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║                                                  ║");
  console.log("║           🚀 AUTO TRANSLATION TOOL 🚀            ║");
  console.log("║                                                  ║");
  console.log("║     Automatically extract React i18n keys       ║");
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
  console.log("🔧 Don't forget to import i18n in your layout file!");
  console.log("");
  console.log("📄 Add this to your layout.js/layout.tsx:");
  console.log("");
  console.log("┌────────────────────────────────────────────────┐");

  const relativePath = path.relative(process.cwd(), i18nPath);
  const importPath = relativePath.replace(/\\/g, "/");

  console.log(`│ import './${importPath}/i18n';                    │`);
  console.log("└────────────────────────────────────────────────┘");
  console.log("");
  console.log("💡 This ensures i18n is initialized when your app starts!");
  console.log("");
};

const showUsage = () => {
  console.log("┌────────────────────────────────────────────────┐");
  console.log("│                   📖 USAGE                     │");
  console.log("└────────────────────────────────────────────────┘");
  console.log("");
  console.log(
    "  npx auto-translation init   # Complete setup with dependencies"
  );
  console.log("  npx auto-translation setup  # Setup folder structure only");
  console.log("  npx auto-translation scan   # Scan for translation keys");
  console.log("");
  console.log("┌────────────────────────────────────────────────┐");
  console.log("│                  📋 EXAMPLES                   │");
  console.log("└────────────────────────────────────────────────┘");
  console.log("");
  console.log("  npx auto-translation init   # First time setup");
  console.log(
    "  npx auto-translation scan   # Extract keys from your components"
  );
  console.log("");
  console.log("┌────────────────────────────────────────────────┐");
  console.log("│              🔧 AVAILABLE COMMANDS             │");
  console.log("└────────────────────────────────────────────────┘");
  console.log("");
  console.log(
    "  init        - Creates sample files + i18n structure + installs deps"
  );
  console.log("  setup       - Creates i18n folder structure only");
  console.log(
    "  scan        - Scans React files and extracts t() translation keys"
  );
  console.log(
    "  wrap        - wrap all hardcoded text in t funtion but in html elements"
  );
  console.log("  file-update - Manage files in file-based structure");
  console.log("");
};

// ✅ Export functions so they can be used in index.js
module.exports = {
  showBanner,
  showImportAlert,
  showUsage,
};
