#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// --- Helpers ---
const createDirectory = (dirPath, root) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${path.relative(root, dirPath)}`);
  }
};

const writeFile = (filePath, content, root) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`📄 Created file: ${path.relative(root, filePath)}`);
  }
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

// --- Main setup ---
const setupI18nStructure = () => {
  console.log("🌍 Setting up i18n structure...\n");

  const PROJECT_ROOT = findProjectRoot();

  // Decide where i18n goes
  const srcPath = path.join(PROJECT_ROOT, "src");
  let i18BasePath;
  if (fs.existsSync(srcPath) && fs.statSync(srcPath).isDirectory()) {
    i18BasePath = srcPath; // src exists
    console.log("📁 Creating i18n folder inside project-root/src/");
  } else {
    i18BasePath = PROJECT_ROOT; // no src → root
    console.log("📁 Creating i18n folder inside project root");
  }

  // Create folder structure
  const i18Path = path.join(i18BasePath, "i18n");
  const jsonFilesPath = path.join(i18Path, "localization");

  createDirectory(i18Path, PROJECT_ROOT);
  createDirectory(jsonFilesPath, PROJECT_ROOT);

  // Create default en.json
  const enJsonPath = path.join(jsonFilesPath, "en.json");
  const sampleTranslations = {
    hello: "hello",
    welcome: "Welcome",
    goodbye: "Goodbye",
  };
  writeFile(enJsonPath, JSON.stringify(sampleTranslations, null, 2), PROJECT_ROOT);

  // Create default i18n.ts
  const i18nTsPath = path.join(i18Path, "i18n.ts");
  const i18nConfig = `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './localization/en.json';

const resources = {
  en: { translation: enTranslations },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
`;
  writeFile(i18nTsPath, i18nConfig, PROJECT_ROOT);

  // Save config in root
  const configPath = path.join(PROJECT_ROOT, ".auto-translation-config.json");
  const config = {
    i18nPath: i18Path,
    jsonFilesPath,
    structureType: "single-file",
  };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`⚙️  Saved config at: ${path.relative(PROJECT_ROOT, configPath)}`);

  console.log(`✅ i18n setup completed at: ${path.relative(PROJECT_ROOT, i18Path)}`);
  return i18Path;
};

module.exports = { setupI18nStructure };
