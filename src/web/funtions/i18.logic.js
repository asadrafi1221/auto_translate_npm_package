#!/usr/bin/env node

const { askQuestion } = require("./cli.commands.js");
const fs = require("fs");
const path = require("path");

// ---------------- Helper Functions ----------------
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

const setNestedValueIfEmpty = (obj, keyPath, defaultValue = "") => {
  const keys = keyPath.split(".");
  let current = obj;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      if (
        !current.hasOwnProperty(key) ||
        current[key] == null ||
        current[key] === ""
      ) {
        current[key] = defaultValue || keys[keys.length - 1];
      }
    } else {
      if (!current[key]) current[key] = {};
      current = current[key];
    }
  });
};

const processNestedKeys = (
  existing,
  newKeysArray,
  isFileBased = false,
  currentFile
) => {
  let result;

  if (isFileBased) {
    // For file-based: flatten existing keys, then merge
    result = {};
    newKeysArray.forEach((key) => {
      setNestedValueIfEmpty(result, key, key.split(".").pop());
    });
    return { ...existing, ...result };
  } else {
    result = JSON.parse(JSON.stringify(existing)); // Deep clone
    newKeysArray.forEach((key) => {
      setNestedValueIfEmpty(result, key, key.split(".").pop());
    });
    return result;
  }
};

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

const findI18nFolder = (startDir = process.cwd()) => {
  const visited = new Set();

  // Find project root
  const findProjectRoot = (dir) => {
    while (true) {
      const indicators = ["package.json", ".git", "node_modules"];
      const hasIndicator = indicators.some((indicator) =>
        fs.existsSync(path.join(dir, indicator))
      );

      if (hasIndicator) return dir;

      const parent = path.dirname(dir);
      if (parent === dir) return dir;
      dir = parent;
    }
  };

  // Recursive search for i18n folder
  const searchForI18n = (dir) => {
    if (visited.has(dir)) return null;
    visited.add(dir);

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      // Check if i18n folder exists in current directory
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name === "i18n") {
          return path.join(dir, "i18n");
        }
      }

      // Search subdirectories
      for (const entry of entries) {
        if (
          entry.isDirectory() &&
          !entry.name.startsWith(".") &&
          entry.name !== "node_modules" &&
          entry.name !== "dist" &&
          entry.name !== "build"
        ) {
          const result = searchForI18n(path.join(dir, entry.name));
          if (result) return result;
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }

    return null;
  };

  const projectRoot = findProjectRoot(startDir);
  return searchForI18n(projectRoot);
};

const readJsExportObject = (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const match = fileContent.match(/export const \w+\s*=\s*({[\s\S]*?});/);
    if (match) return eval(`(${match[1]})`);
  } catch (e) {
    console.warn(`⚠️ Couldn't read ${filePath}: ${e.message}`);
  }
  return {};
};

const findProjectRoot = (startDir = process.cwd()) => {
  let dir = startDir;
  while (true) {
    const pkgPath = path.join(dir, "package.json");
    if (fs.existsSync(pkgPath)) return dir; // found root

    const parent = path.dirname(dir);
    if (parent === dir) break; // system root reached
    dir = parent;
  }
  return process.cwd(); // fallback (shouldn't happen if pkg exists)
};

const getIgnoredKeys = () => {
  const PROJECT_ROOT = findProjectRoot();
  const ignoreFilePath = path.join(PROJECT_ROOT, ".ignoreKeys");

  if (fs.existsSync(ignoreFilePath)) {
    try {
      const content = fs.readFileSync(ignoreFilePath, "utf-8");
      const parsed = JSON.parse(content);
      return new Set(parsed.ignoredKeys || []);
    } catch (error) {
      console.warn("⚠️ Could not parse .ignoreKeys file:", error.message);
    }
  }

  return new Set();
};

const scanAndUpdateTranslations = async (filesToScan = null) => {
  const ignoredKeys = getIgnoredKeys();
  if (ignoredKeys.size > 0)
    console.log(`🚫 Ignoring ${ignoredKeys.size} keys from .ignoreKeys file`);

  // Fix: Find project root first, then look for i18n folder from there
  const projectRoot = findProjectRoot();
  const configPath = path.join(projectRoot, ".auto-translation-config.json");

  const i18nFolder = findI18nFolder(projectRoot); // Pass project root instead of process.cwd()
  if (!i18nFolder) {
    console.log(`🔍 Searched from project root: ${projectRoot}`);
    console.log("❌ No i18n folder found in project!");
    console.log(`🔍 Searched from project root: ${projectRoot}`);
    return;
  }

  console.log(`✅ Found i18n folder: ${i18nFolder}`);

  console.log(`✅ Found i18n folder: ${i18nFolder}`);

  let config = {};
  let targetFile;
  let isFileBased = false;
  let currentFile = null;

  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      if (config.structureType === "file-based") {
        isFileBased = true;
        currentFile = config.currentFile;
        targetFile = path.join(config.jsonFilesPath, `${currentFile}.js`);
      } else {
        targetFile = path.join(config.jsonFilesPath, "en.json");
      }
    } catch {
      targetFile = path.join(i18nFolder, "jsonFiles", "en.json");
    }
  } else {
    // Default fallback using the found i18n folder
    targetFile = path.join(i18nFolder, "jsonFiles", "en.json");
  }

  let existingTranslations = {};
  if (fs.existsSync(targetFile)) {
    existingTranslations = isFileBased
      ? readJsExportObject(targetFile)
      : JSON.parse(fs.readFileSync(targetFile, "utf-8"));
  }

  // ---------------- Determine files to scan ----------------
  let reactFiles = [];

  if (Array.isArray(filesToScan) && filesToScan.length > 0) {
    filesToScan.forEach((file) => {
      const absPath = path.isAbsolute(file)
        ? file
        : path.join(projectRoot, file); // Use project root instead of process.cwd()
      if (fs.existsSync(absPath)) reactFiles.push(absPath);
      else console.warn(`⚠️ File not found: ${file}`);
    });

    if (reactFiles.length === 0) {
      console.error("❌ No valid files to scan. Operation cancelled.");
      return;
    }
  } else {
    // scan entire project from project root
    reactFiles = findFiles(projectRoot); // Use project root instead of process.cwd()
  }

  console.log(`📁 Found ${reactFiles.length} React/TS files to scan`);

  // ---------------- Scan files ----------------
  const tPatterns = [
    /\bt\s*\(\s*['"`]([^'"`\n\r]+?)['"`]\s*\)/g,
    /\{\s*t\s*\(\s*['"`]([^'"`\n\r]+?)['"`]\s*\)\s*\}/g,
  ];

  const allFoundKeys = new Set();
  const newKeys = new Set();
  let ignoredCount = 0;
  let filesProcessed = 0;
  const flattenedExisting = flattenObject(existingTranslations);

  reactFiles.forEach((file) => {
    try {
      const content = fs.readFileSync(file, "utf-8");
      let fileHasKeys = false;

      tPatterns.forEach((pattern) => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const key = match[1].trim();
          if (!key || allFoundKeys.has(key)) continue;
          allFoundKeys.add(key);
          fileHasKeys = true;

          if (ignoredKeys.has(key)) {
            ignoredCount++;
            console.log(`⏭️  Ignoring "${key}"`);
            continue;
          }

          if (!flattenedExisting[key]) newKeys.add(key);
        }
        pattern.lastIndex = 0;
      });

      if (fileHasKeys) filesProcessed++;
    } catch (error) {
      console.error(`❌ Error reading file ${file}:`, error.message);
    }
  });

  // ---------------- Find unused keys ----------------
  const existingKeys = new Set(Object.keys(flattenedExisting));
  const usedKeys = new Set([...allFoundKeys, ...Array.from(ignoredKeys)]);
  const unusedKeys = new Set(
    [...existingKeys].filter((key) => !usedKeys.has(key))
  );

  console.log(`🔍 Found ${unusedKeys.size} unused translation keys`);

  if (unusedKeys.size > 0) {
    console.log(`🗑️  Unused keys to be removed:`);
    unusedKeys.forEach((key) => {
      console.log(`   - ${key}`);
    });
  }

  // ---------------- Clean up unused keys ----------------
  const cleanTranslations = (obj, keysToRemove, parentKey = "") => {
    const cleaned = {};

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;

      if (keysToRemove.has(fullKey)) continue;

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const cleanedNested = cleanTranslations(value, keysToRemove, fullKey);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = value;
      }
    }

    return cleaned;
  };

  const cleanedExistingTranslations = cleanTranslations(
    existingTranslations,
    unusedKeys
  );

  // ---------------- Merge and write ----------------
  const processedTranslations = processNestedKeys(
    cleanedExistingTranslations,
    Array.from(newKeys),
    isFileBased,
    currentFile
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
      `\n✅ Translation file updated: ${path.relative(projectRoot, targetFile)}`
    );
    console.log(`📊 Files scanned: ${reactFiles.length}`);
    console.log(`📄 Files with translation keys: ${filesProcessed}`);
    console.log(`📊 Total keys found in code: ${allFoundKeys.size}`);
    console.log(`🆕 New keys added: ${newKeys.size}`);
    console.log(`🗑️  Unused keys removed: ${unusedKeys.size}`);
    console.log(`🚫 Keys ignored: ${ignoredCount}`);
    console.log(`🛡️ Active translations preserved!`);

    if (newKeys.size > 0 || unusedKeys.size > 0) {
      console.log(`\n📝 Changes Summary:`);
      if (newKeys.size > 0) {
        console.log(`   Added ${newKeys.size} new translation keys`);
      }
      if (unusedKeys.size > 0) {
        console.log(`   Removed ${unusedKeys.size} unused translation keys`);
      }
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
  // Helper: Read ignored keys from JSON file

  const projectRoot = process.cwd();
  const backupDir = path.join(projectRoot, ".auto-translation-backup");

  // Get ignored keys
  const ignoredKeys = getIgnoredKeys();
  if (ignoredKeys.size > 0) {
    console.log(
      `🚫 Will not wrap ${ignoredKeys.size} keys from .ignoreKeys file`
    );
  }

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

  //  Decide where to place libs/hooks
  const srcDir = path.join(projectRoot, "src");
  const baseDir = fs.existsSync(srcDir) ? srcDir : projectRoot;
  const hooksDir = path.join(baseDir, "libs", "hooks");
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
  let ignoredCount = 0;
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

      const generateKey = (text) => {
        // Use the original text as the key, preserving exact case and characters
        return text.trim();
      };

      const shouldWrapText = (text) => {
        const trimmed = text.trim();
        if (!trimmed || trimmed.length < 2) return false;

        // 🚫 Skip already wrapped with t() function
        if (/t\s*\(\s*['"`]/.test(trimmed)) return false;

        if (/^\d+$/.test(trimmed)) return false;
        if (/^https?:\/\//.test(trimmed)) return false;
        if (/^\$/.test(trimmed) || /\{.*\}/.test(trimmed)) return false;
        if (/^(true|false|null|undefined)$/.test(trimmed)) return false;

        // 🚫 Skip text containing emojis
        // Unicode ranges for emojis and emoticons
        const emojiRegex =
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}]|[\u{2194}-\u{2199}]|[\u{21A9}-\u{21AA}]|[\u{231A}-\u{231B}]|[\u{2328}]|[\u{23CF}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{24C2}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2660}-\u{2668}]|[\u{267B}]|[\u{267F}]|[\u{2692}-\u{2697}]|[\u{2699}]|[\u{269B}-\u{269C}]|[\u{26A0}-\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26B0}-\u{26B1}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26C8}]|[\u{26CE}-\u{26CF}]|[\u{26D1}]|[\u{26D3}-\u{26D4}]|[\u{26E9}-\u{26EA}]|[\u{26F0}-\u{26F5}]|[\u{26F7}-\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{2709}]|[\u{270A}-\u{270B}]|[\u{270C}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]/gu;

        if (emojiRegex.test(trimmed)) {
          return false;
        }

        return /[a-zA-Z]/.test(trimmed);
      };

      // Enhanced wrapper function that checks ignored keys
      const wrapWithTranslation = (text, wrapFunction) => {
        if (shouldWrapText(text)) {
          const key = generateKey(text);

          // Check if key should be ignored
          if (ignoredKeys.has(key)) {
            ignoredCount++;
            console.log(
              `  🚫 Skipping wrap for "${key}" - found in .ignoreKeys`
            );
            return null; // Don't wrap
          }

          fileWrapped++;
          return wrapFunction(key);
        }
        return null;
      };

      // Wrap JSX text between tags
      content = content.replace(/>([^<>{}\n\r]+)</g, (match, text) => {
        const wrapped = wrapWithTranslation(text, (key) => `>{t("${key}")}<`);
        return wrapped || match;
      });

      // Wrap JSX expressions {"text"}
      content = content.replace(
        /\{\s*['"`]([^'"`\n\r]+?)['"`]\s*\}/g,
        (match, text) => {
          const wrapped = wrapWithTranslation(text, (key) => `{t("${key}")}`);
          return wrapped || match;
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
          `${attr}\\s*=\\s*['"]([^'"\\n\\r]+?)['"]`,
          "g"
        );
        content = content.replace(attrPattern, (match, text) => {
          const wrapped = wrapWithTranslation(
            text,
            (key) => `${attr}={t("${key}")}`
          );
          return wrapped || match;
        });
      });

      // 🆕 Wrap Yup validation messages - FIXED VERSION with double-wrap prevention
      const yupMethods = [
        "required",
        "min",
        "max",
        "email",
        "matches",
        "oneOf",
        "notOneOf",
        "length",
        "uuid",
        "url",
        "positive",
        "negative",
        "integer",
        "lessThan",
        "moreThan",
        "when",
        "test",
      ];

      yupMethods.forEach((method) => {
        // Match patterns like .required('message'), .min(6, 'message'), etc.
        // But skip if already wrapped with t()
        const yupPattern = new RegExp(
          `\\.${method}\\s*\\([^'"]*['"]([^'"\\n\\r]+?)['"]\\s*\\)`,
          "g"
        );

        content = content.replace(yupPattern, (match, message) => {
          // Skip if the message is already wrapped with t()
          if (match.includes("t(")) {
            return match; // Return unchanged
          }

          const wrapped = wrapWithTranslation(message, (key) =>
            match.replace(`'${message}'`, `t("${key}")`)
          );
          return wrapped || match;
        });
      });

      // Also handle generic Yup string patterns like Yup.string('message')
      content = content.replace(
        /Yup\.\w+\s*\(\s*['"]([^'"\n\r]+?)['"]s*\)/g,
        (match, message) => {
          // Skip if already wrapped with t()
          if (match.includes("t(")) {
            return match; // Return unchanged
          }

          const wrapped = wrapWithTranslation(message, (key) =>
            match
              .replace(`'${message}'`, `t("${key}")`)
              .replace(`"${message}"`, `t("${key}")`)
          );
          return wrapped || match;
        }
      );

      // Add useTranslation hook inside component if missing and we wrapped something
      if (!hasUseTranslation && fileWrapped > 0) {
        // Try to find component function/arrow function
        const componentMatch = content.match(
          /(function\s+\w+\s*\([^)]*\)\s*{|const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{)/
        );

        if (componentMatch) {
          content = content.replace(
            componentMatch[0],
            componentMatch[0] + "\n  const { t } = useTranslation();"
          );
          console.log("  ➕ Added useTranslation hook inside component");
        } else {
          // If no component found, try to add at the beginning of the file after imports
          const importEndMatch = content.match(/^((?:import.*?\n)*)/m);
          if (importEndMatch) {
            content = content.replace(
              importEndMatch[1],
              importEndMatch[1] + "\nconst { t } = useTranslation();\n"
            );
            console.log("  ➕ Added useTranslation hook after imports");
          }
        }
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
        ignoredCount: ignoredCount,
      },
      null,
      2
    )
  );

  console.log(
    `\n✅ Wrap process complete! Files modified: ${totalFiles}, Text wrapped: ${totalWrapped}`
  );
  console.log(`🚫 Keys ignored during wrapping: ${ignoredCount}`);
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
// helper: find project root (where package.json is)

async function initIgnoreKeys() {
  const PROJECT_ROOT = findProjectRoot();
  const ignoreFilePath = path.join(PROJECT_ROOT, ".ignoreKeys");

  // Check if file already exists
  if (fs.existsSync(ignoreFilePath)) {
    console.log("⚠️  .ignoreKeys file already exists at project root.");
    console.log(
      "✏️  You can open it and add/remove keys, but you cannot delete or rename this file."
    );
    return;
  }

  // Initial JSON structure with example keys
  const jsonContent = {
    ignoredKeys: ["button.cancel", "header.welcome", "footer.text"],
  };

  try {
    fs.writeFileSync(
      ignoreFilePath,
      JSON.stringify(jsonContent, null, 2),
      "utf8"
    );
    console.log(
      "✅ .ignoreKeys JSON file created successfully at project root!"
    );
    console.log(
      "📝 Example ignored keys have been added. Edit the file to customize."
    );
  } catch (error) {
    console.error("❌ Failed to create .ignoreKeys file:", error.message);
  }
}

module.exports = {
  scanAndUpdateTranslations,
  wrapPlainTextWithTranslation,
  initIgnoreKeys,
};
