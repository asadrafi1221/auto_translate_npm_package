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
  const path = require("path");
  
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

const displayScanResults = (results) => {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║                   SCAN RESULTS                   ║");
  console.log("╚══════════════════════════════════════════════════╝");
  
  console.log(`\n📊 Total files scanned: ${results.filesScanned}`);
  console.log(`📊 Total keys found: ${results.totalKeys}`);
  console.log(`🆕 New keys added: ${results.newKeys}`);
  console.log(`📄 Files updated: ${results.filesUpdated}`);
  
  if (results.updatedFiles && results.updatedFiles.length > 0) {
    console.log("\n🔄 Updated translation files:");
    results.updatedFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });
  }

  if (results.allKeys && results.allKeys.length > 0) {
    console.log("\n🔑 All keys found:");
    results.allKeys.slice(0, 20).forEach((key, index) => {
      const status = results.newKeysArray.includes(key) ? " (NEW)" : " (existing)";
      console.log(`  ${index + 1}. "${key}"${status}`);
    });
    
    if (results.allKeys.length > 20) {
      console.log(`  ... and ${results.allKeys.length - 20} more keys`);
    }
  }
  
  console.log("\n✅ Scan complete!");
};

module.exports = {
  showBanner,
  showImportAlert,
  displayScanResults,
};