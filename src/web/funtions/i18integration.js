#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { askQuestion } = require("./cli.commands.js");
const { getCurrentMode } = require("./handle.mode.js");

// --- Helpers ---
const createDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
};

const writeFile = (filePath, content) => {
  fs.writeFileSync(filePath, content);
  console.log(`📄 Created file: ${filePath}`);
};

// helper to detect project root (where package.json is)
const findProjectRoot = (startDir = process.cwd()) => {
  let dir = startDir;
  while (true) {
    const pkgPath = path.join(dir, "package.json");
    if (fs.existsSync(pkgPath)) return dir; // found root

    const parent = path.dirname(dir);
    if (parent === dir) break; // reached system root
    dir = parent;
  }
  return process.cwd(); // fallback
};


const setupI18nStructure = async () => {
  console.log("🌍 Setting up i18n structure...\n");

  // Auto-detect project structure and mode
  const PROJECT_ROOT = findProjectRoot();
  const currentMode = getCurrentMode(); // "react" | "rn"

  // Decide where i18n goes automatically
  const srcPath = path.join(PROJECT_ROOT, "src");
  let i18BasePath;
  if (fs.existsSync(srcPath) && fs.statSync(srcPath).isDirectory()) {
    i18BasePath = srcPath;
    console.log("📁 Creating i18n folder inside project-root/src/");
  } else {
    i18BasePath = PROJECT_ROOT;
    console.log("📁 Creating i18n folder inside project root");
  }

  // Ask user about structure type
  console.log("\nChoose translation structure:");
  console.log("1. Single file (all translations in one file)");
  console.log("2. File-based (separate files for different sections)");

  const structureChoice = await askQuestion("\nEnter your choice (1 or 2): ");

  const i18Path = path.join(i18BasePath, "i18n");
  const localesPath = path.join(i18Path, "locales");

  // Create directories
  createDirectory(i18Path);
  createDirectory(localesPath);

  if (structureChoice === "2") {
    // File-based structure
    console.log("\n📁 Setting up file-based structure...\n");

    // Ask for initial file name
    const fileName = await askQuestion(
      "Enter name for your first translation file (e.g., 'commons', 'dashboard'): "
    );
    const sanitizedFileName = fileName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "");

    // Create en folder for file-based structure
    const enFolderPath = path.join(localesPath, "en");
    createDirectory(enFolderPath);

    // Create the first file
    const firstFilePath = path.join(enFolderPath, `${sanitizedFileName}.js`);
    const sampleFileContent = `export const ${sanitizedFileName} = {
  hello: "hello",
  welcome: "Welcome",
  goodbye: "Goodbye",
};`;

    writeFile(firstFilePath, sampleFileContent);

    // Create index.js that exports the current file
    const indexContent = `import { ${sanitizedFileName} } from './${sanitizedFileName}';

const enJSON = {
  // ${sanitizedFileName.charAt(0).toUpperCase() + sanitizedFileName.slice(1)}
  ...${sanitizedFileName},
};

export default enJSON;`;

    const indexFilePath = path.join(enFolderPath, "index.js");
    writeFile(indexFilePath, indexContent);

    // Generate appropriate i18n setup based on mode
    const importPath = "./locales/en";
    let i18nConfig;

    if (currentMode === "react") {
      i18nConfig = `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '${importPath}';

const resources = {
  en: { translation: en },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
`;
    } else {
      i18nConfig = `import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import en from '${importPath}';

const i18n = new I18n({
  en,
});

i18n.enableFallback = true;
i18n.locale = Localization.locale;

export default i18n;
`;
    }

    const i18nSetupPath = path.join(i18Path, "index.js");
    writeFile(i18nSetupPath, i18nConfig);

    // Store config for file-based structure
    const configPath = path.join(PROJECT_ROOT, ".auto-translation-config.json");
    const config = {
      i18nPath: i18Path,
      jsonFilesPath: enFolderPath,
      structureType: "file-based",
      currentFile: sanitizedFileName,
      files: [sanitizedFileName],
      mode: currentMode
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log(`✅ File-based structure created for ${currentMode.toUpperCase()}!`);
    console.log(`📄 First file: ${sanitizedFileName}.js`);
    console.log(`📄 Index file: index.js`);
    console.log(`🔧 Use 'npx auto-translation file-update' to manage files`);
  } else {
    // Single file structure
    console.log("\n📄 Setting up single file structure...\n");

    // Create en folder for single file structure
    const enFolderPath = path.join(localesPath, "en");
    createDirectory(enFolderPath);

    // Create en.json file
    const enJsonPath = path.join(enFolderPath, "en.json");
    const sampleTranslations = {
      "hello": "Hello",
      "welcome": "Welcome",
      "goodbye": "Goodbye",
    };

    if (!fs.existsSync(enJsonPath)) {
      writeFile(enJsonPath, JSON.stringify(sampleTranslations, null, 2));
    }

    // Generate appropriate i18n setup based on mode
    const importPath = "./locales/en/en.json";
    let i18nConfig;

    if (currentMode === "react") {
      i18nConfig = `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '${importPath}';

const resources = {
  en: { translation: en },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
`;
    } else {
      i18nConfig = `import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import en from '${importPath}';

const i18n = new I18n({
  en,
});

i18n.enableFallback = true;
i18n.locale = Localization.locale;

export default i18n;
`;
    }

    const i18nSetupPath = path.join(i18Path, "index.js");
    if (!fs.existsSync(i18nSetupPath)) {
      writeFile(i18nSetupPath, i18nConfig);
    }

    // Store the choice for scanning later
    const configPath = path.join(PROJECT_ROOT, ".auto-translation-config.json");
    const config = {
      i18nPath: i18Path,
      jsonFilesPath: enFolderPath,
      structureType: "single-file",
      mode: currentMode
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log(`✅ Single file structure created for ${currentMode.toUpperCase()}!`);
    console.log(`📄 Translation file: ${path.relative(PROJECT_ROOT, enJsonPath)}`);
  }

  console.log(`\n🎉 I18n setup complete for ${currentMode.toUpperCase()}!`);
  console.log(`📦 Import in your app: import i18n from './i18n';`);

  return i18Path;
};
module.exports = { setupI18nStructure };


