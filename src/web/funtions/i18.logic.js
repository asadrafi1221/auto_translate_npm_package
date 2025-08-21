#!/usr/bin/env node


const { askQuestion } = require("./cli.commands.js");
const fs = require("fs");
const path = require("path");

// const flattenObject = (obj, prefix = "") => {
//   const flattened = {};

//   Object.keys(obj || {}).forEach((key) => {
//     const newKey = prefix ? `${prefix}.${key}` : key;

//     if (
//       typeof obj[key] === "object" &&
//       obj[key] !== null &&
//       !Array.isArray(obj[key])
//     ) {
//       Object.assign(flattened, flattenObject(obj[key], newKey));
//     } else {
//       flattened[newKey] = obj[key];
//     }
//   });

//   return flattened;
// };

// // Helper function to update nested object values
// const updateNestedObject = (obj) => {
//   const updated = {};
//   Object.keys(obj || {}).forEach((key) => {
//     if (
//       typeof obj[key] === "object" &&
//       obj[key] !== null &&
//       !Array.isArray(obj[key])
//     ) {
//       updated[key] = updateNestedObject(obj[key]);
//     } else {
//       // For nested values, use only the key name, not the full path
//       updated[key] = key;
//     }
//   });
//   return updated;
// };

const scanAndUpdateTranslations = () => {

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


module.exports = {
    scanAndUpdateTranslations,
    wrapPlainTextWithTranslation,
}