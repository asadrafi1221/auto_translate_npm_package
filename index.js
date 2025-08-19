const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

const {
  showUsage,
  showBanner,
  showImportAlert,
} = require("./functions/index.js");
// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ask user questions
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
};

const TRANSLATABLE_ATTRIBUTES = [
  "placeholder",
  "alt",
  "title",
  "label",
  "aria-label",
];

// Utility functions
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

// Create sample React component

// Setup i18n structure with user choice
const setupI18nStructure = async () => {
  console.log("🌍 Setting up i18n structure...\n");

  // Ask user where to create i18n folder
  console.log("Where would you like to create the i18n folder?");
  console.log("1. Inside src/ directory (src/i18n/)");
  console.log("2. In current/root directory (./i18n/)");

  const locationChoice = await askQuestion("\nEnter your choice (1 or 2): ");

  let i18BasePath;
  if (locationChoice === "1") {
    const srcPath = path.join(process.cwd(), "src");
    createDirectory(srcPath);
    i18BasePath = srcPath;
    console.log("📁 Creating i18n folder inside src/");
  } else if (locationChoice === "2") {
    i18BasePath = process.cwd();
    console.log("📁 Creating i18n folder in current directory");
  } else {
    console.log("❌ Invalid choice. Defaulting to src/ directory");
    const srcPath = path.join(process.cwd(), "src");
    createDirectory(srcPath);
    i18BasePath = srcPath;
  }

  // Ask user about structure type
  console.log("\nChoose translation structure:");
  console.log("1. Single file (all translations in one file)");
  console.log("2. File-based (separate files for different sections)");

  const structureChoice = await askQuestion("\nEnter your choice (1 or 2): ");

  const i18Path = path.join(i18BasePath, "i18n");
  const jsonFilesPath = path.join(i18Path, "localization");

  // Create directories
  createDirectory(i18Path);
  createDirectory(jsonFilesPath);

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

    // Create the first file
    const firstFilePath = path.join(jsonFilesPath, `${sanitizedFileName}.js`);
    const sampleFileContent = `export const ${sanitizedFileName} = {
  hello: "hello",
  welcome: "Welcome",
  goodbye: "Goodbye",
};`;

    writeFile(firstFilePath, sampleFileContent);

    // Create index.js file
    const indexPath = path.join(jsonFilesPath, "index.js");
    const indexContent = `import { ${sanitizedFileName} } from './${sanitizedFileName}';

const enJSON = {
  // ${sanitizedFileName.charAt(0).toUpperCase() + sanitizedFileName.slice(1)}
  ...${sanitizedFileName},
};

export default enJSON;`;

    writeFile(indexPath, indexContent);

    // Create i18n.ts configuration file for file-based
    const i18nTsPath = path.join(i18Path, "i18n.ts");
    const i18nConfig = `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './localization/index.js';

const resources = {
  en: {
    translation: enTranslations,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
`;

    writeFile(i18nTsPath, i18nConfig);

    // Store config for file-based structure
    const configPath = path.join(
      process.cwd(),
      ".auto-translation-config.json"
    );
    const config = {
      i18nPath: i18Path,
      jsonFilesPath: jsonFilesPath,
      locationChoice: locationChoice,
      structureType: "file-based",
      currentFile: sanitizedFileName,
      files: [sanitizedFileName],
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log(`✅ File-based structure created!`);
    console.log(`📄 First file: ${sanitizedFileName}.js`);
    console.log(`📄 Index file: index.js`);
    console.log(`🔧 Use 'npx auto-translation file-update' to manage files`);
  } else {
    // Single file structure (original)
    const enJsonPath = path.join(jsonFilesPath, "en.json");
    const sampleTranslations = {
      hello: "hello",
      welcome: "Welcome",
      goodbye: "Goodbye",
    };

    if (!fs.existsSync(enJsonPath)) {
      writeFile(enJsonPath, JSON.stringify(sampleTranslations, null, 2));
    }

    // Create i18n.ts configuration file with correct import path
    const i18nTsPath = path.join(i18Path, "i18n.ts");
    const i18nConfig = `
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './localization/en.json';

const resources = {
  en: {
    translation: enTranslations,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
`;

    if (!fs.existsSync(i18nTsPath)) {
      writeFile(i18nTsPath, i18nConfig);
    }

    // Store the choice for scanning later
    const configPath = path.join(
      process.cwd(),
      ".auto-translation-config.json"
    );
    const config = {
      i18nPath: i18Path,
      jsonFilesPath: jsonFilesPath,
      locationChoice: locationChoice,
      structureType: "single-file",
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log(`\n✅ Single file structure created at: ${i18Path}`);
    console.log(
      `📄 Translation file: ${path.relative(process.cwd(), enJsonPath)}`
    );
  }

  return i18Path;
};

// Install required dependencies
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

// File management for file-based structure
const manageFiles = async () => {
  const configPath = path.join(process.cwd(), ".auto-translation-config.json");

  if (!fs.existsSync(configPath)) {
    console.log("❌ No config found! Run 'npx auto-translation init' first.");
    return;
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (error) {
    console.log("❌ Invalid config file!");
    return;
  }

  if (config.structureType !== "file-based") {
    console.log("❌ This command is only for file-based structures!");
    console.log(
      "💡 Your current structure is single-file. Use 'npx auto-translation scan' instead."
    );
    return;
  }

  console.log("📁 File Management Options:\n");
  console.log("1. Update existing file");
  console.log("2. Create new file");
  console.log("3. Switch active file");
  console.log("4. List all files");

  const choice = await askQuestion("\nEnter your choice (1-4): ");

  switch (choice) {
    case "1":
      await updateExistingFile(config);
      break;
    case "2":
      await createNewFile(config);
      break;
    case "3":
      await switchActiveFile(config);
      break;
    case "4":
      listAllFiles(config);
      break;
    default:
      console.log("❌ Invalid choice!");
      break;
  }
};

const updateExistingFile = async (config) => {
  if (!config.files || config.files.length === 0) {
    console.log("❌ No files found!");
    return;
  }

  console.log("\n📄 Available files:");
  config.files.forEach((file, index) => {
    const indicator = file === config.currentFile ? " (current)" : "";
    console.log(`  ${index + 1}. ${file}${indicator}`);
  });

  const choice = await askQuestion("\nEnter file number to update: ");
  const fileIndex = parseInt(choice) - 1;

  if (fileIndex < 0 || fileIndex >= config.files.length) {
    console.log("❌ Invalid file number!");
    return;
  }

  const selectedFile = config.files[fileIndex];
  config.currentFile = selectedFile;

  // Save updated config
  const configPath = path.join(process.cwd(), ".auto-translation-config.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(`✅ Switched to file: ${selectedFile}`);
  console.log("🔍 Now run 'npx auto-translation scan' to update this file");
};

const createNewFile = async (config) => {
  const fileName = await askQuestion("Enter name for new translation file: ");
  const sanitizedFileName = fileName.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");

  if (config.files.includes(sanitizedFileName)) {
    console.log(`❌ File '${sanitizedFileName}' already exists!`);
    return;
  }

  // Create the new file
  const newFilePath = path.join(
    config.jsonFilesPath,
    `${sanitizedFileName}.js`
  );
  const newFileContent = `export const ${sanitizedFileName} = {
  // Add your ${sanitizedFileName} translations here
};`;

  writeFile(newFilePath, newFileContent);

  // Update index.js
  const indexPath = path.join(config.jsonFilesPath, "index.js");

  // Read current index.js
  let indexContent = "";
  if (fs.existsSync(indexPath)) {
    indexContent = fs.readFileSync(indexPath, "utf-8");
  }

  // Add import for new file
  const importLine = `import { ${sanitizedFileName} } from './${sanitizedFileName}';`;
  const spreadLine = `  // ${
    sanitizedFileName.charAt(0).toUpperCase() + sanitizedFileName.slice(1)
  }\n  ...${sanitizedFileName},`;

  // Update imports section
  if (indexContent.includes("import {")) {
    // Add to existing imports
    const lines = indexContent.split("\n");
    let importInserted = false;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("import {") && !importInserted) {
        lines.splice(i + 1, 0, importLine);
        importInserted = true;
        break;
      }
    }

    // Add to enJSON object
    const enJSONIndex = lines.findIndex((line) =>
      line.includes("const enJSON = {")
    );
    if (enJSONIndex !== -1) {
      // Find the closing brace
      for (let i = enJSONIndex + 1; i < lines.length; i++) {
        if (lines[i].includes("};")) {
          lines.splice(i, 0, spreadLine);
          break;
        }
      }
    }

    indexContent = lines.join("\n");
  } else {
    // Create new index.js
    indexContent = `${importLine}

const enJSON = {
${spreadLine}
};

export default enJSON;`;
  }

  fs.writeFileSync(indexPath, indexContent);

  // Update config
  config.files.push(sanitizedFileName);
  config.currentFile = sanitizedFileName;

  const configPath = path.join(process.cwd(), ".auto-translation-config.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(`✅ Created new file: ${sanitizedFileName}.js`);
  console.log(`📝 Updated index.js with import`);
  console.log(`🎯 Switched to new file: ${sanitizedFileName}`);
  console.log(
    "🔍 Now run 'npx auto-translation scan' to add keys to this file"
  );
};

const switchActiveFile = async (config) => {
  if (!config.files || config.files.length === 0) {
    console.log("❌ No files found!");
    return;
  }

  console.log("\n📄 Available files:");
  config.files.forEach((file, index) => {
    const indicator = file === config.currentFile ? " (current)" : "";
    console.log(`  ${index + 1}. ${file}${indicator}`);
  });

  const choice = await askQuestion("\nEnter file number to switch to: ");
  const fileIndex = parseInt(choice) - 1;

  if (fileIndex < 0 || fileIndex >= config.files.length) {
    console.log("❌ Invalid file number!");
    return;
  }

  const selectedFile = config.files[fileIndex];

  if (selectedFile === config.currentFile) {
    console.log(`ℹ️  Already using file: ${selectedFile}`);
    return;
  }

  config.currentFile = selectedFile;

  // Save updated config
  const configPath = path.join(process.cwd(), ".auto-translation-config.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(`✅ Switched to file: ${selectedFile}`);
  console.log("🔍 Now run 'npx auto-translation scan' to update this file");
};

const listAllFiles = (config) => {
  if (!config.files || config.files.length === 0) {
    console.log("❌ No files found!");
    return;
  }

  console.log("\n📄 All translation files:");
  config.files.forEach((file, index) => {
    const indicator = file === config.currentFile ? " (current)" : "";
    const filePath = path.join(config.jsonFilesPath, `${file}.js`);
    const exists = fs.existsSync(filePath) ? "✅" : "❌";
    console.log(`  ${index + 1}. ${file}${indicator} ${exists}`);
  });

  console.log(`\n🎯 Current active file: ${config.currentFile}`);
  console.log("💡 Use 'npx auto-translation scan' to update the current file");
};

// Helper function to flatten nested object to check existing keys
const flattenObject = (obj, prefix = "") => {
  const flattened = {};

  Object.keys(obj || {}).forEach((key) => {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      Object.assign(flattened, flattenObject(obj[key], newKey));
    } else {
      flattened[newKey] = obj[key];
    }
  });

  return flattened;
};

// Helper function to update nested object values
const updateNestedObject = (obj) => {
  const updated = {};
  Object.keys(obj || {}).forEach((key) => {
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      updated[key] = updateNestedObject(obj[key]);
    } else {
      // For nested values, use only the key name, not the full path
      updated[key] = key;
    }
  });
  return updated;
};

// Support dot notation for nested keys with correct values
const processNestedKeys = (existingTranslations, keysIterable) => {
  const allKeys = Array.isArray(keysIterable)
    ? keysIterable
    : Array.from(keysIterable || []);
  const nested = {};
  const flatKeys = {};

  // Process all found keys
  allKeys.forEach((key) => {
    if (typeof key !== "string") return;
    if (key.includes(".")) {
      const parts = key.split(".");
      let current = nested;

      // Build nested structure
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }

      // Use only the last part as the value, not the full key
      const lastPart = parts[parts.length - 1];
      current[lastPart] = lastPart; // "home" instead of "navigation.menu.home"
    } else {
      flatKeys[key] = key; // Simple key = key
    }
  });

  // Merge nested into flat, preserving existing translations
  const result = { ...existingTranslations, ...flatKeys, ...nested };

  // Update any existing nested keys with correct values
  Object.keys(result || {}).forEach((key) => {
    if (
      typeof result[key] === "object" &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = updateNestedObject(result[key]);
    }
  });

  return result;
};

// Read exported object from a file-based .js translation file
const readJsExportObject = (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const match = fileContent.match(/export const \w+\s*=\s*({[\s\S]*?});/);
    if (match) {
      return eval(`(${match[1]})`);
    }
  } catch (e) {
    console.warn(`⚠️  Couldn't read ${filePath}: ${e.message}`);
  }
  return {};
};

// Collect all existing flattened keys across other files (file-based)
const getExistingKeysInOtherFiles = (jsonFilesPath, currentFileBaseName) => {
  const keys = new Set();
  if (!fs.existsSync(jsonFilesPath)) return keys;
  const files = fs
    .readdirSync(jsonFilesPath)
    .filter(
      (f) =>
        f.endsWith(".js") &&
        f !== "index.js" &&
        f !== `${currentFileBaseName}.js`
    );

  files.forEach((fname) => {
    const fpath = path.join(jsonFilesPath, fname);
    const obj = readJsExportObject(fpath);
    const flat = flattenObject(obj);
    Object.keys(flat).forEach((k) => keys.add(k));
  });
  return keys;
};

// Main scanning function
const scanAndUpdateTranslations = () => {
  const fs = require("fs");
  const path = require("path");

  // Helper: Flatten nested object
  const flattenObject = (obj, prefix = "", res = {}) => {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        flattenObject(obj[key], prefix + key + ".", res);
      } else {
        res[prefix + key] = obj[key];
      }
    }
    return res;
  };

  // Helper: Flatten nested object but skip the first level for file-based
  const flattenObjectForFileBased = (obj) => {
    const result = {};

    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        // If it's a nested object, extract its keys directly (skip the parent key)
        for (const nestedKey in obj[key]) {
          if (typeof obj[key][nestedKey] !== "object") {
            result[nestedKey] = obj[key][nestedKey];
          }
        }
      } else {
        // If it's a direct key-value pair, keep it as-is
        result[key] = obj[key];
      }
    }

    return result;
  };

  const setNestedValueIfEmpty = (obj, keyPath, defaultValue = "") => {
    const keys = keyPath.split(".");
    let current = obj;

    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        // CRITICAL FIX: Only set if key doesn't exist OR value is empty/null/undefined
        if (
          !current.hasOwnProperty(key) ||
          current[key] === "" ||
          current[key] === null ||
          current[key] === undefined
        ) {
          current[key] = defaultValue || keys[keys.length - 1]; // Use the last part of the key as default
        }
        // If key exists with a value, DON'T TOUCH IT!
      } else {
        if (!current[key]) current[key] = {};
        current = current[key];
      }
    });
  };

  // Merge new keys into existing translations WITHOUT overwriting existing values
  const processNestedKeys = (existing, newKeysArray) => {
    let result;

    if (isFileBased) {
      // For file-based: Extract existing flat keys but preserve nested structure for new keys
      result = flattenObjectForFileBased(existing);

      // Convert back to nested structure for both existing and new keys
      const finalResult = {};

      for (const [key, value] of Object.entries(result)) {
        if (key.includes(".")) {
          setNestedValueIfEmpty(finalResult, key, value);
        } else {
          finalResult[key] = value;
        }
      }

      newKeysArray.forEach((key) => {
        setNestedValueIfEmpty(finalResult, key, key.split(".").pop());
      });

      return finalResult;
    } else {
      // For JSON-based: create nested structure using dot notation
      result = JSON.parse(JSON.stringify(existing)); // Deep clone to avoid mutations

      newKeysArray.forEach((key) => {
        setNestedValueIfEmpty(result, key, key.split(".").pop());
      });

      return result;
    }
  };

  // Read exported object from a file-based .js translation file
  const readJsExportObject = (filePath) => {
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const match = fileContent.match(/export const \w+\s*=\s*({[\s\S]*?});/);
      if (match) {
        return eval(`(${match[1]})`);
      }
    } catch (e) {
      console.warn(`⚠️  Couldn't read ${filePath}: ${e.message}`);
    }
    return {};
  };

  // Collect all existing flattened keys across other files (file-based)
  const getExistingKeysInOtherFiles = (jsonFilesPath, currentFileBaseName) => {
    const keys = new Set();
    if (!fs.existsSync(jsonFilesPath)) return keys;

    const files = fs
      .readdirSync(jsonFilesPath)
      .filter(
        (f) =>
          f.endsWith(".js") &&
          f !== "index.js" &&
          f !== `${currentFileBaseName}.js`
      );

    files.forEach((fname) => {
      const fpath = path.join(jsonFilesPath, fname);
      const obj = readJsExportObject(fpath);
      const flat = flattenObject(obj);
      Object.keys(flat).forEach((k) => keys.add(k));
    });

    console.log(
      `🔍 Found ${keys.size} existing keys in ${files.length} other files`
    );
    return keys;
  };

  // -------------------- Begin Main Function --------------------
  const configPath = path.join(process.cwd(), ".auto-translation-config.json");
  let config;
  let targetFile;
  let isFileBased = false;
  let currentFile = null;

  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      console.log(`📂 Using i18n folder: ${config.i18nPath}`);

      if (config.structureType === "file-based") {
        isFileBased = true;
        currentFile = config.currentFile;
        targetFile = path.join(config.jsonFilesPath, `${currentFile}.js`);
        console.log(`🎯 Updating file-based structure: ${currentFile}.js`);
      } else {
        targetFile = path.join(config.jsonFilesPath, "en.json");
        console.log("🎯 Updating single file structure: en.json");
      }
    } catch (error) {
      console.log("⚠️  Config file exists but is invalid. Using default path.");
      targetFile = path.join(process.cwd(), "src/i18n/jsonFiles/en.json");
    }
  } else {
    const srcPath = path.join(process.cwd(), "src/i18n/jsonFiles/en.json");
    const rootPath = path.join(process.cwd(), "i18n/jsonFiles/en.json");
    if (fs.existsSync(srcPath)) targetFile = srcPath;
    else if (fs.existsSync(rootPath)) targetFile = rootPath;
    else {
      console.log(
        "❌ No i18n folder found! Run 'npx auto-translation init' first."
      );
      return;
    }
  }

  let existingTranslations = {};
  if (fs.existsSync(targetFile)) {
    try {
      existingTranslations = isFileBased
        ? readJsExportObject(targetFile)
        : JSON.parse(fs.readFileSync(targetFile, "utf-8"));
    } catch (error) {
      console.error(`❌ Error reading ${targetFile}:`, error.message);
      existingTranslations = {};
    }
  }

  const existingInOtherFiles = isFileBased
    ? getExistingKeysInOtherFiles(config.jsonFilesPath, currentFile)
    : new Set();

  console.log(`📄 Current file: ${currentFile || "en.json"}`);
  if (isFileBased && existingInOtherFiles.size > 0) {
    console.log(
      `🚫 Keys to skip (exist in other files): ${existingInOtherFiles.size}`
    );
  }

  const findFiles = (dir, extensions = [".tsx", ".jsx", ".js", ".ts"]) => {
    let results = [];
    if (!fs.existsSync(dir)) return results;

    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (
        item.isDirectory() &&
        ![
          "node_modules",
          "dist",
          "build",
          ".git",
          ".next",
          "coverage",
          "public",
          ".vscode",
          ".idea",
        ].includes(item.name)
      ) {
        results = results.concat(findFiles(fullPath, extensions));
      } else if (
        item.isFile() &&
        extensions.some((ext) => item.name.endsWith(ext))
      ) {
        results.push(fullPath);
      }
    }
    return results;
  };

  const projectRoot = process.cwd();
  const reactFiles = findFiles(projectRoot);

  const tPatterns = [
    /\bt\s*\(\s*['"`]([^'"`\n\r]+?)['"`]\s*\)/g,
    /\{\s*t\s*\(\s*['"`]([^'"`\n\r]+?)['"`]\s*\)\s*\}/g,
    /=\s*t\s*\(\s*['"`]([^'"`\n\r]+?)['"`]\s*\)/g,
    /[\(,]\s*t\s*\(\s*['"`]([^'"`\n\r]+?)['"`]\s*\)/g,
    /=\s*\{\s*t\s*\(\s*['"`]([^'"`\n\r]+?)['"`]\s*\)\s*\}/g,
  ];

  let allFoundKeys = new Set();
  let newKeys = new Set();
  let emptyKeys = new Set();
  const flattenedExisting = flattenObject(existingTranslations);

  reactFiles.forEach((file) => {
    try {
      const content = fs.readFileSync(file, "utf-8");
      tPatterns.forEach((pattern) => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const key = match[1].trim();
          if (key && !allFoundKeys.has(key)) {
            allFoundKeys.add(key);
            const existsInCurrent = Object.prototype.hasOwnProperty.call(
              flattenedExisting,
              key
            );
            const existsInOthers = existingInOtherFiles.has(key);

            if (!existsInCurrent && !existsInOthers) {
              newKeys.add(key); // Completely new key
            } else if (
              existsInCurrent &&
              (flattenedExisting[key] === "" ||
                flattenedExisting[key] === null ||
                flattenedExisting[key] === undefined)
            ) {
              emptyKeys.add(key);
              newKeys.add(key);
            } else if (existsInOthers) {
              // Key exists in other files - SKIP IT!
              console.log(`⏭️  Skipping "${key}" - exists in another file`);
            }
          }
        }
        pattern.lastIndex = 0;
      });
    } catch (error) {
      console.error(`❌ Error reading file ${file}:`, error.message);
    }
  });

  // CRITICAL: Only process keys that are new or empty - preserve existing values
  const processedTranslations = processNestedKeys(
    existingTranslations,
    Array.from(newKeys)
  );

  try {
    if (isFileBased) {
      const fileContent = `export const ${currentFile} = ${JSON.stringify(
        processedTranslations,
        null,
        2
      )};`;
      fs.writeFileSync(targetFile, fileContent);
    } else {
      fs.writeFileSync(
        targetFile,
        JSON.stringify(processedTranslations, null, 2)
      );
    }

    console.log(
      `\n✅ Translation file updated: ${path.relative(
        process.cwd(),
        targetFile
      )}`
    );
    console.log(`📊 Total keys found in code: ${allFoundKeys.size}`);
    console.log(`🆕 New keys added: ${newKeys.size - emptyKeys.size}`);
    console.log(`🔧 Empty keys filled: ${emptyKeys.size}`);
    console.log(
      `🚫 Keys skipped (in other files): ${allFoundKeys.size - newKeys.size}`
    );
    console.log(`🛡️  Existing translations preserved!`);

    if (newKeys.size === 0) {
      console.log(`👍 No new keys to add - all translations are up to date!`);
    }
  } catch (error) {
    console.error("❌ Error writing translations file:", error.message);
  }
};

const createBackup = (file, content, backupDir) => {
  const relativePath = path.relative(process.cwd(), file);
  const backupPath = path.join(backupDir, relativePath);
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.writeFileSync(backupPath, content);
};

const undoWrap = (backupDir) => {
  if (!fs.existsSync(backupDir)) {
    console.log("⚠️ No backup found. Nothing to undo.");
    return;
  }

  const restoreFiles = (dir) => {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        restoreFiles(fullPath);
      } else {
        const relativePath = path.relative(backupDir, fullPath);
        const originalPath = path.join(process.cwd(), relativePath);
        fs.copyFileSync(fullPath, originalPath);
        console.log(`♻️ Restored: ${relativePath}`);
      }
    }
  };

  restoreFiles(backupDir);
  fs.rmSync(backupDir, { recursive: true, force: true });
  console.log("\n✅ Undo complete. All changes reverted.");
};

const wrapPlainTextWithTranslation = async () => {
  const projectRoot = process.cwd();
  const backupDir = path.join(projectRoot, ".auto-translation-backup");

  // Create backup directory
  if (fs.existsSync(backupDir)) {
    console.log("🗂️  Clearing existing backups...");
    fs.rmSync(backupDir, { recursive: true, force: true });
  }
  fs.mkdirSync(backupDir, { recursive: true });

  const findFiles = (dir, extensions = [".tsx", ".jsx"]) => {
    let results = [];
    if (!fs.existsSync(dir)) return results;

    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (
        item.isDirectory() &&
        ![
          "node_modules",
          "dist",
          "build",
          ".git",
          ".next",
          "coverage",
          "public",
          ".vscode",
          ".idea",
        ].includes(item.name)
      ) {
        results = results.concat(findFiles(fullPath, extensions));
      } else if (
        item.isFile() &&
        extensions.some((ext) => item.name.endsWith(ext))
      ) {
        results.push(fullPath);
      }
    }
    return results;
  };

  const hooksDir = path.join(projectRoot, "libs", "hooks");
  const hooksFile = path.join(hooksDir, "index.ts");

  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
    console.log("📂 Created libs/hooks directory");
  }

  if (!fs.existsSync(hooksFile)) {
    fs.writeFileSync(
      hooksFile,
      `// Auto-generated hook wrapper
import { useTranslation } from "react-i18next";

export { useTranslation };
`
    );
    console.log("📝 Created libs/hooks/index.tsx");
  }

  const reactFiles = findFiles(projectRoot);

  if (reactFiles.length === 0) {
    console.log(
      "⚠️  No React files found! Make sure you have .jsx or .tsx files."
    );
    return;
  }

  let totalWrapped = 0;
  let totalFiles = 0;
  const modifiedFiles = [];

  reactFiles.forEach((file) => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`🔎 Processing: ${relativePath}`);

    try {
      let content = fs.readFileSync(file, "utf-8");
      const originalContent = content; // Store original for comparison

      let fileWrapped = 0;
      let hasUseTranslation =
        /const\s*{\s*t\s*}\s*=\s*useTranslation\s*\(\s*\)/.test(content);
      let hasCustomImport =
        /import.*useTranslation.*from\s*['"]@\/libs\/hooks['"]/.test(content);

      // 🔄 Replace react-i18next import with libs/hooks
      content = content.replace(
        /import.*useTranslation.*from\s*['"]react-i18next['"]\s*;?/,
        ""
      );

      if (!hasCustomImport) {
        content = `import { useTranslation } from "@/libs/hooks";\n` + content;
        console.log("  ➕ Updated import to @/libs/hooks");
      }

      const generateKey = (text) =>
        text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .trim()
          .substring(0, 50);

      const shouldWrapText = (text) => {
        const trimmed = text.trim();
        if (!trimmed || trimmed.length < 2) return false;
        if (/t\s*\(\s*['"`]/.test(trimmed)) return false;
        if (/^\d+$/.test(trimmed)) return false;
        if (/^https?:\/\//.test(trimmed)) return false;
        if (/^\$/.test(trimmed) || /\{.*\}/.test(trimmed)) return false;
        if (/^(true|false|null|undefined)$/.test(trimmed)) return false;
        return /[a-zA-Z]/.test(trimmed);
      };

      // Wrap JSX text between tags
      content = content.replace(/>([^<>{}\n\r]+)</g, (match, text) => {
        if (shouldWrapText(text)) {
          const key = generateKey(text);
          fileWrapped++;
          return `>{t("${key}")}<`;
        }
        return match;
      });

      // Wrap JSX expressions {"text"}
      content = content.replace(
        /\{\s*['"`]([^'"`\n\r]+?)['"`]\s*\}/g,
        (match, text) => {
          if (shouldWrapText(text)) {
            const key = generateKey(text);
            fileWrapped++;
            return `{t("${key}")}`;
          }
          return match;
        }
      );

      // Wrap translatable attributes
      const TRANSLATABLE_ATTRIBUTES = [
        "title",
        "alt",
        "placeholder",
        "aria-label",
      ];
      TRANSLATABLE_ATTRIBUTES.forEach((attr) => {
        const attrPattern = new RegExp(
          `${attr}\\s*=\\s*['"\`]([^'"\`\\n\\r]+?)['"\`]`,
          "g"
        );
        content = content.replace(attrPattern, (match, text) => {
          if (shouldWrapText(text)) {
            const key = generateKey(text);
            fileWrapped++;
            return `${attr}={t("${key}")}`;
          }
          return match;
        });
      });

      // Add useTranslation hook inside component if missing
      if (!hasUseTranslation) {
        content = content.replace(
          /(function\s+\w+\s*\([^)]*\)\s*{|const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{)/,
          (match) => match + "\n  const { t } = useTranslation();"
        );
        if (fileWrapped > 0)
          console.log("  ➕ Added useTranslation hook inside component");
      }

      // Only create backup and update file if changes were made
      if (content !== originalContent) {
        // Create backup before modifying
        createBackup(file, originalContent, backupDir);

        fs.writeFileSync(file, content);
        totalFiles++;
        modifiedFiles.push(relativePath);
      }

      totalWrapped += fileWrapped;
    } catch (error) {
      console.error(`❌ Error processing file ${file}:`, error.message);
    }
  });

  // Save manifest of modified files
  const manifestPath = path.join(backupDir, "manifest.json");
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        modifiedFiles: modifiedFiles,
        totalWrapped: totalWrapped,
        totalFiles: totalFiles,
      },
      null,
      2
    )
  );

  console.log(
    `\n✅ Wrap process complete! Files modified: ${totalFiles}, Text wrapped: ${totalWrapped}`
  );
  console.log(
    `💾 Backups created in: ${path.relative(process.cwd(), backupDir)}`
  );

  // Ask user if they want to keep changes
  const keep = await askQuestion(
    "\nDo you want to KEEP these changes? (y/n): "
  );
  if (keep.toLowerCase() !== "y") {
    console.log("↩️ Reverting changes...");
    undoWrap(backupDir);
  } else {
    console.log("👍 Changes kept.");
  }
};

// Main CLI logic
const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0];

  showBanner();

  try {
    switch (command) {
      case "init":
        console.log("🏗️  Initializing i18n setup...\n");
        const i18nPath = await setupI18nStructure();
        await installDependencies();

        console.log("\n✅ Setup complete!");
        showImportAlert(i18nPath);

        console.log("📋 Next steps:");
        console.log("1. ✅ Dependencies installed");
        console.log("2. Import i18n config in your layout file (see above)");
        console.log(
          "3. Run 'npx auto-translation scan' to extract translation keys"
        );
        console.log("");
        break;

      case "scan":
        console.log("🔍 Scanning for translation keys...\n");
        scanAndUpdateTranslations();
        break;

      case "wrap":
        console.log("🔄 Wrapping plain text with t() calls...\n");
        await wrapPlainTextWithTranslation();
        break;

      case "file-update":
        console.log("📁 Managing translation files...\n");
        await manageFiles();
        break;

      case "setup":
        console.log("📁 Setting up folder structure...\n");
        await setupI18nStructure();
        break;

      default:
        showUsage();
        break;
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
};

module.exports = {
  setupI18nStructure,
  installDependencies,
  scanAndUpdateTranslations,
  manageFiles,
  main,
};

if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Fatal error:", error.message);
    process.exit(1);
  });
}
